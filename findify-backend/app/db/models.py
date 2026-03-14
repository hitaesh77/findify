from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Time, Boolean
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime
import uuid

class User(Base):
    __tablename__ = "users"
    user_id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String) 
    
    companies = relationship("Company", back_populates="user")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    schedules = relationship("ScrapeSchedule", back_populates="user", cascade="all, delete-orphan")

class UserSettings(Base):
    __tablename__ = "user_settings"

    setting_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.user_id"), unique=True)
    email_alerts_enabled = Column(Boolean, default=False)
    whatsapp_alerts_enabled = Column(Boolean, default=False)
    phone_number = Column(String, nullable=True)

    user = relationship("User", back_populates="settings")

class Company(Base):
    __tablename__ = "companies"

    company_id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String)
    career_url = Column(String)
    job_class = Column(String)

    user_id = Column(String, ForeignKey("users.user_id"))
    user = relationship("User", back_populates="companies")

    internships = relationship("Internship", back_populates="company")


class Internship(Base):
    __tablename__ = "internships"

    internship_id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"))
    internship_role = Column(String)
    internship_location = Column(String)
    date_found = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="internships")

class ScrapeSchedule(Base):
    __tablename__ = "scrape_schedules"

    schedule_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.user_id"))
    day_of_week = Column(String)
    time_of_day = Column(Time)

    user = relationship("User", back_populates="schedules")
