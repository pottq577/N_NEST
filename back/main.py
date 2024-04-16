from fastapi import FastAPI, HTTPException, Query, Request, Depends
from fastapi.responses import JSONResponse, RedirectResponse, HTMLResponse
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

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
MONGODB_URL = "mongodb+srv://CBJ:admin13579@cluster1.vtagppt.mongodb.net/"  # 실제 연결 URI
# MongoDB 클라이언트 생성
client = AsyncIOMotorClient(MONGODB_URL)
db = client['N-Nest'] # 데이터베이스 선택
user_collection = db['User']

# GitHub 설정
CLIENT_ID = 'Iv1.636c6226a979a74a'
# 환경변수에서 비밀 키 읽기
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
REDIRECT_URI = 'http://localhost:8000/auth/callback'
# 데이터 모델 정의
class UserInfo(BaseModel):
    name: str
    schoolEmail: str
    age: int
    contact: str
    githubUsername: str
    githubName: str

@app.get("/login/github")
async def login_with_github():
    # GitHub 로그인 페이지로 사용자를 리다이렉트합니다.
    return RedirectResponse(
        url=f"https://github.com/login/oauth/authorize?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&scope=user:email"
    )

@app.get("/auth/callback")
async def github_auth_callback(request: Request, code: str = Query(...)):
    async with httpx.AsyncClient() as client:
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
            return HTTPException(status_code=400, detail="Failed to get access token")

        access_token = token_response.json().get("access_token")
        if not access_token:
            return HTTPException(status_code=400, detail="Access token not found")

        user_response = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        user_info = user_response.json()

        # 세션에 사용자 정보 저장
        request.session['github_username'] = user_info.get('login', 'default_login')
        request.session['github_name'] = user_info.get('name', 'default_name')
        print(user_info)

        return RedirectResponse(url="http://localhost:3000/pages/register/addInfo")

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
        "github_name": request.session.get('github_name', 'Not available')
    }
    return JSONResponse(github_info)

# 사용자 정보를 데이터베이스에 저장
@app.post("/api/user/additional-info", response_description="Add new user info", response_model=dict)
async def add_user_info(user_info: UserInfo):

    user_info = jsonable_encoder(user_info)  # Pydantic 객체를 JSON-호환 객체로 변환
    new_user = await user_collection.insert_one(user_info)
    created_user = await user_collection.find_one({"_id": new_user.inserted_id})
    if created_user is not None:
        return JSONResponse(status_code=201, content={"message": "User info saved successfully", "user_id": str(new_user.inserted_id)})
    else:
        raise HTTPException(status_code=500, detail="Failed to save user info")



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
