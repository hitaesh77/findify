from urllib.parse import urlparse
import re
from app.scraper.log_ws import send_scraper_log

# helper functions
def is_valid_url(url):
    parsed = urlparse(url)
    # A valid URL must have a scheme (e.g., "http") and a netloc (e.g., "example.com")
    return bool(parsed.scheme) and bool(parsed.netloc)

# testing functions
def print_intern_dict(intern_dict):
    for company, jobs in intern_dict.items():
        print(f"{company}:", ", ".join(jobs) if jobs else "No student jobs found.")

def test_company_student_jobs(company, intern_dict):
    if company in intern_dict:
        print(f"{company}:", ", ".join(intern_dict[company]) if intern_dict[company] else "No student jobs found.")
    else:
        print(f"{company} not found in the dictionary.")

def escape_css_class(cls: str) -> str:
    # Escape colon and other special characters per CSS spec
    return re.sub(r'([!"#$%&\'()*+,.\/:;<=>?@\[\\\]^`{|}~])', r'\\\1', cls)

def to_css_selector(class_str: str) -> str:
    class_str = class_str.strip()
    if not class_str:
        raise ValueError("Empty class name received")
    classes = class_str.split()
    return '.' + '.'.join(escape_css_class(cls) for cls in classes)

async def log_and_send(message):
    print(message)
    if not isinstance(message, str):
        message = str(message)
    await send_scraper_log(message)