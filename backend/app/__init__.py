import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from .database import Base, SessionLocal, engine  # noqa: E402  (after load_dotenv so .env is read)
from .routers import auth  # noqa: E402
from .seed import create_first_admin  # noqa: E402

Base.metadata.create_all(bind=engine)  # creates the tables on first run

with SessionLocal() as db:
    create_first_admin(db)

app = FastAPI(title="HireRise HR API", version="0.1.0")

origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (auth,):
    app.include_router(r.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}
