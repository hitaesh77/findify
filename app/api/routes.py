from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.models import Company
from app.db.database import get_db
from app.api.schemas import CompanyOut

router = APIRouter()

@router.get("/companies", response_model=list[CompanyOut])
def get_companies(db: Session = Depends(get_db)):
    return db.query(Company).all()
