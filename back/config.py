import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
CLIENT_ID = 'Iv1.636c6226a979a74a'
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
REDIRECT_URI = 'http://localhost:8000/auth/callback'
SECRET_KEY = os.getenv("SECRET_KEY", "a_very_secret_key")
ALGORITHM = "HS256"
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com/submissions/"
JUDGE0_API_KEY = "bace70d956msh6b9a2ff9d6e6c4ep1522c0jsn3ef11ed8217a"
