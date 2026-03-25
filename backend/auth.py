import json
import os

USER_DB = "users.json"

if not os.path.exists(USER_DB):
    with open(USER_DB, "w") as f:
        json.dump({}, f)

def load_users():
    with open(USER_DB, "r") as f:
        return json.load(f)

def save_users(data):
    with open(USER_DB, "w") as f:
        json.dump(data, f, indent=4)

def login_user(email, password):
    users = load_users()
    if email in users and users[email]["password"] == password:
        return {"status": "success"}
    return {"status": "error"}

def signup_user(email, password):
    users = load_users()
    if email in users:
        return {"status": "exists"}
    users[email] = {"password": password}
    save_users(users)
    return {"status": "created"}

def delete_user(email, password):
    users = load_users()
    if email in users and users[email]["password"] == password:
        users.pop(email)
        save_users(users)
        return {"status": "deleted"}
    return {"status": "error"}