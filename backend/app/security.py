"""Creates the first admin account so you can log in at all."""
import os

from sqlalchemy.orm import Session

from .models import User
from .security import hash_password


def create_first_admin(db: Session) -> None:
    """Runs on startup. Does nothing if any user already exists."""
    if db.query(User).first():
        return
    email = os.getenv("FIRST_ADMIN_EMAIL", "admin@hirerise.example").lower().strip()
    password = os.getenv("FIRST_ADMIN_PASSWORD", "")
    if len(password) < 8:
        print("Skipped first admin: set FIRST_ADMIN_PASSWORD (8+ characters) in .env")
        return
    db.add(User(email=email, password_hash=hash_password(password), role="admin"))
    db.commit()
    print(f"Created first admin: {email}")
