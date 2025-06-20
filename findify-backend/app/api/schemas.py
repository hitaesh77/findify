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
