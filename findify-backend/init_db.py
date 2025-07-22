# init_db.py
from app.db.database import engine, SessionLocal
from app.db import models
from app.db.models import User

def init():
    print("Creating tables...")
    models.Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

    print("Adding initial users...")
    session = SessionLocal()
    existing_users = session.query(User).all()
    if not existing_users:
        session.add_all([
            User(user_id="admin", email="hitaesh777@gmail.com"),
            User(user_id="guest", email="findify_user@gmail.com")
        ])
        session.commit()

if __name__ == "__main__":
    init()
