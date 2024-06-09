from pydantic import BaseModel, Field, EmailStr
from typing import List, Dict, Optional
from datetime import datetime
from bson import ObjectId

class UserInfo(BaseModel):
    name: str
    schoolEmail: EmailStr
    studentId: str
    age: int
    contact: str
    githubUsername: str
    githubName: str
    githubId: str

class Comment(BaseModel):
    username: str
    content: str
    timestamp: Optional[str] = None

class ProjectInfo(BaseModel):
    username: str
    project_name: str
    description: str = "No description"
    language: str = "Unknown"
    stars: int
    updated_at: str
    license: Optional[str] = "None"
    forks: int
    watchers: int
    contributors: str = "None"
    is_private: bool = False
    default_branch: str = "main"
    repository_url: str
    text_extracted: str
    summary: str
    image_preview_urls: List[str]
    generated_image_url: str
    views: int = Field(default=0)
    comments: List[Comment] = []
    student_id: str
    course: str
    course_code: str

class Config:
    arbitrary_types_allowed = True
    json_encoders = {ObjectId: str}

class Course(BaseModel):
    name: str
    professor: str
    professor_id: str
    day: str
    time: str
    code: str

class Student(BaseModel):
    name: str
    student_id: str
    department: str
    course_code: str

class DeleteCourse(BaseModel):
    code: str

class DeleteStudent(BaseModel):
    student_id: str
    course_code: str

class UserCourses(BaseModel):
    user_info: UserInfo
    courses: List[Course]

class StudentCourses(BaseModel):
    student_id: str
    name: str
    department: str
    courses: List[Course]

class Team(BaseModel):
    course_code: str
    team_name: str
    students: List[Dict[str, str]]  # 학번과 이름을 함께 저장

class EvaluationCriteria(BaseModel):
    course_code: str
    criteria: List[str]
    max_teams: int

class StudentRegistration(BaseModel):
    course_code: str
    team_name: str
    githubId: str  # 프론트엔드에서 전달받은 GitHub 아이디

class Evaluation(BaseModel):
    course_code: str
    evaluator_id: str
    team_name: str
    scores: Dict[str, int]

class TimeSlot(BaseModel):
    day: str
    time: str

class Schedule(BaseModel):
    start: Optional[str] = None
    end: Optional[str] = None
    interval: int = 30
    maxCapacity: int = 1

class AvailabilityData(BaseModel):
    email: EmailStr
    weeklySchedule: dict = Field(default_factory=dict)
    unavailableTimes: List[TimeSlot] = Field(default_factory=list)

class ReservationData(BaseModel):
    studentName: str
    professor_id: str  # 교수의 ID
    professor_name: str  # 교수의 이름
    day: str
    date: str
    time: str
    userId: str  # 학생의 ID

class ClassificationRequest(BaseModel):
    text: str

class CodeAnswer(BaseModel):
    lineNumber: int
    text: str
    userId: str
    userTitle: str = "Beginner"  # Default title
    resolved: str = "false"
    createdAt: datetime = Field(default_factory=datetime.now)

class GeneralAnswer(BaseModel):
    text: str
    userId: str
    userTitle: str = "Beginner"  # Default title
    resolved: str = "false"  # Add resolved field
    createdAt: datetime = Field(default_factory=datetime.now)


class Answer(BaseModel):
    text: str
    userId: str
    createdAt: datetime = Field(default_factory=datetime.now)

class Question(BaseModel):
    title: str
    description: str
    category: str
    customCategories: List[str]
    code: str
    userId: str
    createdAt: datetime = Field(default_factory=datetime.now)
    codeAnswers: Dict[str, List[CodeAnswer]] = {}
    generalAnswers: List[GeneralAnswer] = []

class QuestionInDB(BaseModel):
    id: str
    title: str
    description: str
    category: str
    code: str
    userId: str
    createdAt: datetime
    codeAnswers: Dict[str, List[Dict]] = {}
    generalAnswers: List[Dict] = []

class Score(BaseModel):
    studentId: str
    scores: Dict[str, float]
    titles: Dict[str, str]  # 각 카테고리별 칭호를 저장하는 필드

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class Problem(BaseModel):
    title: str
    description: str
    input_description: str
    output_description: str
    sample_input: str
    sample_output: str

class CodeSubmission(BaseModel):
    problem_id: str
    user_id: str
    code: str
    language: str


class Professor(BaseModel):
    email: EmailStr
    professor_id: str

class Config:
    arbitrary_types_allowed = True
    json_encoders = {ObjectId: str}

# 데이터 모델 정의
class ProfessorIDValidation(BaseModel):
    professor_id: str

class UserQuery(BaseModel):
    githubUsername: str

class UserResponse(BaseModel):
    name: str
    githubId: str
    studentId: str

# Data models
class Professor(BaseModel):
    email: EmailStr
    professor_id: str
