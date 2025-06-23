from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.models import Company
from app.db.database import get_db
from app.api.schemas import CompanyOut, CompanyIn

router = APIRouter()

@router.get("/companies", response_model=list[CompanyOut])
def get_companies(db: Session = Depends(get_db)):
    return db.query(Company).all()

@router.post("/companies", response_model=CompanyOut)
def create_company(company: CompanyIn, db: Session = Depends(get_db)):
    existing = db.query(Company).filter(Company.company_name == company.company_name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company with this name already exists."
        )
    db_company = Company(**company.model_dump())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company