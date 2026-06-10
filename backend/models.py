from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    role: str = "applicant"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class PassportApplication(BaseModel):
    applicant_email: str
    full_name: str
    dob: str
    gender: str
    nationality: str
    address: str
    passport_type: str
    appointment_date: str

class OfficerDecision(BaseModel):
    officer_email: str
    remarks: str