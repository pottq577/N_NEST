
from fastapi import APIRouter, HTTPException
from models import EvaluationCriteria, StudentRegistration, Evaluation
from database import user_collection,evaluation_collection, evaluation_result_collection, evaluation_assignment_collection, course_team_collection
from fastapi.responses import JSONResponse
from collections import defaultdict
from fastapi.encoders import jsonable_encoder
from fastapi import FastAPI, Query, Request, Depends, APIRouter, Response, Cookie
from typing import Dict, Optional
import random
from bson import ObjectId
router = APIRouter()

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

@router.post("/api/teams/register")
async def register_student(student_registration: StudentRegistration, update: Optional[bool] = Query(False)):
    evaluation = await evaluation_collection.find_one({"course_code": student_registration.course_code})
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation criteria not found")

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

    # 학생이 이미 다른 팀에 속해 있는지 확인하고 제거
    for team_item in team["teams"]:
        if any(s["studentId"] == student_info["studentId"] for s in team_item["students"]):
            team_item["students"] = [s for s in team_item["students"] if s["studentId"] != student_info["studentId"]]

    # 팀에 학생 추가 또는 팀 생성
    existing_team = next((t for t in team["teams"] if t["team_name"] == student_registration.team_name), None)
    if existing_team:
        existing_team["students"].append(student_data)
    else:
        if len(team["teams"]) >= max_teams:
            raise HTTPException(status_code=400, detail="Maximum number of teams reached for this course")
        new_team = {
            "team_name": student_registration.team_name,
            "students": [student_data]
        }
        team["teams"].append(new_team)

    await course_team_collection.update_one({"_id": team["_id"]}, {"$set": {"teams": team["teams"]}})
    return {"message": "Student registered successfully"}

@router.get("/api/students/github/{githubId}")
async def get_student_by_github(githubId: str):
    student = await user_collection.find_one({"githubId": githubId})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return convert_objectid_to_str(student)

@router.get("/api/evaluation-assignments/{course_code}/{studentId}")
async def get_evaluation_assignments(course_code: str, studentId: str):
    assignments = await evaluation_assignment_collection.find_one({"course_code": course_code})
    if not assignments:
        raise HTTPException(status_code=404, detail="Evaluation assignments not found")

    student_evaluations = assignments.get("evaluations", {}).get(studentId)
    if not student_evaluations:
        raise HTTPException(status_code=404, detail="Evaluations not found for the student")

    return {"evaluations": student_evaluations}

@router.get("/api/evaluations/{course_code}")
async def get_evaluation_criteria(course_code: str):
    evaluation = await evaluation_collection.find_one({"course_code": course_code})
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation criteria not found")
    return convert_objectid_to_str(evaluation)

@router.post("/api/evaluate")
async def submit_evaluation(evaluation: Evaluation):
    existing_evaluation = await evaluation_result_collection.find_one(
        {"course_code": evaluation.course_code, "team_name": evaluation.team_name, "evaluations.evaluator_id": evaluation.evaluator_id}
    )

    if existing_evaluation:
        raise HTTPException(status_code=400, detail="You have already submitted an evaluation for this team.")

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

@router.get("/api/evaluation-results/{course_code}")
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

@router.get("/api/evaluation-progress/{course_code}")
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

@router.post("/api/start-evaluation/{course_code}")
async def start_evaluation(course_code: str):
    teams = await course_team_collection.find_one({"course_code": course_code})
    if not teams:
        raise HTTPException(status_code=404, detail="No teams found for the course")

    evaluations = defaultdict(list)
    for team in teams["teams"]:
        for student in team["students"]:
            available_teams = [t["team_name"] for t in teams["teams"] if t["team_name"] != team["team_name"]]
            evaluations[student["studentId"]] = random.sample(available_teams, min(3, len(available_teams)))

    for student_id, assigned_teams in evaluations.items():
        await evaluation_assignment_collection.update_one(
            {"course_code": course_code},
            {"$set": {f"evaluations.{student_id}": assigned_teams}},
            upsert=True
        )

    return {"message": "Evaluation started successfully"}
    # 기존 코드 재사용

@router.post("/api/evaluations")
async def save_evaluation_criteria(evaluation_criteria: EvaluationCriteria):
    try:
        existing_evaluation = await evaluation_collection.find_one({"course_code": evaluation_criteria.course_code})
        if existing_evaluation:
            return JSONResponse(status_code=400, content={"message": "Evaluation criteria already exists. Do you want to update it?"})

        evaluation_dict = jsonable_encoder(evaluation_criteria)
        result = await evaluation_collection.insert_one(evaluation_dict)
        return {"message": "Evaluation criteria saved successfully", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/api/evaluations")
async def update_evaluation_criteria(evaluation_criteria: EvaluationCriteria):
    try:
        existing_evaluation = await evaluation_collection.find_one({"course_code": evaluation_criteria.course_code})
        if not existing_evaluation:
            raise HTTPException(status_code=404, detail="Evaluation criteria not found")

        evaluation_dict = jsonable_encoder(evaluation_criteria)
        await evaluation_collection.update_one({"course_code": evaluation_criteria.course_code}, {"$set": evaluation_dict})
        return {"message": "Evaluation criteria updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
