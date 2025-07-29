from fastapi import APIRouter, Depends, HTTPException, status, Body, WebSocket, WebSocketDisconnect, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from app.db.models import Company, Internship, ScrapeSchedule
from app.db.database import get_db
from app.api.schemas import CompanyOut, CompanyIn, InternshipOut, ScheduleIn
from app.scraper.scraper import InternScraper
from app.scraper.log_ws import active_connections
from app.scheduler.scheduler import update_user_schedule
# from app.scraper.utils import send_scraper_log
import asyncio
import sys
import threading

router = APIRouter()

# --------------------------------------------------------------------------------------------------------- #
# COMPANY ROUTES #
# --------------------------------------------------------------------------------------------------------- #

@router.get("/companies", response_model=list[CompanyOut])
def get_companies(user_id: str, db: Session = Depends(get_db)):
    return db.query(Company).filter(Company.user_id == user_id).all()
    # return db.query(Company).all()

@router.post("/companies", response_model=CompanyOut)
def create_company(company: CompanyIn, db: Session = Depends(get_db)):
    existing = db.query(Company).filter(
        Company.company_name == company.company_name,
        Company.user_id == company.user_id
        ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company with this name already exists."
        )
    db_company = Company(**company.model_dump())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

@router.delete("/companies/{company_id}", response_model=CompanyOut)
def delete_company(company_id: int, db: Session = Depends(get_db)):
    db_company = db.query(Company).filter(Company.company_id == company_id).first()
    if not db_company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail = "Company not found"
        )
    db.delete(db_company)
    db.commit()
    return db_company

@router.put("/companies/{company_id}", response_model=CompanyOut)
def update_company(company_id: int, company: CompanyIn, db: Session = Depends(get_db)):
    db_company = db.query(Company).filter(Company.company_id == company_id).first()
    if not db_company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    db_company.company_name = company.company_name
    db_company.career_url = company.career_url
    db_company.job_class = company.job_class

    db.commit()
    db.refresh(db_company)
    return db_company

# --------------------------------------------------------------------------------------------------------- #
# INTENRSHIP ROUTES #
# --------------------------------------------------------------------------------------------------------- #

@router.get("/internships", response_model=list[InternshipOut])
def get_internships(db: Session = Depends(get_db)):
    internships = (
        db.query(Internship)
        .options(joinedload(Internship.company))
        .order_by(Internship.company_id)
        .all()
    )
    result = []
    for internship in internships:
        result.append({
            "internship_id": internship.internship_id,
            "company_name": internship.company.company_name if internship.company else "",
            "internship_role": internship.internship_role,
            "date_found": internship.date_found.isoformat() if internship.date_found else "",
        })
    return result

# --------------------------------------------------------------------------------------------------------- #
# RUN ROUTES #
# --------------------------------------------------------------------------------------------------------- #

def run_scraper_in_thread(company_name: str):
    """Run scraper in a separate thread with its own event loop"""
    # Set the event loop policy for Windows
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    
    # Create a new event loop for this thread
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        loop.run_until_complete(run_scraper_task(company_name))
    finally:
        loop.close()

async def run_scraper_task(company_name: str):
    scraper = InternScraper()
    await scraper.initialize()

    if company_name.lower() == "all":
        await scraper.scrape_internships()
    else:
        company = scraper.db.query(Company).filter(Company.company_name == company_name).first()
        if company:
            await scraper.scrape_company(company.company_id)

@router.post("/run-scraper")
async def run_scraper(company_name: str = Body("all")):
    # Use threading instead of BackgroundTasks (tunning scraper in background)
    thread = threading.Thread(target=run_scraper_in_thread, args=(company_name,))
    thread.start()
    
    if company_name.lower() == "all":
        return {"message": "Scraper started for all companies"}
    else:
        scraper = InternScraper()
        await scraper.initialize()
        company = scraper.db.query(Company).filter(Company.company_name == company_name).first()
        if not company:
            return {"message": f"Company '{company_name}' not found"}
        return {"message": f"Scraper started for '{company_name}'"}

@router.websocket("/ws/scraper-log")
async def scraper_log_ws(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        if websocket in active_connections:
            active_connections.remove(websocket)

# --------------------------------------------------------------------------------------------------------- #
# SCHEDULE ROUTES #
# --------------------------------------------------------------------------------------------------------- #
@router.post("/schedule")
def create_schedule(schedule: ScheduleIn, db: Session = Depends(get_db)):
    db.query(ScrapeSchedule).filter(ScrapeSchedule.user_id == schedule.user_id).delete()

    new_entries = []
    for day in schedule.days:
        for time_of_day in schedule.times:
            entry = ScrapeSchedule(user_id=schedule.user_id, day_of_week=day.lower(), time_of_day=time_of_day)
            db.add(entry)
            new_entries.append(entry)
    
    db.commit()
    
    update_user_schedule(schedule.user_id, db)

    return new_entries