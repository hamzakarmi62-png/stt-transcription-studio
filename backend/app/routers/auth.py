import re
import uuid

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..db import create_user, get_user_by_username_or_email, public_user, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., min_length=5)
    password: str = Field(..., min_length=6)
    full_name: str = Field("", max_length=120)
    phone: str = Field("", max_length=30)
    country: str = Field("", max_length=60)


class LoginRequest(BaseModel):
    identifier: str
    password: str


EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@router.post("/register")
def register(req: RegisterRequest):
    try:
        if not EMAIL_RE.match(req.email.strip()):
            raise HTTPException(status_code=400, detail="Adresse e-mail invalide.")

        existing_username = get_user_by_username_or_email(req.username)
        if existing_username:
            raise HTTPException(status_code=400, detail="Ce nom d'utilisateur est déjà pris.")

        existing_email = get_user_by_username_or_email(req.email)
        if existing_email:
            raise HTTPException(status_code=400, detail="Cette adresse e-mail est déjà utilisée.")

        user_id = uuid.uuid4().hex[:12]
        profile = {
            "full_name": req.full_name.strip(),
            "phone": req.phone.strip(),
            "country": req.country.strip(),
        }
        user = create_user(user_id, req.username.strip(), req.email.strip(), req.password, profile)
        return {"success": True, "user": user}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur du serveur: {str(e)}")


@router.post("/login")
def login(req: LoginRequest):
    try:
        user_row = get_user_by_username_or_email(req.identifier)
        if not user_row or not verify_password(user_row["password_hash"], req.password):
            raise HTTPException(
                status_code=401,
                detail="Identifiant ou mot de passe incorrect.",
            )

        return {"success": True, "user": public_user(user_row)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur du serveur: {str(e)}")
