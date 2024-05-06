from fastapi import FastAPI, HTTPException, Query, Request, Depends, APIRouter, Response, Cookie
from fastapi.responses import JSONResponse, RedirectResponse, HTMLResponse
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, Field
import httpx
from dotenv import load_dotenv
import os
import jwt
import asyncio
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from typing import Dict, Optional, List
import json
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
MONGODB_URL = os.getenv("MONGODB_URL")

# MongoDB 클라이언트 생성
client = AsyncIOMotorClient(MONGODB_URL)
db = client['N-Nest'] # 데이터베이스 선택
user_collection = db['User']
project_collection = db['Project']
# GitHub 설정
CLIENT_ID = 'Iv1.636c6226a979a74a'
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
    githubId: int

class ProjectData(BaseModel):
    name: str
    description: str
    language: str
    stars: int
    updated_at: datetime
    license: str
    forks: int
    watchers: int
    contributors: int
    is_private: bool
    default_branch: str
    repository_url: str
    text_extracted: str
    #image_preview_urls: List[str]
    summary: str
    #generated_image_url: str

# JWT 설정 ===========================================
SECRET_KEY = os.getenv("JWT_SECRET", "your_jwt_secret")
ALGORITHM = "HS256"

router = APIRouter()

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

    # 이미 해당 GitHub ID를 가진 사용자가 있는지 확인
    existing_user = await user_collection.find_one({"githubId": user_info['githubId']})
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this GitHub ID already exists")

    # 사용자가 없는 경우에만 정보를 저장
    new_user = await user_collection.insert_one(user_info)
    created_user = await user_collection.find_one({"_id": new_user.inserted_id})
    if created_user is not None:
        return JSONResponse(status_code=201, content={"message": "User info saved successfully", "user_id": str(new_user.inserted_id)})
    else:
        raise HTTPException(status_code=500, detail="Failed to save user info")


@app.post('/save-project2')
async def save_project(project_data: ProjectData):
    print(project_data)
    try:
        # MongoDB 'Project' 컬렉션에 데이터 저장
        new_project = await db.Project.insert_one(project_data.dict())
        return {"message": "Document saved successfully", "project_id": str(new_project.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save document: {str(e)}")

















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









# 데이터 모델 정의
class ProjectInfo(BaseModel):
    user_id: str
    username: str
    name: str
    description: Optional[str] = None
    language: Optional[str] = None
    stars: int
    updated_at: str
    license: Optional[str] = None
    forks: int
    watchers: int
    contributors: List[str]
    private: bool
    default_branch: str
    html_url: str

@app.post("/save-project")
async def save_project(project_info: ProjectInfo):
    try:
        result = await project_collection.insert_one(project_info.dict())
        return {"message": "Project saved successfully", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving project: {str(e)}")






























if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
