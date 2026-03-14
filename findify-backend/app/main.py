import sys
import asyncio
from contextlib import asynccontextmanager

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI
from app.api.routes import router
from fastapi.middleware.cors import CORSMiddleware

# --- 1. IMPORT YOUR INIT FUNCTION ---
from init_db import init 

# --- 2. SET UP THE LIFESPAN TO RUN ON STARTUP ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("--- FastAPI Startup: Initializing Database ---")
    init()  # This runs your init_db.py logic!
    # test_scheduler() # (You can uncomment this later when you need it!)
    yield
    print("--- FastAPI Shutdown ---")
    # shutdown_scheduler()

# --- 3. PASS THE LIFESPAN TO YOUR APP ---
app = FastAPI(lifespan=lifespan)

# 1. ADD MIDDLEWARE FIRST
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