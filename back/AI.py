from fastapi import FastAPI, HTTPException,  Path,Query
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from io import BytesIO
from PIL import Image
import base64
import requests
import re
# Google API
GOOGLE_API_KEY = ""
# OpenAI API
client = OpenAI(api_key='')

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
    response = model.generate_content("프로젝트의 기본 소개에 대한 내용을 중점으로 짧게 요약해줘: " + text)
    return {"text": response.text}

@app.get("/summarize/Body")
async def generate_content(text: str = Query(..., description="Text to summarize")):
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("프로젝트의 개발과정 및 설명에 대한 내용으로 짧게요약해줘: " + text)
    return {"text": response.text}

@app.get("/summarize/Conclusion")
async def generate_content(text: str = Query(..., description="Text to summarize")):
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("프로젝트의 결론에 대한 내용으로 짧게 요약해줘: " + text)
    return {"text": response.text}


# @app.get("/summarize/Gen")
# async def generate_content(text: str = Query(..., description="Text to summarize")):
#     model = genai.GenerativeModel('gemini-pro')
#     response = model.generate_content("이거에 관련된 프로젝트 계획서를 작성해줘: " + text)
#     return {"text": response.text}

@app.get("/summarize/finalsum")
async def generate_final_summary(text: str = Query(..., description="Text to generate final summary")):
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("이제 이앱이 어떤 앱인지 1줄에서 최대 3줄로 요약해줘: " + text)
    return {"text": response.text}  # Ensure response is returned


@app.get("/summarize/{category}")
async def generate_content(category: str, text: str = Query(...)):
    model = genai.GenerativeModel('gemini-pro')
    prompt = f"{category}을(를) 중점적으로 요약해줘: {text}"  # 각 카테고리에 맞게 프롬프트를 수정
    response = model.generate_content(prompt)
    return {"text": response.text}



def extract_section(content, start_pattern, end_pattern):
    start = re.search(start_pattern, content)
    end = re.search(end_pattern, content)
    if start and end:
        return content[start.end():end.start()].strip()
    elif start:
        return content[start.end():].strip()
    return ""

@app.get("/summarize/Gen/{title}/{technologies}/{problem}")
async def generate_content(
    title: str = Path(..., description="Title of the project"),
    technologies: str = Path(..., description="Technologies to be used"),
    problem: str = Path(..., description="Problem that the project aims to solve")
):
    model = genai.GenerativeModel('gemini-pro')
    prompt = (
        f"프로젝트 제목: {title}\n"
        f"사용 기술: {technologies}\n"
        f"해결 문제: {problem}\n\n"
        f"결과는 다음과 같은 포맷으로 제공해줘:\n"
        f"프로젝트 제목:\n추진 배경:\n개발 내용:\n기대 효과:"
    )
    response = model.generate_content(prompt)
    generated_text = response.text

    # 각 섹션 추출
    project_title = extract_section(generated_text, "프로젝트 제목:", "추진 배경:")
    background = extract_section(generated_text, "추진 배경:", "개발 내용:")
    development_content = extract_section(generated_text, "개발 내용:", "기대 효과:")
    expected_effects = extract_section(generated_text, "기대 효과:", "$")  # $는 텍스트 끝을 의미

    return {
        "project_title": project_title,
        "background": background,
        "development_content": development_content,
        "expected_effects": expected_effects
    }






class ImageRequest(BaseModel):
    prompt: str

@app.post("/generate-image/")
async def generate_image(request: ImageRequest):
    try:
        # 이미지 생성
        response = client.images.generate(
            model="dall-e-3",
            prompt=request.prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        image_url = response.data[0].url

        # 이미지 다운로드
        image_data = requests.get(image_url).content

        # 이미지 크기 조정
        image = Image.open(BytesIO(image_data))
        resized_image = image.resize((256, 256))

        # 이미지를 Base64로 인코딩
        buffered = BytesIO()
        resized_image.save(buffered, format="JPEG")
        base64_image = base64.b64encode(buffered.getvalue()).decode("utf-8")

        return {"base64_image": base64_image}
    except Exception as e:
        return {"error": str(e)}



# 기존문서 생성 요약 내용
class SummaryRequest(BaseModel):
    text: str

@app.post("/generate-summary/")
async def generate_summary(request: SummaryRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="No text provided for summarization")

    # 텍스트를 토크나이저로 변환하고 요약 생성
    inputs = tokenizer.encode("summarize: " + request.text, return_tensors="pt", max_length=512, truncation=True)
    summary_ids = model.generate(inputs, max_length=150, min_length=40, length_penalty=2.0, num_beams=4, early_stopping=True)
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

    return {"summary": summary}
