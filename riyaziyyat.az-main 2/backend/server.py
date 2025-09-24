from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class Student(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    surname: str
    email: str
    pass_: str = Field(alias="pass")
    group: str
    class_: str = Field(alias="class")
    parentContact: str
    status: str = "active"

class Group(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str

class Question(BaseModel):
    question: str
    type: str  # "multiple-choice" or "free-form"
    options: Optional[List[str]] = None
    correctAnswer: str
    imageUrl: Optional[str] = None

class Exam(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    questionsCount: int
    groups: List[str]
    startTime: str
    endTime: str
    pointsPerQuestion: int
    status: str = "upcoming"  # upcoming, live, finished
    questions: List[Question]

class Submission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    examId: str
    studentId: str
    answers: Dict[str, str]
    submittedAt: str
    cheatingDetected: bool = False
    score: Optional[int] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    userType: str  # "teacher" or "student"
    user: Optional[Dict[str, Any]] = None
    message: str

# Auth endpoints
@api_router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    # Check teacher credentials
    if request.email == "Anar" and request.password == "Anar2025":
        return LoginResponse(
            success=True,
            userType="teacher",
            user={"name": "Dr. Anar Hüseynov", "username": "anar.huseynov"},
            message="Giriş uğurludur"
        )
    
    # Check student credentials from localStorage data
    # In a real app, this would check the database
    students_data = await db.students.find().to_list(1000)
    
    for student_doc in students_data:
        student = Student(**student_doc)
        if student.email == request.email and student.pass_ == request.password:
            if student.status == "disabled":
                return LoginResponse(
                    success=False,
                    userType="student",
                    user=None,
                    message="Hesabınız deaktiv edilib."
                )
            return LoginResponse(
                success=True,
                userType="student", 
                user=student.dict(by_alias=True),
                message="Giriş uğurludur"
            )
    
    return LoginResponse(
        success=False,
        userType="",
        user=None,
        message="İstifadəçi adı və ya şifrə yanlışdır."
    )

# Student management endpoints
@api_router.get("/students", response_model=List[Student])
async def get_students():
    students = await db.students.find().to_list(1000)
    return [Student(**student) for student in students]

@api_router.post("/students", response_model=Student)
async def create_student(student: Student):
    student_dict = student.dict(by_alias=True)
    await db.students.insert_one(student_dict)
    return student

@api_router.put("/students/{student_id}", response_model=Student)
async def update_student(student_id: str, student: Student):
    student_dict = student.dict(by_alias=True)
    await db.students.replace_one({"id": student_id}, student_dict)
    return student

@api_router.delete("/students/{student_id}")
async def delete_student(student_id: str):
    result = await db.students.delete_one({"id": student_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": "Student deleted successfully"}

# Group management endpoints
@api_router.get("/groups", response_model=List[str])
async def get_groups():
    groups = await db.groups.find().to_list(1000)
    return [group["name"] for group in groups]

@api_router.post("/groups")
async def create_group(group: Group):
    group_dict = group.dict()
    await db.groups.insert_one(group_dict)
    return {"message": "Group created successfully"}

@api_router.delete("/groups/{group_name}")
async def delete_group(group_name: str):
    # Check if any students are in this group
    students_in_group = await db.students.find({"group": group_name}).to_list(1)
    if students_in_group:
        raise HTTPException(status_code=400, detail="Cannot delete group with students")
    
    result = await db.groups.delete_one({"name": group_name})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Group not found")
    return {"message": "Group deleted successfully"}

# Exam management endpoints
@api_router.get("/exams", response_model=List[Exam])
async def get_exams():
    exams = await db.exams.find().to_list(1000)
    return [Exam(**exam) for exam in exams]

@api_router.get("/exams/{exam_id}", response_model=Exam)
async def get_exam(exam_id: str):
    exam = await db.exams.find_one({"id": exam_id})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    return Exam(**exam)

@api_router.post("/exams", response_model=Exam)
async def create_exam(exam: Exam):
    exam_dict = exam.dict()
    await db.exams.insert_one(exam_dict)
    return exam

@api_router.delete("/exams/{exam_id}")
async def delete_exam(exam_id: str):
    result = await db.exams.delete_one({"id": exam_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    # Also delete related submissions
    await db.submissions.delete_many({"examId": exam_id})
    return {"message": "Exam deleted successfully"}

# Submission endpoints
@api_router.get("/submissions", response_model=List[Submission])
async def get_submissions():
    submissions = await db.submissions.find().to_list(1000)
    return [Submission(**submission) for submission in submissions]

@api_router.get("/submissions/exam/{exam_id}", response_model=List[Submission])
async def get_exam_submissions(exam_id: str):
    submissions = await db.submissions.find({"examId": exam_id}).to_list(1000)
    return [Submission(**submission) for submission in submissions]

@api_router.post("/submissions", response_model=Submission)
async def create_submission(submission: Submission):
    submission_dict = submission.dict()
    await db.submissions.insert_one(submission_dict)
    return submission

@api_router.get("/cheating-reports")
async def get_cheating_reports():
    submissions = await db.submissions.find({"cheatingDetected": True}).to_list(1000)
    reports = []
    
    for submission in submissions:
        student = await db.students.find_one({"id": submission["studentId"]})
        exam = await db.exams.find_one({"id": submission["examId"]})
        
        if student and exam:
            reports.append({
                "id": submission["id"],
                "studentName": f"{student['name']} {student['surname']}",
                "group": student["group"],
                "examTitle": exam["title"],
                "submittedAt": submission["submittedAt"]
            })
    
    return reports

@api_router.delete("/cheating-reports/{submission_id}")
async def remove_cheating_flag(submission_id: str):
    result = await db.submissions.update_one(
        {"id": submission_id},
        {"$set": {"cheatingDetected": False}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"message": "Cheating flag removed"}

# Initialize data endpoint
@api_router.post("/init-data")
async def initialize_data():
    # Check if data already exists
    student_count = await db.students.count_documents({})
    if student_count > 0:
        return {"message": "Data already initialized"}
    
    # Initialize students
    initial_students = [
        {
            "id": "1",
            "name": "Nijat",
            "surname": "Qəsynli", 
            "email": "nijatqəsynli59",
            "pass": "nijat123",
            "group": "10(1,3)",
            "class": "10a",
            "parentContact": "+994501234567",
            "status": "active"
        },
        {
            "id": "2", 
            "name": "Aynur",
            "surname": "Məmmədova",
            "email": "aynur.mammadova",
            "pass": "aynur123",
            "group": "10(1,3)", 
            "class": "10a",
            "parentContact": "+994501234568",
            "status": "active"
        },
        {
            "id": "3",
            "name": "Fuad", 
            "surname": "Əliyev",
            "email": "fuad.aliyev",
            "pass": "fuad123",
            "group": "11S",
            "class": "11a", 
            "parentContact": "+994501234569",
            "status": "disabled"
        }
    ]
    
    # Initialize groups
    initial_groups = [
        {"id": "1", "name": "10(1,3)"},
        {"id": "2", "name": "11S"}, 
        {"id": "3", "name": "9A"},
        {"id": "4", "name": "10B"}
    ]
    
    # Initialize exams
    initial_exams = [
        {
            "id": "exam1",
            "title": "Quiz",
            "description": "Bacarıqlarınızın qiymətləndirilməsi.",
            "questionsCount": 1,
            "groups": ["10(1,3)"],
            "startTime": "2025-09-21T23:44:00",
            "endTime": "2025-09-22T00:44:00",
            "pointsPerQuestion": 10,
            "status": "live",
            "questions": [
                {
                    "question": "x² + 5x + 6 = 0 tənliyinin köklərini tapın",
                    "type": "multiple-choice",
                    "options": ["x = -2, x = -3", "x = 2, x = 3", "x = -1, x = -6", "x = 1, x = 6"],
                    "correctAnswer": "x = -2, x = -3",
                    "imageUrl": None
                }
            ]
        },
        {
            "id": "exam2", 
            "title": "3",
            "description": "Bacarıqlarınızın qiymətləndirilməsi.",
            "questionsCount": 1,
            "groups": ["10(1,3)"],
            "startTime": "2025-09-23T10:00:00", 
            "endTime": "2025-09-23T12:00:00",
            "pointsPerQuestion": 10,
            "status": "upcoming",
            "questions": [
                {
                    "question": "İnteqralı hesablayın: ∫x²dx",
                    "type": "free-form", 
                    "correctAnswer": "x³/3 + C",
                    "imageUrl": None
                }
            ]
        }
    ]
    
    # Initialize submissions
    initial_submissions = [
        {
            "id": "sub1",
            "examId": "exam1", 
            "studentId": "1",
            "answers": {"0": "x = -2, x = -3"},
            "submittedAt": "2025-09-21T23:45:38",
            "cheatingDetected": False,
            "score": 0
        }
    ]
    
    await db.students.insert_many(initial_students)
    await db.groups.insert_many(initial_groups)
    await db.exams.insert_many(initial_exams)
    await db.submissions.insert_many(initial_submissions)
    
    return {"message": "Data initialized successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()