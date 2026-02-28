import sys
import os
from passlib.context import CryptContext
from app.db.database import engine, SessionLocal
from app.db import models
from app.db.models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init():
    print("--- Creating tables --")
    models.Base.metadata.create_all(bind=engine)
    print("-- Tables created successfully ---")

    print("-- Checking for initial users ---")
    session = SessionLocal()
    try:
        user_exists = session.query(User).first() 
        
        if not user_exists:
            # this is hardcoded pw fo rtestting
            hashed = pwd_context.hash("pass")
            
            session.add_all([
                User(email="hitaesh777@gmail.com", hashed_password=hashed),
                User(email="findify_user@gmail.com", hashed_password=hashed)
            ])
            session.commit()
            print(" Dev users added!")
        else:
            print(" Users already exist, skipping ")
    except Exception as e:
        print(f"Error: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    init()
