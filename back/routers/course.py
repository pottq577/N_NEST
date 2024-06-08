from fastapi import APIRouter, HTTPException, Query
from models import Course, DeleteCourse, Student, DeleteStudent, StudentCourses
from database import course_collection, student_collection
from typing import Dict, Optional, List,Tuple, Union
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, RedirectResponse, HTMLResponse
import logging

router = APIRouter()
# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ObjectId를 문자열로 변환하는 함수
def object_id_to_str(document):
    """
    BSON ObjectId를 문자열로 변환합니다.
    """
    if document:
        document['_id'] = str(document['_id'])
    return document


def student_helper(student) -> dict:
    return {
        "id": str(student["_id"]),
        "name": student["name"],
        "student_id": student["student_id"],
        "department": student["department"],
        "course_codes": student["course_codes"]
    }



@router.get("/courses/{course_code}", response_model=dict)
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

@router.get("/courses/")
async def get_courses():
    try:
        courses = []
        async for course in course_collection.find():
            courses.append(object_id_to_str(course))
        return courses
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    # 기존 코드 재사용

@router.post("/students", response_model=dict)
async def create_student(student: Student):
    student_data = jsonable_encoder(student)
    new_student = await student_collection.insert_one(student_data)
    created_student = await student_collection.find_one({"_id": new_student.inserted_id})
    return JSONResponse(status_code=201, content=object_id_to_str(created_student))
    # 기존 코드 재사용

@router.post("/save-courses/")
async def save_courses(courses: List[Course]):
    try:
        # 입력된 데이터를 로그에 출력
        logger.info("Received courses: %s", courses)

        course_data = [course.dict() for course in courses]
        logger.info("Course data to insert: %s", course_data)

        # Check for duplicate course codes
        existing_codes = set()
        async for doc in course_collection.find({"code": {"$in": [course["code"] for course in course_data]}}):
            existing_codes.add(doc["code"])

        if existing_codes:
            logger.info("Duplicate course codes found: %s", existing_codes)
            raise HTTPException(status_code=400, detail="Duplicate course codes found.")

        await course_collection.insert_many(course_data)
        logger.info("Courses saved successfully.")
        return {"message": f"{len(course_data)} courses saved successfully."}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error("Error: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/save-students/")
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

@router.post("/delete-courses/")
async def delete_courses(courses: List[DeleteCourse]):
    try:
        course_codes = [course.code for course in courses]
        delete_result = await course_collection.delete_many({"code": {"$in": course_codes}})
        return {"message": f"{delete_result.deleted_count} courses deleted successfully."}
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/students/")
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

@router.post("/delete-students/")
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

@router.get("/api/user-courses/{student_id}", response_model=StudentCourses)
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


# Get course by code endpoint
@router.get("/api/courses/{course_code}", response_model=Course)
async def get_course(course_code: str):
    course = await course_collection.find_one({"code": course_code})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return Course(**course)
