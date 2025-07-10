import pandas as pd
import asyncio

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException

from app.db.models import Company, Internship
from app.db.database import SessionLocal

from bs4 import BeautifulSoup

from app.scraper.config import EXCEL_PATH, STUDENT_KEYWORDS
from app.scraper.utils import is_valid_url, print_intern_dict, to_css_selector, log_and_send

class InternScraper:
    def __init__(self):
        self.db = SessionLocal()
        self.load_excel_data()

    # Destructor to ensure database connection is closed
    def __del__(self):
        if hasattr(self, 'db'):
            self.db.close()
            print("Database connection closed")
    
    def load_excel_data(self):
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
                asyncio.run(log_and_send(f"Added {company_name}"))
        
        self.db.commit()
    
    # Function to scrape all job listings from a given career URL and job class
    def get_all_jobs(self, company):
        job_titles = []
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        driver = webdriver.Chrome(options=chrome_options)
        wait = WebDriverWait(driver, timeout=20) # timeout is 20s

        try:
            if(is_valid_url(company.career_url)):
                # Navigate to the career page and wait for the job listings to load
                driver.get(company.career_url)
                try:
                    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, to_css_selector(company.job_class))))
                except TimeoutException:
                    print(f"Timeout waiting for elements with class '{company.job_class}' to load")
                
                # Get the page source and parse it with BeautifulSoup
                html_data = driver.page_source
                soup = BeautifulSoup(html_data, 'html.parser')
                job_listings = soup.find_all(class_=company.job_class)

                # temporary debug output
                job_titles = [job.text.strip().lower() for job in job_listings]
                with open('debug_output.txt', 'w', encoding='utf-8') as f:
                    for title in job_titles:
                        f.write(f"{title}\n")

        finally:
            driver.quit()
        
        return job_titles
    
    def search_student_jobs(self, job_titles, company):
        # print(f"Searching for student jobs at {company.company_name}...")
        asyncio.run(log_and_send(f"Searching for student jobs at {company.company_name}..."))
        for title in job_titles:
            for keyword in STUDENT_KEYWORDS:
                if keyword in title.lower():
                    existing = self.db.query(Internship).filter_by(
                        internship_role=title,
                        company_id=company.company_id
                    ).first()

                    if not existing:
                        new_internship = Internship(
                            internship_role = title,
                            company_id = company.company_id
                        )
                        self.db.add(new_internship)
                        # print(f"Found internship: {title} at {company.company_name}")
                        asyncio.run(log_and_send(f"Found internship: {title} at {company.company_name}"))
                    else:
                        print(f"Internship {title} already exists for {company.company_name}")  
                        asyncio.run(log_and_send(f"Internship {title} already exists for {company.company_name}"))
                    break

        try:
            self.db.commit()
        except Exception as e:
            print(f"Error committing to database: {e}")
            self.db.rollback()
    
    def scrape_internships(self):
        companies = self.db.query(Company).all()

        for company in companies:
            job_titles = self.get_all_jobs(company)
            if job_titles:
                self.search_student_jobs(job_titles, company)
                # print(f"Scraped {len(job_titles)} job titles for {company.company_name}")
                asyncio.run(log_and_send(f"Scraped {len(job_titles)} job titles for {company.company_name}"))
        
        asyncio.run(log_and_send("__SCRAPER_DONE__"))
        
    def scrape_company(self, company_id):
        company = self.db.query(Company).filter_by(company_id=company_id).first()
        if not company:
            # print(f"Company with ID {company_id} not found")
            asyncio.run(log_and_send(f"Company with ID {company_id} not found"))
            return

        job_titles = self.get_all_jobs(company)
        if job_titles:
            self.search_student_jobs(job_titles, company)
            # print(f"Scraped {len(job_titles)} job titles for {company.company_name}")
            asyncio.run(log_and_send(f"Scraped {len(job_titles)} job titles for {company.company_name}"))
        else:
            # print(f"No job titles found for {company.company_name}")
            asyncio.run(log_and_send(f"No job titles found for {company.company_name}"))

        asyncio.run(log_and_send("__SCRAPER_DONE__"))


# Temporary Main For Testing
if __name__ == "__main__":
    scraper = InternScraper()
    scraper.scrape_internships()