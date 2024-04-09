from fastapi import FastAPI, HTTPException, Query, RedirectResponse
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.encoders import jsonable_encoder
from bson import ObjectId
from typing import List, Dict
from pydantic import BaseModel
import httpx

app = FastAPI()

# MongoDB URI 설정
MONGODB_URL = "mongodb+srv://CBJ:admin13579@cluster1.vtagppt.mongodb.net/"  # 실제 연결 URI
# MongoDB 클라이언트 생성
client = AsyncIOMotorClient(MONGODB_URL)
# 'Test' 데이터베이스 선택
db = client['Test']

# GitHub OAuth 설정
CLIENT_ID = "your_github_client_id"
CLIENT_SECRET = "your_github_client_secret"
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
    # GitHub로부터 받은 `code`를 사용하여 액세스 토큰을 요청합니다.
    token_response = await httpx.post(
        "https://github.com/login/oauth/access_token",
        data={
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "code": code,
            "redirect_uri": REDIRECT_URI,
        },
        headers={"Accept": "application/json"},
    )
    token_response_json = token_response.json()
    access_token = token_response_json.get("access_token")

    if not access_token:
        raise HTTPException(status_code=400, detail="GitHub OAuth failed")

    # 액세스 토큰을 사용하여 사용자 정보를 가져옵니다.
    user_response = await httpx.get(
        "https://api.github.com/user",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    user_info = user_response.json()

    # GitHub 사용자 정보를 바탕으로 필요한 처리를 수행합니다.
    # 예: 사용자 정보 저장, 사용자 세션 생성 등
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
