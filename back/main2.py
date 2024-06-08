from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
import os
from database import client, db
from routers import user, course, project, evaluation, schedule, auth, questions, problems

load_dotenv()

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# 세션 미들웨어
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY", "a_very_secret_key")
)

# 라우터 등록
app.include_router(user.router, tags=["user"])
app.include_router(course.router,  tags=["course"])
app.include_router(project.router,  tags=["project"])
app.include_router(evaluation.router,  tags=["evaluation"])
app.include_router(schedule.router, tags=["schedule"])
app.include_router(auth.router,  tags=["auth"])
app.include_router(questions.router, tags=["questions"])
app.include_router(problems.router, tags=["problems"])

@app.on_event("startup")
async def startup_db_client():
    app.mongodb_client = client
    app.mongodb = db

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
