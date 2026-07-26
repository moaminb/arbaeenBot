import os
import sqlite3
import pandas as pd
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks, Request, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import threading
import shutil

from main import bot, DB_FILE, PHOTOS_DIR

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class User(BaseModel):
    user_id: int
    language: Optional[str]
    name: Optional[str]
    profession: Optional[str]
    contribution: Optional[str]
    phone_number: Optional[str]

ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "admin_secret_123")

def verify_admin(authorization: str = Header(None)):
    if not authorization or authorization != f"Bearer {ADMIN_TOKEN}":
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

class LoginData(BaseModel):
    username: str
    password: str

@app.post("/api/login")
def login(data: LoginData):
    admin_user = os.getenv("ADMIN_USER", "admin")
    admin_pass = os.getenv("ADMIN_PASS", "admin123")
    
    if data.username == admin_user and data.password == admin_pass:
        return {"token": ADMIN_TOKEN}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/users", response_model=List[User])
def get_users(_ = Depends(verify_admin)):
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM users")
    rows = c.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.post("/api/upload_manual")
async def upload_manual(phone_number: str = Form(...), files: List[UploadFile] = File(...), _ = Depends(verify_admin)):
    # Clean phone number
    phone = phone_number.replace(" ", "").replace("-", "")
    
    # Check existing photos for this number to append
    existing_files = [f for f in os.listdir(PHOTOS_DIR) if f.startswith(f"{phone}_") or f == f"{phone}.jpg"]
    start_index = len(existing_files) + 1

    for i, file in enumerate(files):
        # We save as phone_index.jpg if multiple, or just phone.jpg if single and first
        if start_index == 1 and i == 0 and len(files) == 1:
            file_path = os.path.join(PHOTOS_DIR, f"{phone}.jpg")
        else:
            file_path = os.path.join(PHOTOS_DIR, f"{phone}_{start_index + i}.jpg")
            
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
    return {"status": "success", "message": f"{len(files)} photos uploaded for {phone}"}

@app.post("/api/upload_batch")
async def upload_batch(excel_file: UploadFile = File(...), photos: List[UploadFile] = File(...), _ = Depends(verify_admin)):
    if not excel_file.filename.endswith(('.xls', '.xlsx')):
        raise HTTPException(status_code=400, detail="Invalid Excel file.")
    
    # Save excel file temporarily
    temp_excel = f"temp_{excel_file.filename}"
    with open(temp_excel, "wb") as buffer:
        shutil.copyfileobj(excel_file.file, buffer)
        
    try:
        df = pd.read_excel(temp_excel)
        if df.empty or len(df.columns) == 0:
            raise HTTPException(status_code=400, detail="Excel file is empty or missing columns.")
        
        # Assume first column is phone numbers
        phone_numbers = df.iloc[:, 0].dropna().astype(str).tolist()
        
        # Clean phone numbers
        clean_phones = []
        for p in phone_numbers:
            # Handle floats like 9123456789.0
            if p.replace('.','',1).isdigit():
                p = str(int(float(p)))
            p = p.replace(" ", "").replace("-", "")
            if p.startswith("98"): p = "0" + p[2:]
            elif p.startswith("+98"): p = "0" + p[3:]
            elif not p.startswith("0") and len(p) == 10: p = "0" + p
            clean_phones.append(p)
            
        # Sort photos alphabetically by filename to maintain order
        sorted_photos = sorted(photos, key=lambda x: x.filename)
        
        mapped_count = 0
        for i, phone in enumerate(clean_phones):
            if i < len(sorted_photos):
                photo = sorted_photos[i]
                file_path = os.path.join(PHOTOS_DIR, f"{phone}.jpg")
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(photo.file, buffer)
                mapped_count += 1
                
    finally:
        if os.path.exists(temp_excel):
            os.remove(temp_excel)
            
    return {"status": "success", "message": f"Mapped {mapped_count} photos to {len(clean_phones)} phone numbers."}

def run_bot():
    print("Telegram Bot is starting in background...")
    bot.infinity_polling()

@app.get("/api/stats")
def get_stats(_ = Depends(verify_admin)):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM users")
    total_users = c.fetchone()[0]
    
    # get active users (last 7 days, pseudo since we don't have created_at, just mock for now or return total)
    # Since DB doesn't have dates, we just use total
    conn.close()

    total_photos = 0
    total_size_bytes = 0
    if os.path.exists(PHOTOS_DIR):
        files = [f for f in os.listdir(PHOTOS_DIR) if f.endswith('.jpg')]
        total_photos = len(files)
        total_size_bytes = sum(os.path.getsize(os.path.join(PHOTOS_DIR, f)) for f in files)
    
    return {
        "total_users": total_users,
        "total_photos": total_photos,
        "storage_size_mb": round(total_size_bytes / (1024 * 1024), 2)
    }

@app.get("/api/user/photos/{phone}")
def get_user_photos(phone: str, request: Request):
    clean_phone = phone.replace(" ", "").replace("-", "")
    if clean_phone.startswith("+98"): clean_phone = "0" + clean_phone[3:]
    elif clean_phone.startswith("98"): clean_phone = "0" + clean_phone[2:]
    elif not clean_phone.startswith("0") and len(clean_phone) == 10: clean_phone = "0" + clean_phone
        
    if not os.path.exists(PHOTOS_DIR):
        return {"photos": []}
        
    photos = []
    base_url = str(request.base_url).rstrip("/")
    for f in os.listdir(PHOTOS_DIR):
        if f.startswith(f"{clean_phone}_") or f == f"{clean_phone}.jpg":
            photos.append(f"{base_url}/photos/{f}")
            
    return {"photos": photos}

@app.on_event("startup")
def startup_event():
    if not os.path.exists(PHOTOS_DIR):
        os.makedirs(PHOTOS_DIR)
    
    # Start bot in a background thread
    thread = threading.Thread(target=run_bot, daemon=True)
    thread.start()

# Mount photos directory directly so users can view/download
app.mount("/photos", StaticFiles(directory=PHOTOS_DIR), name="photos")

# Serve static files from React build
frontend_build_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "admin-panel", "dist")
if os.path.exists(frontend_build_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_build_dir, "assets")), name="assets")

    # Catch-all route to serve React's index.html for SPA routing
    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        # Exclude API routes from this fallback
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
            
        file_path = os.path.join(frontend_build_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
            
        return FileResponse(os.path.join(frontend_build_dir, "index.html"))
else:
    print(f"Warning: Frontend build directory not found at {frontend_build_dir}")
    print("Run 'npm run build' inside 'admin-panel' directory.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
