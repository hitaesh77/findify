import sys
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI
from app.api.routes import router
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.scheduler.scheduler import start_scheduler, test_scheduler, shutdown_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    test_scheduler()
    yield
    shutdown_scheduler()


app = FastAPI(lifespan=lifespan)

# app = FastAPI()

app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Findify API is live!"}

print("FastAPI app initialized and running...")