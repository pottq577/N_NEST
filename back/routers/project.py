from fastapi import APIRouter, HTTPException
from models import ProjectInfo, Comment
from database import project_collection
from fastapi.responses import JSONResponse
from datetime import datetime
from bson import ObjectId
from fastapi.encoders import jsonable_encoder
from database import db
router = APIRouter()

# ObjectId를 문자열로 변환하는 함수
def transform_id(document):
    document["_id"] = str(document["_id"])
    return document

@router.post("/save-project/")
async def save_project(project_data: ProjectInfo):
    json_compatible_item_data = jsonable_encoder(project_data)
    if "views" not in json_compatible_item_data:
        json_compatible_item_data["views"] = 0  # 기본값 설정
    result = await project_collection.insert_one(json_compatible_item_data)  # 여기에 await 추가
    if result.inserted_id:
        return {"status": "success", "document_id": str(result.inserted_id)}
    else:
        raise HTTPException(status_code=500, detail="Failed to save the document")

@router.get("/api/projects")
async def read_projects():
    projects = await db["Project"].find().to_list(100)
    return [transform_id(project) for project in projects]

@router.get("/api/projects/{project_id}")
async def read_project(project_id: str):
    try:
        project = await project_collection.find_one({"_id": ObjectId(project_id)})
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        # 조회수 증가
        await project_collection.update_one({"_id": ObjectId(project_id)}, {"$inc": {"views": 1}})
        return transform_id(project)
    except Exception as e:
        print(f"Failed to fetch project: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch project: {str(e)}")

@router.post("/api/projects/{project_id}/comments")
async def add_comment(project_id: str, comment: Comment):
    try:
        project = await project_collection.find_one({"_id": ObjectId(project_id)})
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")

        # 댓글에 타임스탬프 추가
        comment.timestamp = datetime.datetime.now().isoformat()
        comment_dict = comment.dict()

        update_result = await project_collection.update_one(
            {"_id": ObjectId(project_id)},
            {"$push": {"comments": comment_dict}}
        )

        if update_result.modified_count == 1:
            return JSONResponse(status_code=200, content={"message": "Comment added successfully"})
        else:
            raise HTTPException(status_code=500, detail="Failed to add comment")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add comment: {str(e)}")

@router.put("/update-project/{project_id}")
async def update_project(project_id: str, project_data: ProjectInfo):
    json_compatible_item_data = jsonable_encoder(project_data)
    result = await project_collection.update_one(
        {"_id": ObjectId(project_id)},
        {"$set": json_compatible_item_data}
    )
    if result.modified_count == 1:
        return {"status": "success"}
    else:
        raise HTTPException(status_code=404, detail="Project not found or no changes made")
    
@router.delete("/delete-project/{project_id}")
async def delete_project(project_id: str):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")

    result = await project_collection.delete_one({"_id": ObjectId(project_id)})
    if result.deleted_count == 1:
        return {"status": "success", "message": "Project deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Project not found") 