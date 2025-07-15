import pandas as pd
import asyncio
from playwright.async_api import async_playwright

from app.db.models import Company, Internship
from app.db.database import SessionLocal

from bs4 import BeautifulSoup

from app.scraper.config import EXCEL_PATH, STUDENT_KEYWORDS
from app.scraper.utils import is_valid_url, log_and_send

from app.notifications.email import send_email

import os
from dotenv import load_dotenv

load_dotenv()

class InternScraper:
    def __init__(self):
        self.db = SessionLocal()

    # Destructor to ensure database connection is closed
    def __del__(self):
        if hasattr(self, 'db'):
            self.db.close()
            print("Database connection closed")

    async def initialize(self):
        await self.load_excel_data()
    
    async def load_excel_data(self):
        urls_df = pd.read_excel(EXCEL_PATH)
        for i in range(len(urls_df)):
            company_name = urls_df.loc[i, "company_name"]
            career_url = urls_df.loc[i, "career_url"]
            job_class = urls_df.loc[i, "job_class"]
            location_class = urls_df.loc[i, "location_class"]

            # Check if company already exists
            existing = self.db.query(Company).filter_by(company_name=company_name).first()
            if not existing:
                new_company = Company(
                    company_name=company_name,
                    career_url=career_url,
                    job_class=job_class,
                    location_class=location_class
                )
                self.db.add(new_company)
                # print(f"Added {company_name}")
                await log_and_send(f"Added {company_name}")
        
        self.db.commit()
    
    # Function to scrape all job listings from a given career URL and job class
    async def get_all_jobs(self, company):
        job_titles = []
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            try:
                if is_valid_url(company.career_url):
                    await page.goto(company.career_url, wait_until='networkidle')
                    job_selector = f".{company.job_class.replace(' ', '.')}"

                    try:
                        await page.wait_for_selector(job_selector, timeout=20000)
                    except Exception as e:
                        print(f"Timeout waiting for elements with class '{company.job_class}' to load: {e}")
                        return job_titles
                    
                    html_content = await page.content()
                    soup = BeautifulSoup(html_content, 'html.parser')
                    job_listings = soup.find_all(class_=company.job_class)
                    
                    # Extract job titles
                    job_titles = [job.text.strip().lower() for job in job_listings]
                    
                    # Debug output
                    with open('debug_output.txt', 'w', encoding='utf-8') as f:
                        for title in job_titles:
                            f.write(f"{title}\n")
                            
            except Exception as e:
                print(f"Error scraping {company.company_name}: {e}")
            finally:
                await browser.close()
        
        return job_titles
    
    async def search_student_jobs(self, job_titles, company):
        await log_and_send(f"Searching for student jobs at {company.company_name}...")

        scraped_set = set()

        for title in job_titles:
            for keyword in STUDENT_KEYWORDS:
                if keyword in title.lower():
                    # existing = self.db.query(Internship).filter_by(
                    #     internship_role=title,
                    #     company_id=company.company_id
                    # ).first()

                    # if not existing:
                    #     new_internship = Internship(
                    #         internship_role = title,
                    #         company_id = company.company_id
                    #     )
                        # self.db.add(new_internship)
                    scraped_set.add(title)
                    await log_and_send(f"Found internship: {title} at {company.company_name}")
                    
                    # else:
                    #     # print(f"Internship {title} already exists for {company.company_name}")  
                    #     await log_and_send(f"Internship {title} already exists for {company.company_name}")
                    break
        
        db_set = self.db.query(Internship.internship_role).filter_by(company_id=company.company_id).all()
        db_set = {internship.internship_role for internship in db_set}

        new_internships = scraped_set - db_set
        deleted_internships = db_set - scraped_set

        # print("new:", new_internships)
        # print("old:", deleted_internships)

        for internship in new_internships:
            new_internship = Internship(
                internship_role=internship,
                company_id=company.company_id
            )
            self.db.add(new_internship)
            await log_and_send(f"Added new internship: {internship} at {company.company_name}")
        
        for internship in deleted_internships:
            existing_internship = self.db.query(Internship).filter_by(
                internship_role=internship,
                company_id=company.company_id
            ).first()
            if existing_internship:
                self.db.delete(existing_internship)
                await log_and_send(f"Deleted internship: {internship} at {company.company_name}")

        try:
            self.db.commit()
        except Exception as e:
            print(f"Error committing to database: {e}")
            self.db.rollback()
        
        return {
            "company": company.company_name,
            "new": list(new_internships),
            "removed": list(deleted_internships)
        }
    
    async def scrape_internships(self):
        all_changes = []

        companies = self.db.query(Company).all()

        for company in companies:
            job_titles = await self.get_all_jobs(company)
            if job_titles:
                changes = await self.search_student_jobs(job_titles, company)
                all_changes.append(changes)
                await log_and_send(f"Scraped {len(job_titles)} job titles for {company.company_name}")
        
        summary = []
        for change in all_changes:
            if change["new"] or change["removed"]:
                summary.append(f"{change['company']}\n"
                            f" - {len(change['new'])} added\n"
                            f" - {len(change['removed'])} removed")

        if summary:
            await log_and_send("Internship Scrape Summary:\n" + "\n\n".join(summary))
            send_email(
                subject="Internship Scrape Summary",
                body="Internship Scrape Summary:\n" + "\n\n".join(summary),
                to_email=os.getenv("TEST_EMAIL")
            )

        else:
            await log_and_send("No internship changes found.")
            send_email(
                subject="No Internship Changes Found",
                body="No new or removed internships were found during the scrape.",
                to_email=os.getenv("TEST_EMAIL")
            )
                
        await log_and_send("__SCRAPER_DONE__")
        
    async def scrape_company(self, company_id):
        company = self.db.query(Company).filter_by(company_id=company_id).first()
        if not company:
            await log_and_send(f"Company with ID {company_id} not found")
            return

        job_titles = await self.get_all_jobs(company)
        if job_titles:
            changes = await self.search_student_jobs(job_titles, company)
            await log_and_send(f"Scraped {len(job_titles)} job titles for {company.company_name}")

            summary = []
            if changes["new"] or changes["removed"]:
                summary.append(f"{changes['company']}\n"
                            f" - {len(changes['new'])} added\n"
                            f" - {len(changes['removed'])} removed")
            
            if summary:
                await log_and_send("Internship Scrape Summary:\n" + "\n\n".join(summary))
                send_email(
                    subject="Internship Scrape Summary",
                    body="Internship Scrape Summary for {company.company_name}:\n" + "\n\n".join(summary),
                    to_email=os.getenv("TEST_EMAIL")
                )
            
            else:
                await log_and_send("No internship changes found.")
                send_email(
                    subject="No Internship Changes Found",
                    body="No new or removed internships were found during the scrape for {company.company_name}.",
                    to_email=os.getenv("TEST_EMAIL")
                )

        else:
            await log_and_send(f"No job titles found for {company.company_name}")


        await log_and_send("__SCRAPER_DONE__")


# Temporary Main For Testing
if __name__ == "__main__":
    scraper = InternScraper()
    # asyncio.run(scraper.scrape_internships())
    asyncio.run(scraper.scrape_company(9))