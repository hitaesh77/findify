from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from app.db.models import ScrapeSchedule
from app.db.database import SessionLocal
from app.scraper.scraper import InternScraper
from pytz import utc

# 1. Kept as UTC for now!
scheduler = AsyncIOScheduler(timezone=utc)

async def run_scheduled_scrape(user_id: str):
    scraper = InternScraper()
    await scraper.initialize()
    await scraper.scrape_internships(user_id)

def update_user_schedule(user_id: str, db: SessionLocal):
    job_id = f"scrape_job_{user_id}"
    
    # 1. Remove existing job for this user to start fresh
    if scheduler.get_job(job_id):
        scheduler.remove_job(job_id)

    schedules = db.query(ScrapeSchedule).filter(ScrapeSchedule.user_id == user_id).all()
    
    # 2. Handle the Empty State (User deselected all days)
    if not schedules:
        print(f"Scheduler paused for {user_id}: No active run days.")
        return

    # 3. Combine multiple DB rows into a SINGLE cron string
    # e.g., ["mon", "wed", "fri"] -> "mon,wed,fri"
    run_days = [sched.day_of_week for sched in schedules]
    cron_days = ",".join(run_days)  
    
    schedule_time = schedules[0].time_of_day

    # 4. Create the unified trigger using UTC
    trigger = CronTrigger(
        day_of_week=cron_days,
        hour=schedule_time.hour,
        minute=schedule_time.minute,
        timezone=utc
    )
    
    # 5. Add the single job
    scheduler.add_job(
        run_scheduled_scrape, 
        trigger=trigger, 
        args=[user_id], 
        id=job_id, 
        replace_existing=True
    )
    print(f"Scheduled scraping for {user_id} on days: {cron_days} at {schedule_time.strftime('%H:%M')} UTC")

def start_scheduler():
    if not scheduler.running:
        scheduler.start()

    db = SessionLocal()
    users = db.query(ScrapeSchedule.user_id).distinct().all()
    for (user_id,) in users:
        update_user_schedule(user_id, db)
    db.close()

def shutdown_scheduler():
    if scheduler.running:
        scheduler.shutdown()

# --- TESTING LOGIC ---
import datetime

async def test_job(user_id: str):
    now = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    print(f"[TEST JOB] Running test job for user {user_id} at {now}")

def test_scheduler_interval():
    test_user_id = "testuser"
    
    if not scheduler.running:
        scheduler.start()
    
    job_id = f"{test_user_id}_interval_job"
    if scheduler.get_job(job_id):
        scheduler.remove_job(job_id)
    
    scheduler.add_job(
        run_scheduled_scrape, 
        'interval',
        seconds=30,
        args=[test_user_id],
        id=job_id,
        replace_existing=True
    )
    print(f"Scheduled test job for user '{test_user_id}' every 30 seconds.")