# init_db.py
from app.db.database import engine
from app.db import models

def init():
    print("Creating tables...")
    models.Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    init()
