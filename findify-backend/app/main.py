from fastapi import FastAPI
from app.api.routes import router
import requests

app = FastAPI()
app.include_router(router)

@app.get("/")
def read_root():
    return {"message": "Findify API is live!"}

print("FastAPI app initialized and running...")

# print("TESTING:")
# print(print(requests.get("http://127.0.0.1:8000/").json()))