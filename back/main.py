from fastapi import FastAPI, HTTPException, Query, Request, Depends, APIRouter, Response, Cookie
from fastapi.responses import JSONResponse, RedirectResponse, HTMLResponse
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, Field, HttpUrl, EmailStr
import httpx
from dotenv import load_dotenv
import os
import jwt
import asyncio
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from typing import Dict, Optional, List
import json
from bson import ObjectId
import logging
from fastapi.security import OAuth2PasswordBearer

load_dotenv()

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
db = client['N-Nest'] # 데이터베이스 선택
user_collection = db['User']
project_collection = db['Project']
course_collection = db["Course"]
student_collection = db["Student"]
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
            raise HTTPException(status_code=404, detail="Student ID not found in user data")

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
                student_dict["course_codes"] = [student_dict.pop("course_code")]
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
    result = await project_collection.insert_one(json_compatible_item_data)  # 여기에 await 추가
    if result.inserted_id:
        return {"status": "success", "document_id": str(result.inserted_id)}
    else:
        raise HTTPException(status_code=500, detail="Failed to save the document")

@app.get("/api/projects")
async def read_projects():
    projects = await db["Project"].find().to_list(100)
    return [transform_id(project) for project in projects]











# @app.get("/api/projects/{project_id}")
# async def read_project(project_id: str):
#     try:
#         project = await db["Project"].find_one({"_id": ObjectId(project_id)})
#         if project is None:
#             raise HTTPException(status_code=404, detail="Project not found")
#         # 조회수 증가
#         await db["Project"].update_one({"_id": ObjectId(project_id)}, {"$inc": {"views": 1}})
#         return transform_id(project)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

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
            raise HTTPException(status_code=500, detail="Failed to add comment")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add comment: {str(e)}")


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
        raise HTTPException(status_code=500, detail=f"Failed to fetch project: {str(e)}")







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
    github_id = user_data.get("githubId", "No GitHub ID Available")  # GitHub ID가 없는 경우를 대비한 기본값 설정
    student_id = user_data.get("studentId", "No Student ID Available")  # Student ID가 없는 경우를 대비한 기본값 설정

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
            raise HTTPException(status_code=404, detail="Student data not found")

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
        raise HTTPException(status_code=400, detail="JWT token is missing in the cookie")
    return {"jwt_token_content": jwt_token}




# JWT 토큰에서 사용자 정보 추출하는 함수
async def get_current_user(request: Request):
    jwt_token = request.cookies.get("jwtToken")
    print(jwt_token)
    if jwt_token is None:
        raise HTTPException(status_code=403, detail="Credentials are not provided.")
    try:
        payload = jwt.decode(jwt_token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        github_access_token = payload.get("github_token")  # GitHub access token을 payload에서 추출
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
            raise HTTPException(status_code=response.status_code, detail="GitHub API error")
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
            raise HTTPException(status_code=400, detail="GitHub에서 사용자 상세 정보를 가져오는데 실패")

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

        #return {"token": token, "user_info": user_info,"code": code}

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
            raise HTTPException(status_code=400, detail="Failed to get access token")

        access_token = token_response.json().get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="Access token not found")

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
            response = RedirectResponse(url="http://localhost:3000/pages/register/addInfo")
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
        raise HTTPException(status_code=404, detail="No session or token information available")

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
        raise HTTPException(status_code=404, detail="User not found")  # URL 닉네임과 세션 닉네임 불일치

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
        raise HTTPException(status_code=400, detail="User with this GitHub ID or Student ID already exists")

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
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch repositories")

        repos = response.json()
        contributors_tasks = [fetch_contributors(client, repo['contributors_url']) for repo in repos]
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
            raise HTTPException(status_code=500, detail="Failed to save evaluation")
    except Exception as e:
        print(f"Error: {e}")  # 오류 메시지를 콘솔에 출력
        raise HTTPException(status_code=500, detail=str(e))



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
