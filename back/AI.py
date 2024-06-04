from fastapi import FastAPI, HTTPException, Path, Query
from pydantic import BaseModel
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import re
from PIL import Image
import requests
import base64
from io import BytesIO

# .env 파일에서 환경 변수 로드
load_dotenv()

# 환경 변수 로드
# GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
# OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# client = OpenAI(api_key=OPENAI_API_KEY)

app = FastAPI()

# CORS 미들웨어 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 출처 허용
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메소드 허용
    allow_headers=["*"],
)

# 요청 데이터 모델 정의
class SummarizeRequest(BaseModel):
    text: str

# OpenAI 요약 요청 엔드포인트
@app.post("/summarize/")
async def summarize(request: SummarizeRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="No text provided for summarization")

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "당신은 유용한 조수입니다."},
            {"role": "user", "content": f"다음 텍스트를 요약해 주세요: {request.text}"}
        ]
    )

    summary = response.choices[0].message.content.strip()
    return {"summary": summary}

@app.get("/summarize/Introduction")
async def generate_content(text: str = Query(..., description="요약할 텍스트")):
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "당신은 유용한 조수입니다."},
            {"role": "user", "content": f"프로젝트 소개를 요약해 주세요: {text}"}
        ]
    )
    summary = response.choices[0].message.content.strip()
    return {"text": summary}

@app.get("/summarize/Body")
async def generate_content(text: str = Query(..., description="요약할 텍스트")):
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "당신은 유용한 조수입니다."},
            {"role": "user", "content": f"프로젝트의 개발 과정 및 설명을 요약해 주세요: {text}"}
        ]
    )
    summary = response.choices[0].message.content.strip()
    return {"text": summary}

@app.get("/summarize/Conclusion")
async def generate_content(text: str = Query(..., description="요약할 텍스트")):
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "당신은 유용한 조수입니다."},
            {"role": "user", "content": f"프로젝트 결론을 요약해 주세요: {text}"}
        ]
    )
    summary = response.choices[0].message.content.strip()
    return {"text": summary}

@app.get("/summarize/finalsum")
async def generate_final_summary(text: str = Query(..., description="최종 요약을 생성할 텍스트")):
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "당신은 유용한 조수입니다."},
            {"role": "user", "content": f"이 앱의 핵심 내용을 1줄에서 3줄로 요약해 주세요: {text}"}
        ]
    )
    summary = response.choices[0].message.content.strip()
    return {"text": summary}  # Ensure response is returned

@app.get("/summarize/{category}")
async def generate_content(category: str, text: str = Query(...)):
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "당신은 유용한 조수입니다."},
            {"role": "user", "content": f"{category}에 중점을 두고 다음 내용을 요약해 주세요: {text}"}
        ]
    )
    summary = response.choices[0].message.content.strip()
    return {"text": summary}

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
    title: str = Path(..., description="프로젝트 제목"),
    technologies: str = Path(..., description="사용 기술"),
    problem: str = Path(..., description="해결할 문제")
):
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "당신은 유용한 조수입니다."},
            {"role": "user", "content": (
                f"다음 세부 사항으로 프로젝트 요약을 생성해 주세요:\n"
                f"프로젝트 제목: {title}\n"
                f"사용 기술: {technologies}\n"
                f"해결할 문제: {problem}\n\n"
                f"결과를 다음 형식으로 제공해 주세요:\n"
                f"프로젝트 제목:\n추진 배경:\n개발 내용:\n기대 효과:"
            )}
        ]
    )
    generated_text = response.choices[0].message.content.strip()

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
        response = client.images.generate(
            model="dall-e-3",
            prompt=(
                f"Summary: {request.prompt}. Create an image that visually emphasizes the core technology of the project. "
                f"For example, if the core technology is AI, include an icon of a robot and the text 'AI'. "
                f"Include an icon and text that represent the core technology clearly. "
                f"Please minimize additional elements in the image and focus on the main technology."
            ),
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

@app.post("/generate-image-geminai/")
async def generate_image_geminai(request: ImageRequest):
    try:
        # Geminai 모델 초기화
        model = genai.GenerativeModel('gemini-pro')
        # 이미지 생성 요청
        response = model.generate_image(prompt=request.prompt)
        # 결과 URL 반환
        return {"image_url": response.image_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SummaryRequest(BaseModel):
    text: str

@app.post("/generate-summary/")
async def generate_summary(request: SummaryRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="요약할 텍스트가 제공되지 않았습니다.")

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "당신은 유용한 조수입니다."},
            {"role": "user", "content": f"다음 텍스트를 핵술 기술 중심으로 강조해서 3줄 또는 1줄 요약해 짧으면 짧을 수록 좋으나 프로젝트의 내용은 잘 담기게 해줘요 이미지 생성에 사용될 요약이니 핵심기술이 잘 들어나게 요약해주세요: {request.text}"}
        ]
    )

    summary = response.choices[0].message.content.strip()
    return {"summary": summary}
