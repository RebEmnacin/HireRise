from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import ChangePasswordIn, DemoLoginIn, TokenOut, UserOut
from ..seed import DEMO_ACCOUNTS, DEMO_EMAILS, demo_enabled
from ..security import (
    DUMMY_HASH, create_access_token, get_current_user, hash_password, verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenOut)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # the OAuth2 form calls the email field "username"
    user = db.query(User).filter(User.email == form.username.lower().strip()).first()

    # always run one bcrypt check, even for unknown emails, so timing doesn't reveal which emails exist
    ok = verify_password(form.password, user.password_hash if user else DUMMY_HASH)
    if not user or not ok:
        raise HTTPException(401, "Incorrect email or password")
    if not user.is_active:
        raise HTTPException(403, "This account is deactivated. Please contact HR.")

    return TokenOut(access_token=create_access_token(user.id), user=UserOut.model_validate(user))


@router.get("/demo")
def demo_status():
    """Tells the login page whether to show the "Try the demo" buttons."""
    if not demo_enabled():
        return {"enabled": False, "accounts": []}
    return {"enabled": True, "accounts": [{"key": k, "email": v["email"]} for k, v in DEMO_ACCOUNTS.items()]}


@router.post("/demo-login", response_model=TokenOut)
def demo_login(data: DemoLoginIn, db: Session = Depends(get_db)):
    """Signs a visitor into a demo account without a password. Only works when DEMO_MODE=true."""
    if not demo_enabled():
        raise HTTPException(404, "The demo is not available")
    user = db.query(User).filter(User.email == DEMO_ACCOUNTS[data.account]["email"]).first()
    if not user or not user.is_active:
        raise HTTPException(404, "The demo is not available")
    return TokenOut(access_token=create_access_token(user.id), user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.post("/change-password", status_code=204)
def change_password(data: ChangePasswordIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.email in DEMO_EMAILS:
        raise HTTPException(403, "The demo accounts cannot change their password")
    if not verify_password(data.current_password, user.password_hash):
        raise HTTPException(400, "Current password is incorrect")
    user.password_hash = hash_password(data.new_password)
    db.commit()