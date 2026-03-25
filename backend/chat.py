import json
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load API key
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

CHAT_DB = "chat_history.json"

# Create DB if not exists
if not os.path.exists(CHAT_DB):
    with open(CHAT_DB, "w") as f:
        json.dump({}, f)


# -------- CHAT STORAGE --------
def load_chats():
    with open(CHAT_DB, "r") as f:
        return json.load(f)


def save_chats(data):
    with open(CHAT_DB, "w") as f:
        json.dump(data, f, indent=4)


# -------- AI RESPONSE --------
def ask_ai(msg):
    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")

        prompt = f"""
You are MindCare AI, a supportive and empathetic mental health assistant.

User message:
{msg}

Instructions:
- Respond like ChatGPT
- Use a warm, human-like tone
- Give 2–3 short paragraphs
- Add bullet points if useful
- Provide helpful suggestions
- Do NOT give one-line answers
- Do NOT repeat the same response every time
- Make the answer feel natural and thoughtful

Response:
"""

        result = model.generate_content(prompt)

        # Safety fallback
        if not result.text:
            return "I'm here for you. Could you tell me a bit more about how you're feeling?"

        return result.text

    except Exception as e:
        return f"⚠️ Error: {e}"