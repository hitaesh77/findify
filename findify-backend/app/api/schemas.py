from pydantic import BaseModel
from datetime import datetime, time
from typing import Optional, List

class CompanyOut(BaseModel):
    company_id: int
    company_name: str
    career_url: str
    job_class: str
    user_id: str

    class Config:
        from_attributes = True

class CompanyIn(BaseModel):
    company_name: str
    career_url: str
    job_class: str

    class Config:
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

class ScheduleOut(BaseModel):
    schedule_id: int
    day_of_week: str
    time_of_day: time

    class Config:
        from_attributes = True

class SettingsUpdate(BaseModel):
    email_alerts_enabled: bool
    whatsapp_alerts_enabled: bool
    phone_number: Optional[str] = None
    run_days: List[str]
    run_hour: str
    run_minute: str

class SettingsOut(BaseModel):
    setting_id: int
    user_id: str
    email_alerts_enabled: bool
    whatsapp_alerts_enabled: bool
    phone_number: Optional[str] = None

    class Config:
        from_attributes = True