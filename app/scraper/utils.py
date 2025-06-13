from urllib.parse import urlparse

def check_valid_url(url):
    parsed = urlparse(url)
    # A valid URL must have a scheme (e.g., "http") and a netloc (e.g., "example.com")
    return bool(parsed.scheme) and bool(parsed.netloc)

