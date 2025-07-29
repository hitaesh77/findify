from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from app.db.models import ScrapeSchedule
from app.db.database import SessionLocal
from app.scraper.scraper import InternScraper
import asyncio
from pytz import utc
import time

# scheduler = BackgroundScheduler(timezone=utc)
scheduler = AsyncIOScheduler(timezone=utc)

async def run_scheduled_scrape(user_id: str):
    scraper = InternScraper()
    await scraper.initialize()
    await scraper.scrape_internships(user_id)

def schedule_scrape_job(user_id: str, day_of_week: str, hour: int, minute: int, job_id: str):
    trigger = CronTrigger(day_of_week=day_of_week, hour=hour, minute=minute)
    # Remove job if it exists
    existing_job = scheduler.get_job(job_id)
    if existing_job:
        scheduler.remove_job(job_id)
    # Add job: note func is async, apscheduler supports that with AsyncIOScheduler
    scheduler.add_job(run_scheduled_scrape, trigger, args=[user_id], id=job_id, replace_existing=True)

def update_user_schedule(user_id: str, db: SessionLocal):
    # Remove all jobs for user
    for job in scheduler.get_jobs():
        if job.id.startswith(f"{user_id}_"):
            scheduler.remove_job(job.id)

    schedules = db.query(ScrapeSchedule).filter(ScrapeSchedule.user_id == user_id).all()
    for i, sched in enumerate(schedules):
        job_id = f"{user_id}_{i}"
        schedule_scrape_job(user_id, sched.day_of_week, sched.time_of_day.hour, sched.time_of_day.minute, job_id)

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


# TESTING 
import datetime

async def test_job(user_id: str):
    now = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    print(f"[TEST JOB] Running test job for user {user_id} at {now}")

def test_scheduler_interval():
    test_user_id = "testuser"
    
    if not scheduler.running:
        scheduler.start()
    
    # Remove old test jobs if any
    for job in scheduler.get_jobs():
        if job.id.startswith(f"{test_user_id}_"):
            scheduler.remove_job(job.id)
    
    # Add job every 30 seconds
    scheduler.add_job(
        run_scheduled_scrape,
        'interval',
        seconds=30,
        args=[test_user_id],
        id=f"{test_user_id}_interval_job",
        replace_existing=True
    )
    
    print(f"Scheduled test job for user '{test_user_id}' every 30 seconds.")
