from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import login_user, signup_user, delete_user
from chat import ask_ai

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------- AUTH --------
@app.post("/login")
def login(data: dict):
    return login_user(data["email"], data["password"])

@app.post("/signup")
def signup(data: dict):
    return signup_user(data["email"], data["password"])

@app.post("/delete")
def delete(data: dict):
    return delete_user(data["email"], data["password"])

# -------- CHAT --------
@app.post("/chat")
def chat(data: dict):
    reply = ask_ai(data["message"])
    return {"response": reply}