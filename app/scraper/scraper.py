import pandas as pd
from app.scraper.config import EXCEL_PATH

class InternScraper:
    def __init__(self,):
        self.load_excel_data()
    
    def load_excel_data(self):
        urls_df = pd.read_excel(EXCEL_PATH)
        companies = urls_df.loc[:, "company_name"].tolist()
        career_urls = urls_df.loc[:, "career_url"].tolist()
        job_classes = urls_df.loc[:, "job_class"].tolist()
        location_classes = urls_df.loc[:, "location_class"].tolist()
        print(f"Loaded {len(companies)} companies from {EXCEL_PATH}")
        print(f"career_urls: {career_urls}")
        print(f"job_classes: {job_classes}")
        print(f"location_classes: {location_classes}")




# Temporary Main For Testing
if __name__ == "__main__":
    scraper = InternScraper()
    scraper.load_excel_data()
    
