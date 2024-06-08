from fastapi import APIRouter, HTTPException
from models import Question, QuestionInDB, GeneralAnswer, CodeAnswer
from database import questions_collection, user_collection, scores_collection
from fastapi.responses import JSONResponse
from datetime import datetime
from models import ClassificationRequest
from bson import ObjectId
from typing import Dict, Optional, List,Tuple, Union
from models import Score
import os
from dotenv import load_dotenv
from openai import OpenAI
from collections import Counter, defaultdict
router = APIRouter()

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


client2 = OpenAI(api_key=OPENAI_API_KEY)


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
        new_score = Score(studentId=student_id, scores=new_scores, titles=new_titles)
        await scores_collection.insert_one(new_score.dict())

    return new_scores, new_title

@router.post("/questions", response_model=QuestionInDB)
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
    # 기존 코드 재사용

@router.get("/list/questions", response_model=List[QuestionInDB])
async def list_questions():
    try:
        questions = await questions_collection.find().to_list(1000)
        return [QuestionInDB(id=str(q["_id"]), **q) for q in questions]
    except Exception as e:
        print(f"Error fetching questions: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching questions")
    
@router.get("/questions/{id}", response_model=QuestionInDB)
async def get_question(id: str):
    try:
        question = await questions_collection.find_one({"_id": ObjectId(id)})
        if question is None:
            raise HTTPException(status_code=404, detail="Question not found")
        return QuestionInDB(id=str(question["_id"]), **question)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching question")

@router.post("/questions/{id}/answers")
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
        raise HTTPException(status_code=500, detail=f"Error adding answer: {str(e)}")

@router.post("/questions/{id}/general-answers")
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
            raise HTTPException(status_code=500, detail="Error adding general answer")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding general answer: {str(e)}")

@router.post("/questions/{id}/general-answers/{answerIndex}/resolve")
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
            raise HTTPException(status_code=500, detail="Error toggling resolve status")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error toggling resolve status: {str(e)}")

@router.post("/questions/{id}/answers/{lineNumber}/{answerIndex}/resolve")
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
            any(ans["userId"] == answer["userId"] and ans["resolved"] == 'true' for ans in ans_list)
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
            raise HTTPException(status_code=500, detail="Error toggling resolve status")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error toggling resolve status: {str(e)}")

@router.post("/classify")
async def classify_text(request: ClassificationRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="No text provided")

    prompt_texts = [
        f"Classify the following IT-related response into categories such as backend, frontend, security, network, cloud, and others. Only assign a category if the relevance is over 80%:\n\n'{request.text}'",
        f"Based on the given IT-related response, determine the category it belongs to (backend, frontend, security, network, cloud, others). Only choose a category if it is over 80% relevant:\n\n'{request.text}'",
        f"Analyze the following IT-related text and classify it into one of these categories: backend, frontend, security, network, cloud, others. Make sure the relevance is above 80%:\n\n'{request.text}'"
    ]

    categories = ["backend", "frontend", "security", "network", "cloud", "others"]
    it_terms = ["server", "api", "http", "frontend", "backend", "database", "network", "security", "encryption", "cloud", "storage", "virtualization"]
    results: List[str] = []

    for prompt_text in prompt_texts:
        for _ in range(3):  # 반복 횟수를 늘려 더 많은 데이터를 수집
            response = client2.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an AI that classifies IT-related questions."},
                    {"role": "user", "content": prompt_text}
                ],
                max_tokens=60
            )

            raw_response = response.choices[0].message.content.strip().lower()

            # Check if IT terms are present in the response
            if any(term in raw_response for term in it_terms):
                found_categories = [category for category in categories if category in raw_response]
                if found_categories:
                    results.extend(found_categories)
                else:
                    results.append("others")
            else:
                results.append("others")

    if results:
        most_common_category = Counter(results).most_common(1)[0][0]
        return {"category": most_common_category}
    else:
        return {"category": "others"}
