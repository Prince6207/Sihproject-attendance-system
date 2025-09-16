from fastapi import FastAPI, Form
from fastapi.responses import JSONResponse
import uvicorn

# import your existing functions
from face1 import sign_up, login
from fastapi.middleware.cors import CORSMiddleware



# Allowed origins (your Express backend and maybe frontend)

app = FastAPI(title="Face Authentication Service")
origins = [
    "http://localhost:8000",  # Express
    "http://127.0.0.1:8000",  # Express alternative
    "http://localhost:5173",  # React (if you add frontend)
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   # or ["*"] for all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- Routes ---

@app.post("/api/face/signup")
def signup(username: str = Form(...)):
    try:
        result = sign_up(username)
        if result:
            return JSONResponse(content={"status": "success", "message": f"User {username} registered."}, status_code=200)
        else:
            return JSONResponse(content={"status": "failed", "message": "Sign up failed."}, status_code=400)
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


@app.post("/api/face/login")
def user_login(username: str = Form(...)):
    try:
        success = login(username)
        if success:
            return JSONResponse(content={"status": "success", "message": f"Login successful for {username}"}, status_code=200)
        else:
            return JSONResponse(content={"status": "failed", "message": "Login failed."}, status_code=401)
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


# --- NEW: Endpoint for QR redirect ---
@app.post("/authenticate")
def authenticate(sessionId: str = Form(...), nonce: str = Form(...)):
    try:
        # right now we’ll just run login using sessionId as username
        # you can later enhance this to use nonce or db validation
        success = login(sessionId)
        if success:
            return JSONResponse(content={"status": "success", "message": "Face verified"}, status_code=200)
        else:
            return JSONResponse(content={"status": "failed", "message": "Face verification failed"}, status_code=401)
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


# --- Run Server ---
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
