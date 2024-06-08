from fastapi import APIRouter, HTTPException, Request, Response, Depends, Query
from fastapi.responses import JSONResponse, RedirectResponse, HTMLResponse
from datetime import datetime, timedelta, timezone
import jwt
from database import user_collection, professor_collection, course_collection
from config import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, SECRET_KEY, ALGORITHM
import httpx
from typing import Dict
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 각 사용자의 GitHub 로그인 이름을 저장하는 딕셔너리
user_logins: Dict[int, str] = {}


@router.get("/auth/login")
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
        print(f"GitHub User Info: {user_info}")
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

@router.get("/auth/callback")
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

@router.get("/api/session/info")
async def get_session_info(request: Request):
    user_info = request.session.get('user_info', None)
    token = request.session.get('access_token', None)
    if user_info and token:
        return {"user": user_info, "token": token}
    else:
        raise HTTPException(status_code=404, detail="No session or token information available")

@router.get("/api/user/status")
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
