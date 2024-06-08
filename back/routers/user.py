from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import EmailStr
from models import UserInfo, UserQuery, UserResponse ,StudentCourses
from database import user_collection, student_collection, course_collection, professor_collection
from typing import List, Dict
from fastapi.security import OAuth2PasswordBearer
from fastapi.encoders import jsonable_encoder
from database import db
router = APIRouter()

# ObjectId를 문자열로 변환하는 함수
def transform_id(document):
    document["_id"] = str(document["_id"])
    return document


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.post("/get-user-name/", response_model=UserResponse)
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

@router.post("/api/user-courses")
async def get_user_courses(query: UserQuery):
    try:
        # 1. User 콜렉션에서 studentId 조회
        user_data = await user_collection.find_one({"githubUsername": query.githubUsername})
        if user_data:
            student_id = user_data.get("studentId")
            if not student_id:
                raise HTTPException(status_code=404, detail="Student ID not found in user data")

            # 2. Student 콜렉션에서 학생 정보 조회
            student_data = await student_collection.find_one({"student_id": student_id})
            if student_data is None:
                raise HTTPException(status_code=404, detail="Student not found")

            # 3. Course 콜렉션에서 수업 정보 조회
            course_codes = student_data.get("course_codes", [])
            courses = []
            for code in course_codes:
                course_data = await course_collection.find_one({"code": code})
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

        # GitHub 정보가 없으면 email 정보를 사용
        email = query.githubUsername
        professor_data = await professor_collection.find_one({"email": email})
        if professor_data is None:
            raise HTTPException(status_code=404, detail="Professor not found")

        professor_id = professor_data.get("professor_id")
        if not professor_id:
            raise HTTPException(status_code=404, detail="Professor ID not found in professor data")

        # 3. Course 콜렉션에서 수업 정보 조회
        courses = []
        async for course_data in course_collection.find({"professor_id": professor_id}):
            courses.append(transform_id(course_data))

        # 4. 반환할 데이터 구성
        result = {
            "name": professor_data.get("name", "No Name Available"),
            "email": professor_data.get("email", "No Email Available"),
            "professorId": professor_data.get("professor_id", "No Professor ID Available"),
            "courses": courses
        }

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/user/additional-info", response_description="Add new user info", response_model=dict)
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
