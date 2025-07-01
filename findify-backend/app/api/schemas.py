from pydantic import BaseModel

class CompanyOut(BaseModel):
    company_id: int
    company_name: str
    career_url: str
    job_class: str
    location_class: str

    class Config:
        orm_mode = True
        from_attributes = True

class CompanyIn(BaseModel):
    company_name: str
    career_url: str
    job_class: str
    location_class: str

    class Config:
        orm_mode = True
        from_attributes = True

class InternshipOut(BaseModel):
    internship_id: int
    company_name: str
    internship_role: str
    date_found: str

    class Config:
        from_attributes = True

