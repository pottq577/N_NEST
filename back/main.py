from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.encoders import jsonable_encoder
from bson import ObjectId
from typing import List, Dict

app = FastAPI()

# MongoDB URI 설정
MONGODB_URL = "mongodb+srv://CBJ:admin13579@cluster1.vtagppt.mongodb.net/"  # 실제 연결 URI로 대체해야 합니다.

# MongoDB 클라이언트 생성
client = AsyncIOMotorClient(MONGODB_URL)

# 'Test' 데이터베이스 선택
db = client['Test']

# ObjectId를 문자열로 변환하는 함수
def object_id_to_str(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")

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
