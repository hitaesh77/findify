import sys
import asyncio
from contextlib import asynccontextmanager

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

# --- 1. IMPORT YOUR INIT AND SCHEDULER FUNCTIONS ---
from init_db import init 
from app.scheduler.scheduler import start_scheduler, shutdown_scheduler

# --- 2. SET UP THE LIFESPAN TO RUN ON STARTUP ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("--- FastAPI Startup: Initializing Database ---")
    init()  # This runs your init_db.py logic!
    
    print("--- FastAPI Startup: Starting Scheduler ---")
    start_scheduler() # Boots up APScheduler and loads active user jobs from DB
    
    yield
    
    print("--- FastAPI Shutdown ---")
    shutdown_scheduler() # Gracefully shuts down the background jobs

# --- 3. PASS THE LIFESPAN TO YOUR APP ---
app = FastAPI(lifespan=lifespan)

# --- 4. ADD MIDDLEWARE FIRST ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=False,  
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)

@app.get("/")
def read_root():
    return {"message": "Findify API is live!"}

print("FastAPI app initialized and running...")