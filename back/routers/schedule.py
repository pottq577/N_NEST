from fastapi import APIRouter, HTTPException, Query
from models import AvailabilityData, ReservationData, ProfessorIDValidation, Professor
from database import availability_collection, reservations_collection, course_collection,professor_collection
from fastapi.responses import JSONResponse
from typing import Dict, Optional, List,Tuple, Union
from pydantic import EmailStr
import logging
from database import db
from bson import ObjectId
from fastapi.encoders import jsonable_encoder
router = APIRouter()

# ObjectId를 문자열로 변환하는 함수
def object_id_to_str(document):
    """
    BSON ObjectId를 문자열로 변환합니다.
    """
    if document:
        document['_id'] = str(document['_id'])
    return document

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def get_professor_id_by_email(email: str) -> Optional[str]:
    professor = await professor_collection.find_one({"email": email})
    if professor:
        return professor.get("professor_id")
    return None

async def get_course_by_professor_id(professor_id: str):
    course = await course_collection.find_one({"professor_id": professor_id})
    if course:
        return course.get("professor")
    return None

@router.post("/availability/")
async def save_availability(data: AvailabilityData):
    try:
        professor_id = await get_professor_id_by_email(data.email)
        if not professor_id:
            raise HTTPException(status_code=404, detail="Professor not found")

        course = await get_course_by_professor_id(professor_id)
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        data_dict = data.dict()
        data_dict["userId"] = professor_id
        existing_data = await availability_collection.find_one({"userId": professor_id})
        if existing_data:
            await availability_collection.update_one({"userId": professor_id}, {"$set": data_dict})
        else:
            await availability_collection.insert_one(data_dict)
        return {"message": "Availability settings saved successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/availability/user", response_model=AvailabilityData)
async def get_availability(userId: str = Query(...)):
    try:
        data = await availability_collection.find_one({"userId": userId})
        if data:
            return AvailabilityData(**data)
        else:
            raise HTTPException(status_code=404, detail="No availability settings found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/availability/userp", response_model=AvailabilityData)
async def get_availability(email: str = Query(...)):
    try:
        data = await db.availability.find_one({"email": email})
        if data:
            return AvailabilityData(**data)
        else:
            raise HTTPException(status_code=404, detail="No availability settings found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    # 기존 코드 재사용

@router.get("/reservations/user")
async def get_user_reservations(user_id: str):
    try:
        reservations = await db.reservations.find({"studentUserId": user_id}).to_list(None)
        for reservation in reservations:
            reservation["_id"] = str(reservation["_id"])
            logging.info(f"Reservation found: {reservation}")

            # 교수 정보를 course 컬렉션에서 조회
            professor_course = await db.Course.find_one({"professor_id": reservation["userId"]})
            logging.info(f"Professor course data: {professor_course}")

            if professor_course:
                reservation["professor_name"] = professor_course.get("professor", "No Name Available")
            else:
                reservation["professor_name"] = "No Name Available"
        return reservations
    except Exception as e:
        logging.error(f"Error fetching user reservations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reservations/")
async def get_reservations():
    try:
        reservations = await reservations_collection.find().to_list(None)
        for reservation in reservations:
            reservation["_id"] = str(reservation["_id"])
        return reservations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reservation/")
async def make_reservation(data: ReservationData):
    try:
        availability = await availability_collection.find_one({"userId": data.userId})
        if not availability:
            raise HTTPException(status_code=404, detail="No availability settings found.")

        weekly_schedule = availability['weeklySchedule']
        unavailable_times = availability['unavailableTimes']

        if data.day not in weekly_schedule or not weekly_schedule[data.day]['start'] or not weekly_schedule[data.day]['end']:
            raise HTTPException(status_code=400, detail="Invalid reservation time.")

        if any(slot['day'] == data.day and slot['time'] == data.time for slot in unavailable_times):
            raise HTTPException(status_code=400, detail="The selected time is unavailable.")

        existing_reservations = await reservations_collection.count_documents({"day": data.day, "time": data.time})
        if existing_reservations >= weekly_schedule[data.day]['maxCapacity']:
            raise HTTPException(status_code=400, detail="The selected time is fully booked.")

        result = await reservations_collection.insert_one(data.dict())
        return {"message": "Reservation saved successfully!", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/professors/available")
async def get_available_professors():
    professors = []
    async for availability in availability_collection.find():
        professor_id = availability.get("userId")

        professor = await professor_collection.find_one({"professor_id": professor_id})
        if not professor:
            continue

        course = await course_collection.find_one({"professor_id": professor_id})
        professor_name = course.get("professor", "No Name Available") if course else "No Name Available"

        professor_data = {
            "professor_id": professor_id,
            "email": professor.get("email"),
            "name": professor_name
        }
        professors.append(professor_data)
    print(professors)  # 로깅 추가
    return professors



def course_helper(course) -> dict:
    return {
        "id": str(course["_id"]),
        "name": course["name"],
        "professor": course["professor"],
        "professor_id": course["professor_id"],
        "day": course["day"],
        "time": course["time"],
        "code": course["code"]
    }

# 교수 ID 검증을 위한 엔드포인트
@router.post("/validate-professor-id/")
async def validate_professor_id(professor: ProfessorIDValidation):
    logger.info(f"Received request to validate professor ID: {professor}")
    existing_course = await course_collection.find_one({"professor_id": professor.professor_id})
    if not existing_course:
        logger.warning(f"Professor with ID {professor.professor_id} does not exist in any course.")
        raise HTTPException(status_code=400, detail="Professor with this ID does not exist in any course.")
    logger.info(f"Professor with ID {professor.professor_id} is valid.")
    return {"message": "Professor ID is valid."}

# 교수 정보를 저장하는 엔드포인트
@router.post("/professors/", response_model=dict)
async def register_professor(professor: Professor):
    logger.info(f"Received request to register professor: {professor}")
    professor_data = jsonable_encoder(professor)

    # Check if the professor exists in the Course collection
    existing_course = await course_collection.find_one({"professor_id": professor.professor_id})
    if not existing_course:
        logger.warning(f"Professor with ID {professor.professor_id} does not exist in any course.")
        raise HTTPException(status_code=400, detail="Professor with this ID does not exist in any course.")

    # Check if the professor already exists in the Professor collection
    existing_professor = await professor_collection.find_one({"email": professor.email})
    if existing_professor:
        logger.warning(f"Professor with email {professor.email} already exists.")
        raise HTTPException(status_code=400, detail="Professor with this email already exists.")

    new_professor = await professor_collection.insert_one(professor_data)
    created_professor = await professor_collection.find_one({"_id": new_professor.inserted_id})
    logger.info(f"Professor registered successfully with ID: {new_professor.inserted_id}")
    return JSONResponse(status_code=201, content={"message": "Professor registered successfully", "professor_id": str(new_professor.inserted_id)})

@router.get("/professors/{professor_id}", response_model=Professor)
async def get_professor(professor_id: str):
    professor = await professor_collection.find_one({"_id": ObjectId(professor_id)})
    if not professor:
        raise HTTPException(status_code=404, detail="Professor not found")
    return Professor(**professor)

@router.get("/professors")
async def get_professor_by_email(email: str):
    try:
        professor = await professor_collection.find_one({"email": email})
        if not professor:
            raise HTTPException(status_code=404, detail="Professor not found")
        return object_id_to_str(professor)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching professor: {str(e)}")


@router.get("/courses/by-professor/{professor_id}")
async def get_courses_by_professor(professor_id: str):
    try:
        print(f"Searching for courses with professor_id: {professor_id}")  # 로그 추가
        courses = []
        async for course in course_collection.find({"professor_id": professor_id}):
            print(f"Found course: {course}")  # 쿼리 결과를 로그에 출력
            courses.append(course_helper(course))
        if not courses:
            print("No courses found for the given professor_id")  # 로그 추가
            raise HTTPException(status_code=404, detail="No courses found for the professor")
        return courses
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))