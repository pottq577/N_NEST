from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGODB_URL

client = AsyncIOMotorClient(MONGODB_URL)
db = client['N-Nest']

user_collection = db['User']
questions_collection = db["questions"]
project_collection = db['Project']
course_collection = db["Course"]
student_collection = db["Student"]
course_team_collection = db["Course_team"]
evaluation_collection = db["Evaluation"]
scores_collection = db["scores"]
problems_collection = db['problems']
submissions_collection = db['submissions']
evaluation_assignment_collection = db["evaluation_assignments"]
evaluation_result_collection = db['EvaluationResult']
professor_collection = db['Professor']
availability_collection = db['availability']
reservations_collection = db['reservations']
