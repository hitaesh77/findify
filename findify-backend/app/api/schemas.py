from pydantic import BaseModel
from datetime import datetime, time

class CompanyOut(BaseModel):
    company_id: int
    company_name: str
    career_url: str
    job_class: str
    user_id: str

    class Config:
        # orm_mode = True
        from_attributes = True

class CompanyIn(BaseModel):
    company_name: str
    career_url: str
    job_class: str
    user_id: str

    class Config:
        # orm_mode = True
        from_attributes = True

class InternshipOut(BaseModel):
    internship_id: int
    company_name: str
    internship_role: str
    date_found: datetime

    class Config:
        from_attributes = True

class ScheduleIn(BaseModel):
    user_id: str
    days: list[str]
    times: list[time]

    class Config:
        from_attributes = True