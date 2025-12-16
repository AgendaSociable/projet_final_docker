from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import Base, engine, SessionLocal
from models import User

Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       
    allow_credentials=True,
    allow_methods=["*"],         
    allow_headers=["*"],      
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UserCreate(BaseModel):
    name: str

@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@app.post("/users")
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    user = User(name=user_in.name, counter=0)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post("/users/{user_id}/increment")
def increment_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.counter += 1
    db.commit()
    db.refresh(user)
    return user