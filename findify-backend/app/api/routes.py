from fastapi import APIRouter, Depends, HTTPException, status, Body, WebSocket, WebSocketDisconnect, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from passlib.context import CryptContext
import asyncio
import sys
import threading
import jwt                                    
from datetime import datetime, timedelta  
import os
from dotenv import load_dotenv
from fastapi.security import OAuth2PasswordBearer
from fastapi.security import OAuth2PasswordRequestForm

# Import your existing models, plus User
from app.db.models import Company, Internship, ScrapeSchedule, User
from app.db.database import get_db
from app.api.schemas import CompanyOut, CompanyIn, InternshipOut, ScheduleIn
from app.scraper.scraper import InternScraper
from app.scraper.log_ws import active_connections
from app.scheduler.scheduler import update_user_schedule

router = APIRouter()
load_dotenv() 

# --------------------------------------------------------------------------------------------------------- #
# AUTHENTICATION ROUTES #
# --------------------------------------------------------------------------------------------------------- #

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256") 
ACCESS_TOKEN_EXPIRE = int(os.getenv("ACCESS_TOKEN_EXPIRE", 7))
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
            
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired! Please log in again.")
    except jwt.InvalidTokenError:
        raise credentials_exception
    user = db.query(User).filter(User.user_id == user_id_str).first()
    if user is None:
        raise credentials_exception
    return user

class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/register")
def register_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email already registered"
        )

    hashed_password = pwd_context.hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "user_id": new_user.user_id}

@router.post("/login")
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == form_data.username).first()
    if not db_user or not pwd_context.verify(form_data.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Incorrect email or password"
        )
    token_data = {"sub": str(db_user.user_id)} 
    access_token = create_access_token(data=token_data)
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "message": "Login successful", 
        "user_id": db_user.user_id,   
        "email": db_user.email
    }

# --------------------------------------------------------------------------------------------------------- #
# COMPANY ROUTES #
# --------------------------------------------------------------------------------------------------------- #

@router.get("/companies", response_model=list[CompanyOut])
def get_companies(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Company).filter(Company.user_id == current_user.user_id).all()

@router.post("/companies", response_model=CompanyOut)
def create_company(company: CompanyIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Company).filter(
        Company.company_name == company.company_name,
        Company.user_id == current_user.user_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a company with this name."
        )
        
    company_data = company.model_dump()
    company_data['user_id'] = current_user.user_id 
    db_company = Company(**company_data)
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

@router.delete("/companies/{company_id}", response_model=CompanyOut)
def delete_company(company_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_company = db.query(Company).filter(
        Company.company_id == company_id,
        Company.user_id == current_user.user_id
    ).first()
    
    if not db_company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found or you do not have permission to delete it."
        )  
    db.delete(db_company)
    db.commit()
    return db_company

@router.put("/companies/{company_id}", response_model=CompanyOut)
def update_company(company_id: int, company: CompanyIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_company = db.query(Company).filter(
        Company.company_id == company_id,
        Company.user_id == current_user.user_id
    ).first()
    
    if not db_company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found or you do not have permission to update it."
        )

    db_company.company_name = company.company_name
    db_company.career_url = company.career_url
    db_company.job_class = company.job_class
    db.commit()
    db.refresh(db_company)
    return db_company

# --------------------------------------------------------------------------------------------------------- #
# INTERNSHIP ROUTES #
# --------------------------------------------------------------------------------------------------------- #

@router.get("/internships", response_model=list[InternshipOut])
def get_internships(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    internships = (
        db.query(Internship).join(Company).filter(Company.user_id == current_user.user_id).options(joinedload(Internship.company)).order_by(Internship.company_id).all()
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
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    
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
async def run_scraper(company_name: str = Body("all"),db: Session = Depends(get_db),current_user: User = Depends(get_current_user) ):
    if company_name.lower() != "all":
        company = db.query(Company).filter(Company.company_name == company_name,Company.user_id == current_user.user_id).first()
        if not company:
            return {"message": f"Company '{company_name}' not found or you don't have permission to scrape it."}
    thread = threading.Thread(target=run_scraper_in_thread, args=(company_name,))
    thread.start()
    
    if company_name.lower() == "all":
        return {"message": "Scraper started for all companies"}
    else:
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
def create_schedule(schedule: ScheduleIn, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    db.query(ScrapeSchedule).filter(ScrapeSchedule.user_id == current_user.user_id).delete()

    new_entries = []
    for day in schedule.days:
        for time_of_day in schedule.times:
            entry = ScrapeSchedule(
                user_id=current_user.user_id, 
                day_of_week=day.lower(), 
                time_of_day=time_of_day
            )
            db.add(entry)
            new_entries.append(entry)
            
    db.commit()
    update_user_schedule(current_user.user_id, db)
    return new_entries