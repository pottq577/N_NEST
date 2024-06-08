from fastapi import APIRouter, HTTPException
from models import Problem, CodeSubmission
from database import problems_collection, submissions_collection
from fastapi.responses import JSONResponse
from bson import ObjectId
import aiohttp
import asyncio
import logging
from config import JUDGE0_API_URL, JUDGE0_API_KEY

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

languages = {
    "python": 71,
    "javascript": 63,
    # 필요한 다른 언어도 추가할 수 있습니다.
}

@router.post("/problems/")
async def create_problem(problem: Problem):
    problem_dict = problem.dict()
    result = await problems_collection.insert_one(problem_dict)
    return {"id": str(result.inserted_id)}


@router.get("/problems/")
async def get_problems():
    problems = await problems_collection.find().to_list(1000)
    for problem in problems:
        problem["_id"] = str(problem["_id"])
    return problems


@router.get("/problems/{problem_id}")
async def get_problem(problem_id: str):
    problem = await problems_collection.find_one({"_id": ObjectId(problem_id)})
    if problem:
        problem["_id"] = str(problem["_id"])
        return problem
    raise HTTPException(status_code=404, detail="Problem not found")

@router.post("/submissions/")
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
                    logger.error(f"Error submitting code: {response.status} {response.reason}")
                    raise HTTPException(status_code=500, detail="Error submitting code.")
                result = await response.json()
                token = result['token']
                logger.info(f"Code submitted successfully. Token: {token}")

                result_url = f"{JUDGE0_API_URL}{token}"
                while True:
                    async with session.get(result_url, headers=headers) as result_response:
                        result_data = await result_response.json()
                        if result_response.status == 200 and result_data.get("status", {}).get("description") != "In Queue":
                            # 제출된 코드의 출력과 문제의 예상 출력을 비교
                            is_correct = result_data['stdout'].strip() == problem['sample_output'].strip()
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
            raise HTTPException(status_code=500, detail=f"Error executing code: {e}")

@router.get("/submissions/{submission_id}")
async def get_submission(submission_id: str):
    submission = await submissions_collection.find_one({"_id": ObjectId(submission_id)})
    if submission:
        submission["_id"] = str(submission["_id"])
        return submission
    raise HTTPException(status_code=404, detail="Submission not found")
