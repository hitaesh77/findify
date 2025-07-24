from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Time
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    user_id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    
    companies = relationship("Company", back_populates="user")

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

    user = relationship("User")
