from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import (
    users_collection,
    applications_collection,
    documents_collection,
    ocr_collection,
    flags_collection,
    qr_tokens_collection,
    entry_logs_collection,
    queue_collection
)
from models import UserRegister, UserLogin, PassportApplication, OfficerDecision
from auth import hash_password, verify_password, create_token
from bson import ObjectId
from datetime import datetime
from pathlib import Path
import shutil
import os
import easyocr
import re
import qrcode
import uuid


app = FastAPI(title="PassSeva API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://pass-seva.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
QR_DIR = BASE_DIR / "qr_codes"
QR_DIR.mkdir(exist_ok=True)

app.mount(
    "/qr_codes",
    StaticFiles(directory=str(QR_DIR)),
    name="qr_codes"
)



def extract_dob(text):
    pattern = r"\d{2}[/-]\d{2}[/-]\d{4}"
    match = re.search(pattern, text)
    if match:
        return match.group()
    return None


def normalize_date(date_str):
    if not date_str:
        return ""
    return date_str.replace("/", "-").strip()


@app.get("/")
def home():
    return {"message": "PassSeva backend is running"}


@app.post("/register")
def register(user: UserRegister):
    existing_user = users_collection.find_one({"email": user.email})

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = {
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "password": hash_password(user.password),
        "role": user.role
    }

    result = users_collection.insert_one(new_user)

    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id)
    }


@app.post("/login")
def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid password")

    token = create_token({
        "user_id": str(db_user["_id"]),
        "email": db_user["email"],
        "role": db_user["role"]
    })

    return {
        "message": "Login successful",
        "token": token,
        "role": db_user["role"],
        "name": db_user["name"],
        "email": db_user["email"]
    }


@app.post("/applications")
def create_application(application: PassportApplication):
    new_application = {
        "applicant_email": application.applicant_email,
        "full_name": application.full_name,
        "dob": application.dob,
        "gender": application.gender,
        "nationality": application.nationality,
        "address": application.address,
        "passport_type": application.passport_type,
        "appointment_date": application.appointment_date,
        "status": "Submitted"
    }

    result = applications_collection.insert_one(new_application)

    return {
        "message": "Application submitted successfully",
        "application_id": str(result.inserted_id)
    }


@app.get("/applications/{email}")
def get_user_applications(email: str):
    applications = []

    for app_data in applications_collection.find({"applicant_email": email}):
        app_data["_id"] = str(app_data["_id"])
        applications.append(app_data)

    return applications


@app.get("/applications")
def get_applications():
    applications = []

    for app_data in applications_collection.find():
        app_data["_id"] = str(app_data["_id"])
        applications.append(app_data)

    return applications


@app.post("/upload-document")
async def upload_document(
    application_id: str = Form(...),
    document_type: str = Form(...),
    file: UploadFile = File(...)
):
    allowed_types = ["image/jpeg", "image/png", "application/pdf"]

    application = applications_collection.find_one(
        {"_id": ObjectId(application_id)}
    )

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    blocked_statuses = [
        "OCR Completed",
        "Under Verification",
        "Verified",
        "Rejected",
        "QR Generated",
        "Checked-In"
    ]

    if application.get("status") in blocked_statuses:
        raise HTTPException(
            status_code=400,
            detail="Documents cannot be uploaded after verification process has started"
        )

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, and PDF files are allowed"
        )

    upload_folder = "uploads"
    os.makedirs(upload_folder, exist_ok=True)

    file_path = f"{upload_folder}/{datetime.now().timestamp()}_{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    document_data = {
        "application_id": application_id,
        "document_type": document_type,
        "file_name": file.filename,
        "file_path": file_path,
        "content_type": file.content_type,
        "status": "Uploaded",
        "uploaded_at": datetime.now()
    }

    result = documents_collection.insert_one(document_data)

    applications_collection.update_one(
        {"_id": ObjectId(application_id)},
        {"$set": {"status": "Documents Uploaded"}}
    )

    return {
        "message": "Document uploaded successfully",
        "document_id": str(result.inserted_id),
        "file_path": file_path
    }


@app.post("/extract-ocr/{document_id}")
def extract_ocr(document_id: str):
    document = documents_collection.find_one({"_id": ObjectId(document_id)})

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    existing_ocr = ocr_collection.find_one({
    "application_id": document["application_id"],
    "document_type": document["document_type"]
})

    if existing_ocr:
        return {
            "message": "OCR already completed for this document",
            "ocr_id": str(existing_ocr["_id"]),
            "extracted_text": existing_ocr["extracted_text"]
        }

    file_path = document["file_path"]

    if not (
        file_path.endswith(".jpg")
        or file_path.endswith(".jpeg")
        or file_path.endswith(".png")
    ):
        raise HTTPException(
            status_code=400,
            detail="OCR currently supports images only"
        )

    reader = easyocr.Reader(["en"], gpu=False)
    results = reader.readtext(file_path)

    extracted_text = ""
    for result in results:
        extracted_text += result[1] + " "

    ocr_data = {
        "document_id": document_id,
        "application_id": document["application_id"],
        "document_type": document["document_type"],
        "extracted_text": extracted_text
    }

    inserted = ocr_collection.insert_one(ocr_data)

    applications_collection.update_one(
        {"_id": ObjectId(document["application_id"])},
        {"$set": {"status": "OCR Completed"}}
    )

    return {
        "message": "OCR completed",
        "ocr_id": str(inserted.inserted_id),
        "extracted_text": extracted_text
    }


@app.post("/verify-application/{application_id}")
def verify_application(application_id: str):
    application = applications_collection.find_one({"_id": ObjectId(application_id)})

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    if application.get("verification_result") in ["Passed", "Needs Officer Review"]:
        existing_flags = []
        for flag in flags_collection.find({"application_id": application_id}):
            flag["_id"] = str(flag["_id"])
            existing_flags.append(flag)
            
        return {
        "message": "Verification already completed",
        "final_result": application.get("verification_result"),
        "checks": application.get("verification_checks", []),
        "flags_found": len(existing_flags),
        "flags": existing_flags}

    ocr_data = ocr_collection.find_one({"application_id": application_id})

    if not ocr_data:
        raise HTTPException(
            status_code=404,
            detail="OCR data not found. Please run OCR first."
        )

    flags_collection.delete_many({"application_id": application_id})

    flags = []
    checks = []

    form_dob = application.get("dob", "")
    extracted_dob = extract_dob(ocr_data.get("extracted_text", ""))

    if extracted_dob:
        if normalize_date(form_dob) == normalize_date(extracted_dob):
            checks.append({
                "field": "dob",
                "status": "passed",
                "form_value": form_dob,
                "ocr_value": extracted_dob,
                "message": "DOB matched successfully"
            })
        else:
            flag = {
                "application_id": application_id,
                "field": "dob",
                "form_value": form_dob,
                "ocr_value": extracted_dob,
                "severity": "critical",
                "message": "DOB mismatch found"
            }

            inserted_flag = flags_collection.insert_one(flag)
            flag["_id"] = str(inserted_flag.inserted_id)

            flags.append(flag)

            checks.append({
                "field": "dob",
                "status": "failed",
                "form_value": form_dob,
                "ocr_value": extracted_dob,
                "message": "DOB mismatch found"
            })
    else:
        flag = {
            "application_id": application_id,
            "field": "dob",
            "form_value": form_dob,
            "ocr_value": "Not detected",
            "severity": "warning",
            "message": "DOB could not be detected from OCR text"
        }

        inserted_flag = flags_collection.insert_one(flag)
        flag["_id"] = str(inserted_flag.inserted_id)

        flags.append(flag)

        checks.append({
            "field": "dob",
            "status": "warning",
            "form_value": form_dob,
            "ocr_value": "Not detected",
            "message": "DOB could not be detected"
        })

    form_name = application.get("full_name", "").lower()
    ocr_text = ocr_data.get("extracted_text", "").lower()

    if form_name and form_name in ocr_text:
        checks.append({
            "field": "full_name",
            "status": "passed",
            "form_value": application.get("full_name", ""),
            "ocr_value": application.get("full_name", ""),
            "message": "Name found in uploaded document"
        })
    else:
        flag = {
            "application_id": application_id,
            "field": "full_name",
            "form_value": application.get("full_name", ""),
            "ocr_value": "Not clearly found in OCR text",
            "severity": "warning",
            "message": "Name not clearly found in uploaded document"
        }

        inserted_flag = flags_collection.insert_one(flag)
        flag["_id"] = str(inserted_flag.inserted_id)

        flags.append(flag)

        checks.append({
            "field": "full_name",
            "status": "warning",
            "form_value": application.get("full_name", ""),
            "ocr_value": "Not clearly found",
            "message": "Name not clearly found in uploaded document"
        })

    final_result = "Passed" if len(flags) == 0 else "Needs Officer Review"

    applications_collection.update_one(
        {"_id": ObjectId(application_id)},
        {
            "$set": {
                "status": "Under Verification",
                "verification_result": final_result,
                "verification_checks": checks
            }
        }
    )

    return {
        "message": "Verification complete",
        "final_result": final_result,
        "checks": checks,
        "flags_found": len(flags),
        "flags": flags
    }


@app.get("/officer/applications")
def officer_applications():
    applications = []

    for app_data in applications_collection.find():
        app_data["_id"] = str(app_data["_id"])
        applications.append(app_data)

    return applications


@app.get("/application/{application_id}/flags")
def get_application_flags(application_id: str):
    flags = []

    for flag in flags_collection.find({"application_id": application_id}):
        flag["_id"] = str(flag["_id"])
        flags.append(flag)

    return flags


@app.post("/application/{application_id}/approve")
def approve_application(application_id: str, decision: OfficerDecision):
    result = applications_collection.update_one(
        {"_id": ObjectId(application_id)},
        {
            "$set": {
                "status": "Verified",
                "officer_remarks": decision.remarks,
                "verified_by": decision.officer_email
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")

    return {"message": "Application approved successfully"}


@app.post("/application/{application_id}/reject")
def reject_application(application_id: str, decision: OfficerDecision):
    result = applications_collection.update_one(
        {"_id": ObjectId(application_id)},
        {
            "$set": {
                "status": "Rejected",
                "officer_remarks": decision.remarks,
                "verified_by": decision.officer_email
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")

    return {"message": "Application rejected successfully"}


@app.get("/application/{application_id}/documents")
def get_application_documents(application_id: str):
    documents = []

    for doc in documents_collection.find({"application_id": application_id}):
        doc["_id"] = str(doc["_id"])
        documents.append(doc)

    return documents


@app.post("/generate-qr/{application_id}")
def generate_qr(application_id: str):
    application = applications_collection.find_one({"_id": ObjectId(application_id)})

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    if application.get("status") not in ["Verified", "QR Generated"]:
        raise HTTPException(
            status_code=400,
            detail="QR can be generated only after application is Verified"
        )

    existing_token = qr_tokens_collection.find_one({
        "application_id": application_id,
        "status": "Active"
    })

    if existing_token:
        return {
            "message": "QR already generated",
            "token": existing_token["token"],
            "qr_path": existing_token["qr_path"]
        }

    token = str(uuid.uuid4())

    qr_path = QR_DIR / f"{application_id}.png"
    qr_url = f"qr_codes/{application_id}.png"

    qr_img = qrcode.make(token)
    qr_img.save(qr_path)

    qr_data = {
        "application_id": application_id,
        "applicant_email": application.get("applicant_email"),
        "token": token,
        "qr_path": qr_url,
        "status": "Active",
        "created_at": datetime.now()
    }

    qr_tokens_collection.insert_one(qr_data)

    applications_collection.update_one(
        {"_id": ObjectId(application_id)},
        {"$set": {"status": "QR Generated"}}
    )

    return {
        "message": "QR generated successfully",
        "token": token,
        "qr_path": qr_url
    }


def assign_queue(application_id):
    existing_queue = queue_collection.find_one(
        {"application_id": application_id}
    )

    if existing_queue:
        return existing_queue

    total_queue_count = queue_collection.count_documents({})

    queue_number = f"A-{total_queue_count + 1:03d}"
    counter_number = (total_queue_count % 4) + 1

    people_ahead = queue_collection.count_documents({"status": "Waiting"})
    estimated_wait_time = people_ahead * 5

    queue_data = {
        "application_id": application_id,
        "queue_number": queue_number,
        "counter_number": counter_number,
        "estimated_wait_time": estimated_wait_time,
        "status": "Waiting",
        "assigned_at": datetime.now()
    }

    queue_collection.insert_one(queue_data)

    return queue_data


@app.post("/verify-qr/{token}")
def verify_qr(token: str):
    qr_token = qr_tokens_collection.find_one({
        "token": token,
        "status": "Active"
    })

    if not qr_token:
        raise HTTPException(
            status_code=404,
            detail="Invalid or expired QR token"
        )

    application_id = qr_token["application_id"]

    application = applications_collection.find_one({"_id": ObjectId(application_id)})

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    entry_log = {
        "application_id": application_id,
        "applicant_email": qr_token["applicant_email"],
        "token": token,
        "entry_time": datetime.now(),
        "status": "Entry Verified"
    }

    entry_logs_collection.insert_one(entry_log)

    qr_tokens_collection.update_one(
        {"token": token},
        {
            "$set": {
                "status": "Used",
                "used_at": datetime.now()
            }
        }
    )

    applications_collection.update_one(
        {"_id": ObjectId(application_id)},
        {"$set": {"status": "Checked-In"}}
    )

    queue_data = assign_queue(application_id)

    return {
        "message": "QR verified successfully. Applicant checked in and queue assigned.",
        "application_id": application_id,
        "applicant_name": application.get("full_name"),
        "status": "Checked-In",
        "queue_number": queue_data["queue_number"],
        "counter_number": queue_data["counter_number"],
        "estimated_wait_time": queue_data["estimated_wait_time"]
    }


@app.get("/application/{application_id}/queue")
def get_application_queue(application_id: str):
    queue_data = queue_collection.find_one({"application_id": application_id})

    if not queue_data:
        return {
            "queue_found": False,
            "message": "Queue not assigned yet"
        }

    return {
        "queue_found": True,
        "queue_number": queue_data["queue_number"],
        "counter_number": queue_data["counter_number"],
        "estimated_wait_time": queue_data["estimated_wait_time"],
        "status": queue_data["status"]
    }


@app.get("/admin/stats")
def admin_stats():
    total_applications = applications_collection.count_documents({})

    submitted = applications_collection.count_documents({"status": "Submitted"})
    documents_uploaded = applications_collection.count_documents({"status": "Documents Uploaded"})
    ocr_completed = applications_collection.count_documents({"status": "OCR Completed"})
    under_verification = applications_collection.count_documents({"status": "Under Verification"})
    verified = applications_collection.count_documents({"status": "Verified"})
    rejected = applications_collection.count_documents({"status": "Rejected"})
    qr_generated = applications_collection.count_documents({"status": "QR Generated"})
    checked_in = applications_collection.count_documents({"status": "Checked-In"})

    total_documents = documents_collection.count_documents({})
    total_flags = flags_collection.count_documents({})
    total_qr_tokens = qr_tokens_collection.count_documents({})
    total_entry_logs = entry_logs_collection.count_documents({})
    total_queue_entries = queue_collection.count_documents({})

    queue_entries = list(queue_collection.find({}))

    if len(queue_entries) > 0:
        total_wait_time = sum(entry.get("estimated_wait_time", 0) for entry in queue_entries)
        average_wait_time = total_wait_time / len(queue_entries)
    else:
        average_wait_time = 0

    return {
        "total_applications": total_applications,
        "submitted": submitted,
        "documents_uploaded": documents_uploaded,
        "ocr_completed": ocr_completed,
        "under_verification": under_verification,
        "verified": verified,
        "rejected": rejected,
        "qr_generated": qr_generated,
        "checked_in": checked_in,
        "total_documents": total_documents,
        "total_flags": total_flags,
        "total_qr_tokens": total_qr_tokens,
        "total_entry_logs": total_entry_logs,
        "total_queue_entries": total_queue_entries,
        "average_wait_time": round(average_wait_time, 2)
    }