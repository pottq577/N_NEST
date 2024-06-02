from fastapi import FastAPI, HTTPException, Query, Request, Depends, APIRouter, Response, Cookie
from fastapi.responses import JSONResponse, RedirectResponse, HTMLResponse
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, Field, HttpUrl, EmailStr
import httpx
from dotenv import load_dotenv
from collections import Counter, defaultdict
import asyncio
import aiohttp
import subprocess
import os
import jwt
import asyncio
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from typing import Dict, Optional, List, Tuple, Union
import random
import json
from bson import ObjectId
import logging
from fastapi.security import OAuth2PasswordBearer
import google.generativeai as genai
from openai import OpenAI
import requests
import re
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


client2 = OpenAI(api_key=OPENAI_API_KEY)

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 오리진 허용
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메소드 허용
    allow_headers=["*"]   # 모든 헤더 허용
)

# 세션 미들웨어를 애플리케이션에 추가
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY", "a_very_secret_key")
)

# MongoDB 클라이언트 설정
MONGODB_URL = os.getenv("MONGODB_URL")

# MongoDB 클라이언트 생성
client = AsyncIOMotorClient(MONGODB_URL)
db = client['N-Nest']  # 데이터베이스 선택
user_collection = db['User']
questions_collection = db["questions"]
project_collection = db['Project']
course_collection = db["Course"]
student_collection = db["Student"]
course_team_collection = db["Course_team"]
evaluation_collection = db["Evaluation"]
scores_collection = db["scores"]
problems_collection = db['problems']
submissions_collection = db['submissions']
evaluation_assignment_collection = db["evaluation_assignments"]
evaluation_result_collection = db['EvaluationResult']
profile_collection = db['Profile']

# GitHub 설정
CLIENT_ID = 'Iv1.636c6226a979a74a'
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
REDIRECT_URI = 'http://localhost:8000/auth/callback'

# 데이터 모델 정의


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


# 학생 정보 모델
class UserCourses(BaseModel):
    user_info: UserInfo
    courses: List[Course]

# ObjectId를 문자열로 변환하는 헬퍼 함수


def course_helper(course) -> dict:
    return {
        "id": str(course["_id"]),
        "display_name": f"{course['name']} - {course['professor']}",
        "name": course["name"],
        "professor": course["professor"],
        "day": course["day"],
        "time": course["time"],
        "code": course["code"]
    }


def student_helper(student) -> dict:
    return {
        "id": str(student["_id"]),
        "name": student["name"],
        "student_id": student["student_id"],
        "department": student["department"],
        "course_codes": student["course_codes"]
    }


def object_id_to_str(document):
    """
    BSON ObjectId를 문자열로 변환합니다.
    """
    if document:
        document['_id'] = str(document['_id'])
    return document


@app.get("/courses/{course_code}", response_model=dict)
async def get_course_with_students(course_code: str):
    course = await course_collection.find_one({"code": course_code})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    students_cursor = student_collection.find({"course_codes": course_code})
    students = await students_cursor.to_list(length=None)  # 모든 학생을 리스트로 변환

    course = object_id_to_str(course)
    students = [object_id_to_str(student) for student in students]

    return {
        "course": course,
        "students": students
    }


@app.post("/courses", response_model=dict)
async def create_course(course: Course):
    course_data = jsonable_encoder(course)
    new_course = await course_collection.insert_one(course_data)
    created_course = await course_collection.find_one({"_id": new_course.inserted_id})
    return JSONResponse(status_code=201, content=object_id_to_str(created_course))


@app.post("/students", response_model=dict)
async def create_student(student: Student):
    student_data = jsonable_encoder(student)
    new_student = await student_collection.insert_one(student_data)
    created_student = await student_collection.find_one({"_id": new_student.inserted_id})
    return JSONResponse(status_code=201, content=object_id_to_str(created_student))


class StudentCourses(BaseModel):
    student_id: str
    name: str
    department: str
    courses: List[Course]


@app.get("/api/user-courses/{student_id}", response_model=StudentCourses)
async def get_user_courses(student_id: str):
    # Student 콜렉션에서 학생 정보 조회
    student = await student_collection.find_one({"student_id": student_id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    course_codes = student.get('course_codes', [])
    courses = []

    for code in course_codes:
        course = await course_collection.find_one({"code": code})
        if course:
            courses.append(Course(**course))

    return StudentCourses(
        student_id=student['student_id'],
        name=student['name'],
        department=student['department'],
        courses=courses
    )

#


@app.get("/api/courses/{course_code}", response_model=Course)
async def get_course(course_code: str):
    # Course 콜렉션에서 수업 정보 조회
    course = await course_collection.find_one({"code": course_code})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return Course(**course)


# ObjectId를 문자열로 변환하는 함수
def transform_id(document):
    document["_id"] = str(document["_id"])
    return document


class UserQuery(BaseModel):
    githubUsername: str


@app.post("/api/user-courses")
async def get_user_courses(query: UserQuery):
    try:
        # 1. User 콜렉션에서 studentId 조회
        user_data = await db.User.find_one({"githubUsername": query.githubUsername})
        if user_data is None:
            raise HTTPException(status_code=404, detail="User not found")

        student_id = user_data.get("studentId")
        if not student_id:
            raise HTTPException(
                status_code=404, detail="Student ID not found in user data")

        # 2. Student 콜렉션에서 학생 정보 조회
        student_data = await db.Student.find_one({"student_id": student_id})
        if student_data is None:
            raise HTTPException(status_code=404, detail="Student not found")

        # 3. Course 콜렉션에서 수업 정보 조회
        course_codes = student_data.get("course_codes", [])
        courses = []
        for code in course_codes:
            course_data = await db.Course.find_one({"code": code})
            if course_data:
                courses.append(transform_id(course_data))

        # 4. 반환할 데이터 구성
        result = {
            "name": user_data.get("name", "No Name Available"),
            "githubUsername": user_data.get("githubUsername", "No GitHub Username Available"),
            "studentId": student_data.get("student_id", "No Student ID Available"),
            "department": student_data.get("department", "No Department Available"),
            "courses": courses
        }

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 데이터 저장 엔드포인트
@app.post("/save-courses/")
async def save_courses(courses: List[Course]):
    try:
        # 데이터를 딕셔너리 형식으로 변환
        course_data = [course.dict() for course in courses]

        # 중복된 수업 코드 확인 및 필터링
        existing_codes = set()
        async for doc in course_collection.find({"code": {"$in": [course["code"] for course in course_data]}}):
            existing_codes.add(doc["code"])

        if existing_codes:
            # 중복된 수업 코드가 있는 경우 400 에러 반환
            raise HTTPException(status_code=400, detail="중복된 수업 코드가 있습니다.")

        # 새로운 데이터만 삽입
        await course_collection.insert_many(course_data)

        return {"message": f"{len(course_data)} courses saved successfully."}
    except HTTPException as e:
        raise e  # 이미 처리된 HTTPException을 그대로 다시 raise
    except Exception as e:
        print(f"Error: {str(e)}")  # 디버깅을 위한 로그 출력
        raise HTTPException(status_code=500, detail=str(e))

# 수업 목록 가져오는 엔드포인트


@app.get("/courses/")
async def get_courses():
    try:
        courses = []
        async for course in course_collection.find():
            courses.append(course_helper(course))
        return courses
    except Exception as e:
        print(f"Error: {str(e)}")  # 디버깅을 위한 로그 출력
        raise HTTPException(status_code=500, detail=str(e))

# 학생 추가 엔드포인트


@app.post("/save-students/")
async def save_students(students: List[Student]):
    try:
        new_students = []
        duplicate_students = []
        updated_students = 0

        for student in students:
            existing_student = await student_collection.find_one({"student_id": student.student_id})
            if existing_student:
                if student.course_code not in existing_student["course_codes"]:
                    await student_collection.update_one(
                        {"student_id": student.student_id},
                        {"$push": {"course_codes": student.course_code}}
                    )
                    updated_students += 1
                else:
                    duplicate_students.append(student.student_id)
            else:
                student_dict = student.dict()
                student_dict["course_codes"] = [
                    student_dict.pop("course_code")]
                new_students.append(student_dict)

        if new_students:
            await student_collection.insert_many(new_students)

        return {"message": f"{len(new_students)} new students saved successfully, {updated_students} students updated with new course codes, {len(duplicate_students)} students already existed with the same course code and were not saved."}
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# 수업 삭제 엔드포인트


@app.post("/delete-courses/")
async def delete_courses(courses: List[DeleteCourse]):
    try:
        course_codes = [course.code for course in courses]
        delete_result = await course_collection.delete_many({"code": {"$in": course_codes}})
        return {"message": f"{delete_result.deleted_count} courses deleted successfully."}
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# 학생 목록 가져오는 엔드포인트 (수업 코드로 필터링)


@app.get("/students/")
async def get_students(course_code: Optional[str] = Query(None)):
    try:
        print(f"Fetching students for course code: {course_code}")  # 디버깅 출력
        students = []
        query = {"course_codes": course_code} if course_code else {}
        async for student in student_collection.find(query):
            print(f"Found student: {student}")  # 디버깅 출력
            students.append(student_helper(student))
        return students
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# 학생 삭제 엔드포인트 (특정 수강 코드 삭제)
@app.post("/delete-students/")
async def delete_students(students: List[DeleteStudent]):
    try:
        for student in students:
            await student_collection.update_one(
                {"student_id": student.student_id},
                {"$pull": {"course_codes": student.course_code}}
            )
        return {"message": f"{len(students)} students updated successfully."}
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/save-project/")
async def save_project(project_data: ProjectInfo):
    json_compatible_item_data = jsonable_encoder(project_data)
    if "views" not in json_compatible_item_data:
        json_compatible_item_data["views"] = 0  # 기본값 설정
    # 여기에 await 추가
    result = await project_collection.insert_one(json_compatible_item_data)
    if result.inserted_id:
        return {"status": "success", "document_id": str(result.inserted_id)}
    else:
        raise HTTPException(
            status_code=500, detail="Failed to save the document")


@app.get("/api/projects")
async def read_projects():
    projects = await db["Project"].find().to_list(100)
    return [transform_id(project) for project in projects]


@app.post("/api/projects/{project_id}/comments")
async def add_comment(project_id: str, comment: Comment):
    try:
        project = await project_collection.find_one({"_id": ObjectId(project_id)})
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")

        # 댓글에 타임스탬프 추가
        comment.timestamp = datetime.datetime.now().isoformat()
        comment_dict = comment.dict()

        update_result = await project_collection.update_one(
            {"_id": ObjectId(project_id)},
            {"$push": {"comments": comment_dict}}
        )

        if update_result.modified_count == 1:
            return JSONResponse(status_code=200, content={"message": "Comment added successfully"})
        else:
            raise HTTPException(
                status_code=500, detail="Failed to add comment")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to add comment: {str(e)}")


@app.get("/api/projects/{project_id}")
async def read_project(project_id: str):
    try:
        project = await project_collection.find_one({"_id": ObjectId(project_id)})
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        # 조회수 증가
        await project_collection.update_one({"_id": ObjectId(project_id)}, {"$inc": {"views": 1}})
        return transform_id(project)
    except Exception as e:
        print(f"Failed to fetch project: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch project: {str(e)}")


# JWT 설정 ===========================================
SECRET_KEY = os.getenv("JWT_SECRET", "your_jwt_secret")
ALGORITHM = "HS256"

router = APIRouter()


class UserQuery(BaseModel):
    githubUsername: str


class UserResponse(BaseModel):
    name: str
    githubId: str
    studentId: str


@app.post("/get-user-name/", response_model=UserResponse)
async def get_user_name(query: UserQuery):
    # MongoDB의 'User' 콜렉션에서 사용자 데이터 조회
    user_data = await db.User.find_one({"githubUsername": query.githubUsername})
    if user_data is None:
        raise HTTPException(status_code=404, detail="User not found")

    # 반환 데이터에 'githubId'와 'studentId' 추가
    name = user_data.get("name", "No Name Available")  # 이름이 없는 경우를 대비한 기본값 설정
    # GitHub ID가 없는 경우를 대비한 기본값 설정
    github_id = user_data.get("githubId", "No GitHub ID Available")
    # Student ID가 없는 경우를 대비한 기본값 설정
    student_id = user_data.get("studentId", "No Student ID Available")

    return UserResponse(name=name, githubId=github_id, studentId=student_id)


@app.post("/api/user-info")
async def get_user_info(query: UserQuery):
    try:
        user_data = await db.User.find_one({"githubUsername": query.githubUsername})
        if user_data is None:
            raise HTTPException(status_code=404, detail="User not found")

        # 학번으로 학생 정보 조회
        student_data = await db.Student.find_one({"studentId": user_data["studentId"]})
        if student_data is None:
            raise HTTPException(
                status_code=404, detail="Student data not found")

        # 수업 정보 조회
        course_codes = student_data.get("course_codes", [])
        courses = []
        for code in course_codes:
            course_data = await db.Course.find_one({"code": code})
            if course_data:
                courses.append(course_data)

        # 반환할 데이터 구성
        result = {
            "name": user_data.get("name", "No Name Available"),
            "githubId": user_data.get("githubId", "No GitHub ID Available"),
            "studentId": user_data.get("studentId", "No Student ID Available"),
            "courses": courses
        }

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 각 사용자의 GitHub 로그인 이름을 저장하는 딕셔너리
user_logins: Dict[int, str] = {}


# 쿠키에서 JWT 토큰을 읽어서 해당 토큰의 내용을 반환하는 엔드포인트
@app.get("/read-cookie")
async def read_cookie(jwt_token: str = Cookie(None)):
    if jwt_token is None:
        raise HTTPException(
            status_code=400, detail="JWT token is missing in the cookie")
    return {"jwt_token_content": jwt_token}


# JWT 토큰에서 사용자 정보 추출하는 함수
async def get_current_user(request: Request):
    jwt_token = request.cookies.get("jwtToken")
    print(jwt_token)
    if jwt_token is None:
        raise HTTPException(
            status_code=403, detail="Credentials are not provided.")
    try:
        payload = jwt.decode(jwt_token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        # GitHub access token을 payload에서 추출
        github_access_token = payload.get("github_token")
        if username is None or github_access_token is None:
            raise HTTPException(status_code=403, detail="Invalid credentials")
    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid credentials")
    return {"username": username, "access_token": github_access_token}


# 사용자의 GitHub 레포지토리 정보를 가져오는 API
@app.get("/user/repositories")
async def get_user_repositories(user=Depends(get_current_user)):
    username = user["username"]
    access_token = user["access_token"]  # GitHub access token을 사용
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.github.com/users/{username}/repos",
            headers={"Authorization": f"token {access_token}"}
        )
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code, detail="GitHub API error")
        data = response.json()
        return data


@app.get("/auth/login")
async def github_login_callback(request: Request, response: Response, code: str = Query(...)):
    async with httpx.AsyncClient() as client:
        # Exchange the code for the GitHub access token
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "code": code,
                "redirect_uri": REDIRECT_URI
            },
            headers={"Accept": "application/json"}
        )
        token_response.raise_for_status()
        access_token = token_response.json().get("access_token")
        print(f"Access Token: {access_token}")  # 접근 토큰 로깅

        # GitHub API를 통해 사용자 정보 가져오기
        user_response = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        user_response.raise_for_status()

        if user_response.status_code != 200:
            raise HTTPException(
                status_code=400, detail="GitHub에서 사용자 상세 정보를 가져오는데 실패")

        user_info = user_response.json()
        print(f"GitHub User Info: {user_info}")
        # Check if user exists in the database
        user_in_db = await user_collection.find_one({"githubId": user_info['id']})
        if not user_in_db:
            raise HTTPException(status_code=404, detail="User not registered")

        # JWT 토큰 발행 (GitHub access token도 포함)
        token_data = {
            "sub": user_info["login"],
            "github_id": user_info["id"],
            "github_token": access_token,  # GitHub access token을 토큰 데이터에 추가
            "exp": datetime.now(timezone.utc) + timedelta(hours=1)
        }
        jwt_token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

        # JWT 토큰을 HTTP Only 쿠키에 저장
        response.set_cookie(
            key="jwtToken",
            value=jwt_token,
            httponly=True,
            max_age=3600,
            expires=3600,
            path='/',
            secure=True
        )
        print("JWT 토큰이 쿠키에 저장되었습니다:", jwt_token)  # 쿠키에 저장된 JWT 토큰 로깅

        user_login = user_info["login"]
        print(user_info["login"])
        print(user_login)
        # 사용자 이름을 인-메모리 딕셔너리에 저장
        user_logins[user_info["id"]] = user_info["login"]

        # If token is successfully created, redirect to the main app page
        if jwt_token:
            return RedirectResponse(url="http://localhost:3000")
        else:
            return JSONResponse(status_code=400, content={"message": "Failed to create token"})

        # return {"token": token, "user_info": user_info,"code": code}


@app.get("/user/{user_login}")
async def get_user_login(user_login: str):
    """ 저장된 사용자 이름을 반환하는 엔드포인트 """
    if user_login in user_logins:
        return {"user_login": user_logins[user_login]}
    else:
        raise HTTPException(status_code=404, detail="User not found")

# 회원가입


@app.get("/auth/callback")
async def github_auth_callback(request: Request, code: str = Query(...)):
    async with httpx.AsyncClient() as client:
        # GitHub에서 액세스 토큰을 요청합니다.
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "code": code,
                "redirect_uri": REDIRECT_URI,
            },
            headers={"Accept": "application/json"}
        )

        if token_response.status_code != 200:
            raise HTTPException(
                status_code=400, detail="Failed to get access token")

        access_token = token_response.json().get("access_token")
        if not access_token:
            raise HTTPException(
                status_code=400, detail="Access token not found")

        # GitHub에서 사용자 정보를 요청합니다.
        user_response = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        user_info = user_response.json()

        # 데이터베이스에서 사용자 확인
        user_exists = await check_user_in_database(user_info['id'])
        if user_exists:
            # 회원 정보가 있는 경우, 로그인 처리 및 대시보드로 리디렉션
            response = RedirectResponse(url="http://localhost:3000/dashboard")
        else:
            # 신규 회원인 경우, 회원가입 페이지로 리디렉션
            response = RedirectResponse(
                url="http://localhost:3000/pages/register/addInfo")
        return response


async def check_user_in_database(github_id: int):
    user = await user_collection.find_one({"github_id": github_id})
    return user is not None


@app.get("/api/session/info")
async def get_session_info(request: Request):
    user_info = request.session.get('user_info', None)
    token = request.session.get('access_token', None)
    if user_info and token:
        return {"user": user_info, "token": token}
    else:
        raise HTTPException(
            status_code=404, detail="No session or token information available")


@app.get("/api/user/status")
async def get_user_status(request: Request):
    token = request.session.get('access_token', None)
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get('sub')
            print(f"Token will expire at {payload['exp']} UTC")
            return {"logged_in": True, "user_id": user_id, "token_valid": True}
        except JWTError as e:
            print(f"Token verification failed: {str(e)}")
            return {"logged_in": True, "token_valid": False, "error": str(e)}
    return {"logged_in": False}


@app.on_event("startup")
async def startup_db_client():
    app.mongodb_client = AsyncIOMotorClient(MONGODB_URL)
    app.mongodb = app.mongodb_client['N-Nest']


@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()

# 사용 예


@app.get("/check_user/{github_id}")
async def check_user_route(github_id: int):
    exists = await check_user_in_database(github_id)
    return {"exists": exists}


@app.get("/welcome/{username}")
async def welcome(request: Request, username: str):
    # 세션에서 사용자 정보를 가져옵니다.
    session_username = request.session.get('github_username', 'Guest')
    session_name = request.session.get('github_name', 'Guest')
    if username != session_username:
        # URL 닉네임과 세션 닉네임 불일치
        raise HTTPException(status_code=404, detail="User not found")

    # HTML 응답으로 사용자의 이름과 닉네임을 표시
    return HTMLResponse(
        f"<h1>Welcome, {session_name}!</h1>"
        f"<h2>Your GitHub username is: {session_username}</h2>"
    )


@app.get("/api/session/github-info")
async def get_github_info(request: Request):
    github_info = {
        "github_username": request.session.get('github_username', 'Not available'),
        "github_name": request.session.get('github_name', 'Not available'),
        "github_id": request.session.get('github_id', 'Not available')
    }
    return JSONResponse(github_info)

# 사용자 정보를 데이터베이스에 저장


@app.post("/api/user/additional-info", response_description="Add new user info", response_model=dict)
async def add_user_info(user_info: UserInfo):
    print(user_info)
    user_info = jsonable_encoder(user_info)  # Pydantic 객체를 JSON-호환 객체로 변환

    # 이미 해당 GitHub ID 또는 학번을 가진 사용자가 있는지 확인
    existing_user = await user_collection.find_one({"$or": [{"githubId": user_info['githubId']}, {"studentId": user_info['studentId']}]})
    if existing_user:
        raise HTTPException(
            status_code=400, detail="User with this GitHub ID or Student ID already exists")

    # 사용자가 없는 경우에만 정보를 저장
    new_user = await user_collection.insert_one(user_info)
    created_user = await user_collection.find_one({"_id": new_user.inserted_id})
    if created_user is not None:
        return JSONResponse(status_code=201, content={"message": "User info saved successfully", "user_id": str(new_user.inserted_id)})
    else:
        raise HTTPException(status_code=500, detail="Failed to save user info")


@app.get("/github/{username}/repos")
async def get_github_repos(username: str, github_login: str = Depends(lambda x: user_logins.get(x, None))):
    if github_login is None:
        raise HTTPException(status_code=404, detail="GitHub login not found")

    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://api.github.com/users/{github_login}/repos")
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code,
                                detail="Failed to fetch repositories")

        repos = response.json()
        contributors_tasks = [fetch_contributors(
            client, repo['contributors_url']) for repo in repos]
        contributors_results = await asyncio.gather(*contributors_tasks)

        for repo, contributors in zip(repos, contributors_results):
            repo['contributors'] = contributors

        return repos


async def fetch_contributors(client: httpx.AsyncClient, contributors_url: str):
    response = await client.get(contributors_url)
    if response.status_code == 200:
        return response.json()
    else:
        return []  # 실패 시 빈 배열 반환

# 딕셔너리에 저장된 모든 사용자의 GitHub 로그인 이름을 반환하는 엔드포인트


@app.get("/user-logins")
async def get_user_logins():
    return JSONResponse(user_logins)


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


def convert_objectid_to_str(doc):
    if isinstance(doc, dict):
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                doc[key] = str(value)
            elif isinstance(value, list):
                doc[key] = [convert_objectid_to_str(item) for item in value]
            elif isinstance(value, dict):
                doc[key] = convert_objectid_to_str(value)
    return doc


# 학생 등록 API
@app.post("/api/teams/register")
async def register_student(student_registration: StudentRegistration):
    evaluation = await evaluation_collection.find_one({"course_code": student_registration.course_code})
    if not evaluation:
        raise HTTPException(
            status_code=404, detail="Evaluation criteria not found")

    max_teams = evaluation.get("max_teams")
    student_info = await user_collection.find_one({"githubId": student_registration.githubId})
    if not student_info:
        raise HTTPException(status_code=404, detail="Student not found")

    student_data = {
        "studentId": student_info["studentId"],
        "name": student_info["name"]
    }

    team = await course_team_collection.find_one({"course_code": student_registration.course_code})
    if not team:
        team_data = {
            "course_code": student_registration.course_code,
            "teams": []
        }
        await course_team_collection.insert_one(team_data)
        team = await course_team_collection.find_one({"course_code": student_registration.course_code})

    specific_team = next(
        (t for t in team["teams"] if t["team_name"] == student_registration.team_name), None)
    if not specific_team:
        if len(team["teams"]) >= max_teams:
            raise HTTPException(
                status_code=400, detail="Maximum number of teams reached for this course")
        specific_team = {
            "team_name": student_registration.team_name,
            "students": [student_data]
        }
        team["teams"].append(specific_team)
    else:
        if any(student["studentId"] == student_info["studentId"] for student in specific_team["students"]):
            raise HTTPException(
                status_code=400, detail="Student already registered in this team")
        specific_team["students"].append(student_data)

    await course_team_collection.update_one({"_id": team["_id"]}, {"$set": {"teams": team["teams"]}})
    return {"message": "Student registered successfully"}


# GitHub ID로 학생 정보 조회 API
@app.get("/api/students/github/{githubId}")
async def get_student_by_github(githubId: str):
    student = await user_collection.find_one({"githubId": githubId})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return convert_objectid_to_str(student)

# 평가 할당 조회 API


@app.get("/api/evaluation_assignments/{studentId}")
async def get_evaluation_assignments(studentId: str):
    # course_code는 동적으로 변경 가능
    assignments = await evaluation_assignment_collection.find_one({"course_code": "CS105"})
    if not assignments:
        raise HTTPException(
            status_code=404, detail="Evaluation assignments not found")

    student_evaluations = assignments.get("evaluations", {}).get(studentId)
    if not student_evaluations:
        raise HTTPException(
            status_code=404, detail="Evaluations not found for the student")

    return {"evaluations": student_evaluations}

# 평가 기준 조회 API


@app.get("/api/evaluations/{course_code}")
async def get_evaluation_criteria(course_code: str):
    evaluation = await evaluation_collection.find_one({"course_code": course_code})
    if not evaluation:
        raise HTTPException(
            status_code=404, detail="Evaluation criteria not found")
    return convert_objectid_to_str(evaluation)


@app.post("/api/evaluate")
async def submit_evaluation(evaluation: Evaluation):
    evaluation_result = {
        "evaluator_id": evaluation.evaluator_id,  # GitHub 아이디 대신 학번을 저장
        "scores": evaluation.scores
    }

    await evaluation_result_collection.update_one(
        {"course_code": evaluation.course_code, "team_name": evaluation.team_name},
        {"$push": {"evaluations": evaluation_result}},
        upsert=True
    )
    return {"message": "Evaluation submitted successfully"}


@app.get("/api/evaluation-results/{course_code}")
async def get_evaluation_results(course_code: str):
    results = []
    async for result in evaluation_result_collection.find({"course_code": course_code}):
        total_scores = {}
        for evaluation in result["evaluations"]:
            for criteria, score in evaluation["scores"].items():
                if criteria not in total_scores:
                    total_scores[criteria] = 0
                total_scores[criteria] += score

        total_score = sum(total_scores.values())
        results.append({
            "team_name": result["team_name"],
            "total_score": total_score
        })
    return results


@app.get("/api/evaluation-progress/{course_code}")
async def get_evaluation_progress(course_code: str):
    progress = []
    async for result in evaluation_result_collection.find({"course_code": course_code}):
        total_scores = {}
        for evaluation in result["evaluations"]:
            for criteria, score in evaluation["scores"].items():
                if criteria not in total_scores:
                    total_scores[criteria] = 0
                total_scores[criteria] += score

        progress.append({
            "team_name": result["team_name"],
            "total_scores": total_scores,
            "total_score": sum(total_scores.values())
        })
    return progress


# 평가 시작 API
@app.post("/api/start-evaluation/{course_code}")
async def start_evaluation(course_code: str):
    teams = await course_team_collection.find_one({"course_code": course_code})
    if not teams:
        raise HTTPException(
            status_code=404, detail="No teams found for the course")

    evaluations = defaultdict(list)
    for team in teams["teams"]:
        for student in team["students"]:
            available_teams = [
                t["team_name"] for t in teams["teams"] if t["team_name"] != team["team_name"]]
            evaluations[student["studentId"]] = random.sample(
                available_teams, min(3, len(available_teams)))

    for student_id, assigned_teams in evaluations.items():
        await evaluation_assignment_collection.update_one(
            {"course_code": course_code},
            {"$set": {f"evaluations.{student_id}": assigned_teams}},
            upsert=True
        )

    return {"message": "Evaluation started successfully"}

# 코스 생성 API


@app.post("/api/courses")
async def create_course(course: Course):
    course_dict = course.dict()
    result = await course_collection.insert_one(course_dict)
    return {"id": str(result.inserted_id)}

# 코스 목록 조회 API


@app.get("/api/courses")
async def get_courses():
    courses = []
    async for course in course_collection.find():
        courses.append(convert_objectid_to_str(course))
    return courses

# 코스 학생 목록 조회 API


@app.get("/api/courses/{course_code}/students")
async def get_students_by_course(course_code: str):
    students = []
    async for student in student_collection.find({"course_codes": course_code}):
        students.append(convert_objectid_to_str(student))
    return students

# 코스 팀 목록 조회 API


@app.get("/api/courses/{course_code}/teams")
async def get_teams_by_course(course_code: str):
    teams = await course_team_collection.find_one({"course_code": course_code})
    if not teams:
        raise HTTPException(
            status_code=404, detail="No teams found for the course")
    return convert_objectid_to_str(teams)

# 최대 팀 수 조회 API


@app.get("/api/courses/{course_code}/max_teams")
async def get_max_teams(course_code: str):
    evaluation = await evaluation_collection.find_one({"course_code": course_code})
    if not evaluation:
        raise HTTPException(
            status_code=404, detail="Evaluation criteria not found")
    return {"max_teams": evaluation.get("max_teams", 0)}


@app.post("/api/evaluations")
async def save_evaluation_criteria(evaluation_criteria: EvaluationCriteria):
    try:
        evaluation_dict = jsonable_encoder(evaluation_criteria)
        result = await evaluation_collection.insert_one(evaluation_dict)
        return {"message": "Evaluation criteria saved successfully", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class TimeSlot(BaseModel):
    day: str
    time: str


class Schedule(BaseModel):
    start: Optional[str] = None
    end: Optional[str] = None
    interval: int = 30
    maxCapacity: int = 1


class AvailabilityData(BaseModel):
    userId: str
    weeklySchedule: dict = Field(default_factory=dict)
    unavailableTimes: List[TimeSlot] = Field(default_factory=list)


class ReservationData(BaseModel):
    studentName: str
    userId: str
    day: str
    date: str
    time: str


@app.post("/availability/")
async def save_availability(data: AvailabilityData):
    try:
        existing_data = await db.availability.find_one({"userId": data.userId})
        if existing_data:
            await db.availability.update_one({"userId": data.userId}, {"$set": data.dict()})
        else:
            await db.availability.insert_one(data.dict())
        return {"message": "Availability settings saved successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/availability/", response_model=List[AvailabilityData])
async def get_all_availability():
    try:
        data = await db.availability.find().to_list(None)
        if data:
            return [AvailabilityData(**item) for item in data]
        else:
            raise HTTPException(
                status_code=404, detail="No availability settings found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/availability/user", response_model=AvailabilityData)
async def get_availability(userId: str = Query(...)):
    try:
        data = await db.availability.find_one({"userId": userId})
        if data:
            return AvailabilityData(**data)
        else:
            raise HTTPException(
                status_code=404, detail="No availability settings found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/reservations/")
async def get_reservations():
    try:
        reservations = await db.reservations.find().to_list(None)
        for reservation in reservations:
            reservation["_id"] = str(reservation["_id"])
        return reservations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/reservation/")
async def make_reservation(data: ReservationData):
    try:
        availability = await db.availability.find_one({"userId": data.userId})
        if not availability:
            raise HTTPException(
                status_code=404, detail="No availability settings found.")

        weekly_schedule = availability['weeklySchedule']
        unavailable_times = availability['unavailableTimes']

        if data.day not in weekly_schedule or not weekly_schedule[data.day]['start'] or not weekly_schedule[data.day]['end']:
            raise HTTPException(
                status_code=400, detail="Invalid reservation time.")

        if any(slot['day'] == data.day and slot['time'] == data.time for slot in unavailable_times):
            raise HTTPException(
                status_code=400, detail="The selected time is unavailable.")

        existing_reservations = await db.reservations.count_documents({"day": data.day, "time": data.time})
        if existing_reservations >= weekly_schedule[data.day]['maxCapacity']:
            raise HTTPException(
                status_code=400, detail="The selected time is fully booked.")

        result = await db.reservations.insert_one(data.dict())
        return {"message": "Reservation saved successfully!", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Pydantic 모델 정의
class ClassificationRequest(BaseModel):
    text: str


@app.post("/classify")
async def classify_text(request: ClassificationRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="No text provided")

    # Set the text to classify
    prompt_text = (
        "Classify the following IT-related response into categories such as backend, frontend, security, network, cloud, and others. Only assign a category if the relevance is over 80%: \n\n"
        f"'{request.text}'"
    )

    categories = ["backend", "frontend",
                  "security", "network", "cloud", "others"]
    it_terms = ["server", "api", "http", "frontend", "backend", "database",
                "network", "security", "encryption", "cloud", "storage", "virtualization"]
    results: List[str] = []

    # Query the OpenAI API three times
    for _ in range(3):
        response = client2.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system",
                    "content": "You are an AI that classifies IT-related questions."},
                {"role": "user", "content": prompt_text}
            ],
            max_tokens=60
        )

        # Analyze the model's response
        raw_response = response.choices[0].message.content.strip().lower()

        # Check if IT terms are present in the response
        if any(term in raw_response for term in it_terms):
            # Map response to category
            found_categories = [
                category for category in categories if category in raw_response]
            if found_categories:
                results.extend(found_categories)
            else:
                results.append("others")
        else:
            results.append("others")

    # Determine the most common category
    if results:
        most_common_category = Counter(results).most_common(1)[0][0]
        return {"category": most_common_category}
    else:
        return {"category": "others"}


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


titles = {
    "backend": {
        0: "Novice Backend Developer",
        10: "Intermediate Backend Developer",
        20: "Advanced Backend Developer",
        50: "Expert Backend Developer"
    },
    "frontend": {
        0: "Novice Frontend Developer",
        10: "Intermediate Frontend Developer",
        20: "Advanced Frontend Developer",
        50: "Expert Frontend Developer"
    },
    "security": {
        0: "Novice Security Specialist",
        10: "Intermediate Security Specialist",
        20: "Advanced Security Specialist",
        50: "Expert Security Specialist"
    },
    "network": {
        0: "Novice Network Engineer",
        10: "Intermediate Network Engineer",
        20: "Advanced Network Engineer",
        50: "Expert Network Engineer"
    },
    "cloud": {
        0: "Novice Cloud Engineer",
        10: "Intermediate Cloud Engineer",
        20: "Advanced Cloud Engineer",
        50: "Expert Cloud Engineer"
    },
    "others": {
        0: "Novice IT Specialist",
        10: "Intermediate IT Specialist",
        20: "Advanced IT Specialist",
        50: "Expert IT Specialist"
    }
}


def get_title(category: str, points: float) -> str:
    thresholds = sorted(titles[category].keys(), reverse=True)
    for threshold in thresholds:
        if points >= threshold:
            return titles[category][threshold]
    return "Undefined Title"


async def update_scores(student_id: str, category: str, points: float) -> Tuple[Dict[str, float], str]:
    score_doc = await scores_collection.find_one({"studentId": student_id})
    new_title = ""
    if score_doc:
        new_scores = score_doc["scores"]
        new_titles = score_doc.get("titles", {})
        if category in new_scores:
            new_scores[category] = max(0, new_scores[category] + points)
        else:
            new_scores[category] = max(0, points)
        new_title = get_title(category, new_scores[category])
        new_titles[category] = new_title
        await scores_collection.update_one(
            {"_id": score_doc["_id"]},
            {"$set": {"scores": new_scores, "titles": new_titles}}
        )
    else:
        new_scores = {category: max(0, points)}
        new_title = get_title(category, new_scores[category])
        new_titles = {category: new_title}
        new_score = Score(studentId=student_id,
                          scores=new_scores, titles=new_titles)
        await scores_collection.insert_one(new_score.dict())

    return new_scores, new_title


@app.post("/questions", response_model=QuestionInDB)
async def save_question(question: Question):
    try:
        user = await user_collection.find_one({"githubId": question.userId})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        question_dict = question.dict()
        if "codeAnswers" not in question_dict:
            question_dict["codeAnswers"] = {}
        if "generalAnswers" not in question_dict:
            question_dict["generalAnswers"] = []

        result = await questions_collection.insert_one(question_dict)
        question_dict["_id"] = str(result.inserted_id)
        return QuestionInDB(id=str(result.inserted_id), **question_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error saving question")


@app.get("/list/questions", response_model=List[QuestionInDB])
async def list_questions():
    try:
        questions = await questions_collection.find().to_list(1000)
        return [QuestionInDB(id=str(q["_id"]), **q) for q in questions]
    except Exception as e:
        print(f"Error fetching questions: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching questions")


@app.get("/questions/{id}", response_model=QuestionInDB)
async def get_question(id: str):
    try:
        question = await questions_collection.find_one({"_id": ObjectId(id)})
        if question is None:
            raise HTTPException(status_code=404, detail="Question not found")
        return QuestionInDB(id=str(question["_id"]), **question)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching question")


@app.post("/questions/{id}/answers")
async def save_code_answer(id: str, answer: CodeAnswer):
    try:
        user = await user_collection.find_one({"githubId": answer.userId})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # 기본 칭호 설정
        user_title = "Beginner"

        user_scores = await scores_collection.find_one({"studentId": user["studentId"]})
        if user_scores:
            for category, title in user_scores["titles"].items():
                user_title = title
                break

        answer.userTitle = user_title  # Set the user title for the answer

        question = await questions_collection.find_one({"_id": ObjectId(id)})
        if question is None:
            raise HTTPException(status_code=404, detail="Question not found")

        if str(answer.lineNumber) not in question["codeAnswers"]:
            question["codeAnswers"][str(answer.lineNumber)] = []

        question["codeAnswers"][str(answer.lineNumber)].append(answer.dict())

        result = await questions_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"codeAnswers": question["codeAnswers"]}}
        )

        if result.modified_count == 1:
            return {"message": "Answer added successfully"}
        else:
            raise HTTPException(status_code=500, detail="Error adding answer")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error adding answer: {str(e)}")


@app.get("/users/{user_id}/resolved-answers")
async def check_user_resolved_answers(user_id: str, questionId: str):
    question = await questions_collection.find_one({"_id": ObjectId(questionId)})
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # 사용자 ID와 resolved 상태를 체크
    has_resolved_answer = any(
        any(answer["userId"] == user_id and answer["resolved"]
            == "true" for answer in answers)
        for answers in question["codeAnswers"].values()
    )

    return {"hasResolvedAnswer": has_resolved_answer}


@app.post("/questions/{id}/general-answers")
async def save_general_answer(id: str, answer: GeneralAnswer):
    try:
        user = await user_collection.find_one({"githubId": answer.userId})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # 기본 칭호 설정
        user_title = "Beginner"

        user_scores = await scores_collection.find_one({"studentId": user["studentId"]})
        if user_scores:
            for category, title in user_scores["titles"].items():
                user_title = title
                break

        answer.userTitle = user_title  # Set the user title for the general answer

        question = await questions_collection.find_one({"_id": ObjectId(id)})
        if question is None:
            raise HTTPException(status_code=404, detail="Question not found")

        general_answer_dict = answer.dict()
        general_answer_dict["createdAt"] = datetime.now()

        question["generalAnswers"].append(general_answer_dict)

        result = await questions_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"generalAnswers": question["generalAnswers"]}}
        )

        if result.modified_count == 1:
            return {"message": "General answer added successfully"}
        else:
            raise HTTPException(
                status_code=500, detail="Error adding general answer")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error adding general answer: {str(e)}")


@app.post("/questions/{id}/general-answers/{answerIndex}/resolve")
async def toggle_resolve_general_answer(id: str, answerIndex: int):
    try:
        question = await questions_collection.find_one({"_id": ObjectId(id)})
        if question is None:
            raise HTTPException(status_code=404, detail="Question not found")

        if answerIndex < 0 or answerIndex >= len(question["generalAnswers"]):
            raise HTTPException(status_code=404, detail="Answer not found")

        answer = question["generalAnswers"][answerIndex]

        # Toggle resolved status
        answer["resolved"] = 'true' if answer["resolved"] == 'false' else 'false'

        category = question["category"]
        question_user = await user_collection.find_one({"githubId": question["userId"]})
        answer_user = await user_collection.find_one({"githubId": answer["userId"]})
        if not question_user or not answer_user:
            raise HTTPException(status_code=404, detail="User not found")

        points_change = 1 if answer["resolved"] == 'true' else -1
        question_points_change = 0.5 if answer["resolved"] == 'true' else -0.5

        answer_scores, answer_title = await update_scores(answer_user["studentId"], category, points_change)
        question_scores, question_title = await update_scores(question_user["studentId"], category, question_points_change)

        # Update answer with new title
        answer["userTitle"] = answer_title

        result = await questions_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"generalAnswers": question["generalAnswers"]}}
        )

        # Check if the user has any other resolved answers
        other_resolved_answers = any(
            ans["userId"] == answer["userId"] and ans["resolved"] == 'true'
            for ans in question["generalAnswers"]
        )

        if result.modified_count == 1:
            return {
                "message": "Answer resolve status toggled",
                "answer_user_new_title": answer_title,
                "question_user_new_title": question_title,
                "hasResolvedAnswer": other_resolved_answers
            }
        else:
            raise HTTPException(
                status_code=500, detail="Error toggling resolve status")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error toggling resolve status: {str(e)}")


@app.post("/questions/{id}/answers/{lineNumber}/{answerIndex}/resolve")
async def toggle_resolve_code_answer(id: str, lineNumber: int, answerIndex: int):
    try:
        question = await questions_collection.find_one({"_id": ObjectId(id)})
        if question is None:
            raise HTTPException(status_code=404, detail="Question not found")

        line_answers = question["codeAnswers"].get(str(lineNumber), [])
        if answerIndex < 0 or answerIndex >= len(line_answers):
            raise HTTPException(status_code=404, detail="Answer not found")

        answer = line_answers[answerIndex]

        # Toggle resolved status
        answer["resolved"] = 'true' if answer["resolved"] == 'false' else 'false'

        category = question["category"]
        question_user = await user_collection.find_one({"githubId": question["userId"]})
        answer_user = await user_collection.find_one({"githubId": answer["userId"]})
        if not question_user or not answer_user:
            raise HTTPException(status_code=404, detail="User not found")

        points_change = 1 if answer["resolved"] == 'true' else -1
        question_points_change = 0.5 if answer["resolved"] == 'true' else -0.5

        answer_scores, answer_title = await update_scores(answer_user["studentId"], category, points_change)
        question_scores, question_title = await update_scores(question_user["studentId"], category, question_points_change)

        # Update answer with new title
        answer["userTitle"] = answer_title

        # Update all answers by the same user with the new title
        for line_answers_list in question["codeAnswers"].values():
            for ans in line_answers_list:
                if ans["userId"] == answer["userId"]:
                    ans["userTitle"] = answer_title

        result = await questions_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"codeAnswers": question["codeAnswers"]}}
        )

        # Check if the user has any other resolved answers
        other_resolved_answers = any(
            any(ans["userId"] == answer["userId"]
                and ans["resolved"] == 'true' for ans in ans_list)
            for ans_list in question["codeAnswers"].values()
        )

        if result.modified_count == 1:
            return {
                "message": "Answer resolve status toggled",
                "answer_user_new_title": answer_title,
                "question_user_new_title": question_title,
                "hasResolvedAnswer": other_resolved_answers
            }
        else:
            raise HTTPException(
                status_code=500, detail="Error toggling resolve status")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error toggling resolve status: {str(e)}")


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


# Judge0 API 설정
JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com/submissions/"
JUDGE0_API_KEY = "bace70d956msh6b9a2ff9d6e6c4ep1522c0jsn3ef11ed8217a"  # 필요시 API 키를 추가하세요


languages = {
    "python": 71,
    "javascript": 63,
    # 필요한 다른 언어도 추가할 수 있습니다.
}


@app.post("/problems/")
async def create_problem(problem: Problem):
    problem_dict = problem.dict()
    result = await problems_collection.insert_one(problem_dict)
    return {"id": str(result.inserted_id)}


@app.get("/problems/")
async def get_problems():
    problems = await problems_collection.find().to_list(1000)
    for problem in problems:
        problem["_id"] = str(problem["_id"])
    return problems


@app.get("/problems/{problem_id}")
async def get_problem(problem_id: str):
    problem = await problems_collection.find_one({"_id": ObjectId(problem_id)})
    if problem:
        problem["_id"] = str(problem["_id"])
        return problem
    raise HTTPException(status_code=404, detail="Problem not found")


@app.post("/submissions/")
async def submit_code(submission: CodeSubmission):
    logger.info(f"Received submission: {submission}")
    language_id = languages.get(submission.language.lower())
    if not language_id:
        raise HTTPException(status_code=400, detail="Language not supported.")

    problem = await problems_collection.find_one({"_id": ObjectId(submission.problem_id)})
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    submission_data = {
        "source_code": submission.code,
        "language_id": language_id,
    }

    headers = {
        "Content-Type": "application/json",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        "X-RapidAPI-Key": JUDGE0_API_KEY
    }

    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(JUDGE0_API_URL, json=submission_data, headers=headers) as response:
                if response.status != 201:
                    logger.error(
                        f"Error submitting code: {response.status} {response.reason}")
                    raise HTTPException(
                        status_code=500, detail="Error submitting code.")
                result = await response.json()
                token = result['token']
                logger.info(f"Code submitted successfully. Token: {token}")

                result_url = f"{JUDGE0_API_URL}{token}"
                while True:
                    async with session.get(result_url, headers=headers) as result_response:
                        result_data = await result_response.json()
                        if result_response.status == 200 and result_data.get("status", {}).get("description") != "In Queue":
                            # 제출된 코드의 출력과 문제의 예상 출력을 비교
                            is_correct = result_data['stdout'].strip(
                            ) == problem['sample_output'].strip()
                            result_data['is_correct'] = is_correct

                            submission_record = {
                                "problem_id": submission.problem_id,
                                "user_id": submission.user_id,
                                "code": submission.code,
                                "language": submission.language,
                                "result": result_data,
                            }
                            await submissions_collection.insert_one(submission_record)
                            logger.info(f"Submission result: {result_data}")
                            return result_data
                        await asyncio.sleep(1)
        except Exception as e:
            logger.error(f"Exception occurred: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Error executing code: {e}")


@app.get("/submissions/{submission_id}")
async def get_submission(submission_id: str):
    submission = await submissions_collection.find_one({"_id": ObjectId(submission_id)})
    if submission:
        submission["_id"] = str(submission["_id"])
        return submission
    raise HTTPException(status_code=404, detail="Submission not found")


evaluate_collection = db["Evaluate_Professor"]  # 컬렉션 이름


class EvaluationDetail(BaseModel):
    category: str
    summary: Optional[str]
    score: float
    description: Optional[str]


class Evaluation(BaseModel):
    project_id: str
    username: str
    student_id: str
    course_code: str
    evaluations: List[EvaluationDetail]


@app.post("/api/projects/evaluate", response_description="Save project evaluation")
async def save_evaluation(evaluation: Evaluation):
    evaluation_data = jsonable_encoder(evaluation)
    try:
        result = await evaluate_collection.insert_one(evaluation_data)
        if result.inserted_id:
            return JSONResponse(status_code=201, content={"message": "Evaluation saved successfully"})
        else:
            raise HTTPException(
                status_code=500, detail="Failed to save evaluation")
    except Exception as e:
        print(f"Error: {e}")  # 오류 메시지를 콘솔에 출력
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
