from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class Company(Base):
    __tablename__ = "companies"

    company_id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String)
    career_url = Column(String)
    job_class = Column(String)
    location_class = Column(String)

    internships = relationship("Internship", back_populates="company")


class Internship(Base):
    __tablename__ = "internships"

    internship_id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"))
    internship_role = Column(String)
    internship_location = Column(String)
    date_found = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="internships")
