"""Creates the first admin account so you can log in at all."""
import os
import secrets
from datetime import date

from sqlalchemy.orm import Session

from .models import Department, Employee, User
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


# ---------------------------------------------------------------------------------------------
# Demo accounts (optional). They exist only when DEMO_MODE=true in .env, so a visitor can click
# "Try the demo" on the login page without anyone publishing a password.
#   - they get a random password nobody knows, so signing in with a typed password is impossible
#   - the only way in is POST /api/auth/demo-login
#   - the roles are hr and employee, never admin
# ---------------------------------------------------------------------------------------------
DEMO_ACCOUNTS = {
    "hr": {
        "email": "demo.hr@hirerise.example", "role": "hr", "no": "DEMO-0001",
        "first": "Ana", "last": "Dela Cruz", "position": "HR Manager", "dept": "People Ops",
    },
    "employee": {
        "email": "demo.employee@hirerise.example", "role": "employee", "no": "DEMO-0002",
        "first": "Marco", "last": "Santos", "position": "Software Engineer", "dept": "Engineering",
    },
}
DEMO_EMAILS = {a["email"] for a in DEMO_ACCOUNTS.values()}


def demo_enabled() -> bool:
    return os.getenv("DEMO_MODE", "").strip().lower() in ("1", "true", "yes", "on")


def create_demo_accounts(db: Session) -> None:
    """Runs on startup. Safe to run again: it creates what is missing and resets the roles."""
    if not demo_enabled():
        return
    # the employee rows are made in this order, so on a fresh database they get ids 1 and 2,
    # which are Ana and Marco in the frontend's sample data (see stores/hr.js)
    for acc in DEMO_ACCOUNTS.values():
        user = db.query(User).filter(User.email == acc["email"]).first()
        if not user:
            user = User(email=acc["email"], password_hash=hash_password(secrets.token_urlsafe(32)), role=acc["role"])
            db.add(user)
            db.flush()  # gives the user an id
        user.role = acc["role"]  # whatever happened before, a demo account never becomes admin
        user.is_active = True
        if not user.employee:
            dept = db.query(Department).filter(Department.name == acc["dept"]).first()
            if not dept:
                dept = Department(name=acc["dept"])
                db.add(dept)
                db.flush()
            db.add(Employee(
                user_id=user.id, employee_no=acc["no"], first_name=acc["first"], last_name=acc["last"],
                position=acc["position"], department_id=dept.id, status="active", hire_date=date(2022, 1, 3),
            ))
            db.flush()
    db.commit()