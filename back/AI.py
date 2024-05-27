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
from dotenv import load_dotenv
import os

# .env 파일에서 환경 변수 로드
load_dotenv()

# 환경 변수 로드
# GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
# print(GOOGLE_API_KEY)
# OPENAI_API_KEY = os.getenv("OpenAI_API")
# print(OPENAI_API_KEY)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)

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
            prompt = f"요약: {request.prompt}. 프로젝트의 핵심기술을 한눈에 알 수 있도록 시각적으로 강조한 이미지를 생성해 주세요. 예를 들어, AI 기술의 경우 로봇 아이콘과 'AI'라는 텍스트를 포함한 이미지처럼, 핵심기술을 대표하는 아이콘과 텍스트를 포함해 주세요. 핵심기술 하나만 명확하게 표현해 주세요.",
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
        print(base64_image)
        return {"base64_image": base64_image}
    except Exception as e:
        return {"error": str(e)}

#===========================================================================
@app.post("/generate-image-geminai/")
async def generate_image(request: ImageRequest):
    try:
        # Geminai 모델 초기화
        model = genai.GenerativeModel('gemini-pro')
        # 이미지 생성 요청
        response = model.generate_image(prompt=request.prompt)
        # 결과 URL 반환
        return {"image_url": response.image_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 기존문서 생성 요약 내용 << CBJ 난 이상하게 위에 안되고 해당 엔드포인트는 잘 됨.
class SummaryRequest(BaseModel):
    text: str

@app.post("/generate-summary/")
async def generate_summary(request: SummaryRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="No text provided for summarization")

    # 입력 텍스트를 토크나이저로 변환하면서, 입력 최대 길이를 증가
    inputs = tokenizer.encode("summarize: " + request.text, return_tensors="pt", max_length=1024, truncation=True)

    # 요약 생성을 위한 매개변수 조정: 긴 텍스트를 고려하여 요약의 최대 길이와 최소 길이 증가
    summary_ids = model.generate(
        inputs,
        max_length=500,  # 요약의 최대 길이 증가
        min_length=100,  # 요약의 최소 길이 증가
        length_penalty=2.0,  # 길이 패널티 적용하여 좀 더 긴 요약 생성
        num_beams=6,  # 빔 탐색의 크기 증가하여 더 다양한 요약 생성
        no_repeat_ngram_size=2,  # 반복을 줄이기 위해 n-gram 크기 설정
        early_stopping=True
    )

    # 토크나이저를 사용해 요약 텍스트 디코딩
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

    return {"summary": summary}

