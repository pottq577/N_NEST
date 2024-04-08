from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

from fastapi.middleware.cors import CORSMiddleware

# FastAPI 애플리케이션 인스턴스 생성
app = FastAPI()

# CORS 미들웨어 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 출처 허용
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메소드 허용
    allow_headers=["*"],
)

# 모델과 토크나이저 로드
model_name = "lcw99/t5-large-korean-text-summary"
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# 요청 데이터 모델 정의
class SummarizeRequest(BaseModel):
    text: str

# POST 요청을 처리하는 엔드포인트
@app.post("/summarize/")
async def summarize(request: SummarizeRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="No text provided for summarization")

    # 텍스트를 토큰화하고 모델에 입력
    inputs = tokenizer("summarize: " + request.text, return_tensors="pt", max_length=512, truncation=True)
    summary_ids = model.generate(**inputs, max_length=150, min_length=40, length_penalty=2.0, num_beams=4, early_stopping=True)

    # 요약된 텍스트 출력
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return {"summary": summary}
