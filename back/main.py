from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import RedirectResponse
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.encoders import jsonable_encoder
from bson import ObjectId
from typing import List, Dict
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

# MongoDB URI 설정
MONGODB_URL = "mongodb+srv://CBJ:admin13579@cluster1.vtagppt.mongodb.net/"  # 실제 연결 URI
# MongoDB 클라이언트 생성
client = AsyncIOMotorClient(MONGODB_URL)
# 'Test' 데이터베이스 선택
db = client['Test']

# GitHub OAuth 설정
CLIENT_ID = "Iv1.636c6226a979a74a"
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
print(CLIENT_SECRET)
REDIRECT_URI = "http://localhost:8000/auth/callback"

# ObjectId를 문자열로 변환하는 함수
def object_id_to_str(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    else:
        raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")

@app.get("/login/github")
async def login_with_github():
    # GitHub 로그인 페이지로 사용자를 리다이렉트합니다.
    return RedirectResponse(
        url=f"https://github.com/login/oauth/authorize?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&scope=user:email"
    )

@app.get("/auth/callback")
async def github_auth_callback(code: str = Query(...)):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "code": code,
                "redirect_uri": REDIRECT_URI,
            },
            headers={"Accept": "application/json"},
        )
    if response.status_code != 200:
        error_detail = {
            "error": "GitHub OAuth failed",
            "status_code": response.status_code,
            "client_id": CLIENT_ID,
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "response_body": response.text
        }
        raise HTTPException(status_code=400, detail=error_detail)

    token_response_json = response.json()
    access_token = token_response_json.get("access_token")

    if not access_token:
        raise HTTPException(status_code=400, detail={
            "error": "No access token returned",
            "response": token_response_json
        })

    async with httpx.AsyncClient() as client:
        user_response = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"}
        )
    user_info = user_response.json()

    return {"user_info": user_info}






# 'Name' 컬렉션 내의 모든 문서를 가져오는 API 엔드포인트
@app.get("/name", response_model=List[Dict])
async def get_names():
    names_cursor = db.Name.find({})
    names_list = await names_cursor.to_list(length=100)  # 예시로 100개 문서 제한
    # 문서 리스트를 JSON으로 변환 가능하게 만들고 반환
    return jsonable_encoder(names_list, custom_encoder={ObjectId: object_id_to_str})

# 특정 ID를 가진 문서를 가져오는 API 엔드포인트
@app.get("/name/{id}", response_model=Dict)
async def get_name(id: str):
    document = await db.Name.find_one({"_id": ObjectId(id)})
    if document:
        return jsonable_encoder(document, custom_encoder={ObjectId: object_id_to_str})
    return {"error": "Document not found"}
