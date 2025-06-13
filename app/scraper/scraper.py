import pandas as pd
from collections import defaultdict
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
from bs4 import BeautifulSoup
from app.scraper.config import EXCEL_PATH, STUDENT_KEYWORDS

class InternScraper:
    def __init__(self):
        self.job_titles = []
        self.master_intern_dict = defaultdict(list)
        self.load_excel_data()
    
    def load_excel_data(self):
        urls_df = pd.read_excel(EXCEL_PATH)
        self.companies = urls_df.loc[:, "company_name"].tolist()
        self.career_urls = urls_df.loc[:, "career_url"].tolist()
        self.job_classes = urls_df.loc[:, "job_class"].tolist()
        location_classes = urls_df.loc[:, "location_class"].tolist()
        print(f"Loaded {len(self.companies)} companies from {EXCEL_PATH}")
        print(f"career_urls: {self.career_urls}")
        print(f"job_classes: {self.job_classes}")
        print(f"location_classes: {location_classes}")
    
    # Function to scrape all job listings from a given career URL and job class
    def get_all_jobs(self, career_url, job_class):
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        driver = webdriver.Chrome(options=chrome_options)
        wait = WebDriverWait(driver, timeout=20) # timeout is 20s

        try:
            # Navigate to the career page and wait for the job listings to load
            driver.get(career_url)
            try:
                wait.until(EC.presence_of_element_located((By.CLASS_NAME, job_class)))
            except TimeoutException:
                print(f"Timeout waiting for elements with class '{job_class}' to load")
            
            # Get the page source and parse it with BeautifulSoup
            html_data = driver.page_source
            soup = BeautifulSoup(html_data, 'html.parser')
            job_listings = soup.find_all(class_=job_class)

            # temporary debug output
            self.job_titles = [job.text.strip().lower() for job in job_listings]
            with open('debug_output.txt', 'w', encoding='utf-8') as f:
                for title in self.job_titles:
                    f.write(f"{title}\n")
            print(f"Found {len(self.job_titles)} job listings on {career_url} with class '{job_class}'")

        finally:
            driver.quit()
    
    def search_student_jobs(self, job_titles, company):
        for title in job_titles:
            for keyword in STUDENT_KEYWORDS:
                if keyword in title.lower():
                    self.master_intern_dict[company].append(title)
                    break
    
    def print_test(self):
        print(f"Testing URL: {self.career_urls[0]} with job class: {self.job_classes[0]}")
        self.get_all_jobs(self.career_urls[0], self.job_classes[0])
        self.search_student_jobs(self.job_titles, self.companies[0])
        print(f"Master Intern Dictionary: {self.master_intern_dict}")




# Temporary Main For Testing
if __name__ == "__main__":
    scraper = InternScraper()
    scraper.print_test()
