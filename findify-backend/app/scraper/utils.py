from urllib.parse import urlparse

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