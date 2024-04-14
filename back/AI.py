from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai


# Google API
GOOGLE_API_KEY = 
# OpenAI API
client = OpenAI(api_key=)

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
    inputs = tokenizer("summarize: " + request.text, return_tensors="pt", max_length=1000, truncation=True)
    summary_ids = model.generate(**inputs, max_length=400, min_length=100, length_penalty=2.0, num_beams=4, early_stopping=True)

    # 요약된 텍스트 출력
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return {"summary": summary}





genai.configure(api_key=GOOGLE_API_KEY)


@app.get("/summarize/Introduction")
async def generate_content(text: str = Query(..., description="Text to summarize")):
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("요약해줘: " + text)
    return {"text": response.text}

@app.get("/summarize/Body")
async def generate_content(text: str = Query(..., description="Text to summarize")):
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("요약해줘: " + text)
    return {"text": response.text}

@app.get("/summarize/Conclusion")
async def generate_content(text: str = Query(..., description="Text to summarize")):
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("요약해줘: " + text)
    return {"text": response.text}


@app.get("/summarize/Gen")
async def generate_final_summary(text: str = Query(..., description="Text to generate final summary")):
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("이제 이앱이 어떤 앱인지 1줄에서 최대 3줄로 요약해줘: " + text)
    return {"text": response.text}  # Ensure response is returned

class ImageRequest(BaseModel):
    prompt: str



@app.post("/generate-image/")
async def generate_image(request: ImageRequest):
    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=request.prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        image_url = response.data[0].url
        return {"image_url": image_url}
    except Exception as e:
        return {"error": str(e)}
