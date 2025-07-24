from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from app.db.models import ScrapeSchedule
from app.db.database import SessionLocal
from app.scraper.scraper import InternScraper
import asyncio

scheduler = BackgroundScheduler()

def start_scheduler():
    scheduler.start()
    db = SessionLocal()
    all_users = db.query(ScrapeSchedule.user_id).distinct().all()
    for (user_id,) in all_users:
        update_user_schedule(user_id, db)
    db.close()

def update_user_schedule(user_id: str, db):
    scheduler.remove_all_jobs(jobstore=user_id)

    schedules = db.query(ScrapeSchedule).filter(ScrapeSchedule.user_id == user_id).all()
    for i, sched in enumerate(schedules):
        trigger = CronTrigger(day_of_week=sched.day_of_week, hour=sched.time_of_day.hour, minute=sched.time_of_day.minute)
        scheduler.add_job(
            func=lambda uid=user_id: asyncio.run(run_scheduled_scrape(uid)),
            trigger=trigger,
            id=f"{user_id}_{i}",
            jobstore=user_id,
            replace_existing=True,
        )

async def run_scheduled_scrape(user_id):
    scraper = InternScraper()
    await scraper.initialize()
    await scraper.scrape_internships(user_id)
