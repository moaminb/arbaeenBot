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
    has_received_photo: Optional[int] = 0

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

@app.put("/api/users/{user_id}")
def update_user(user_id: int, user: User, _ = Depends(verify_admin)):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("""
        UPDATE users 
        SET language=?, name=?, profession=?, contribution=?, phone_number=?, has_received_photo=? 
        WHERE user_id=?
    """, (user.language, user.name, user.profession, user.contribution, user.phone_number, user.has_received_photo, user_id))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/api/upload_manual")
async def upload_manual(phone_number: str = Form(...), files: List[UploadFile] = File(...), _ = Depends(verify_admin)):
    # Clean phone number
    phone = phone_number.replace(" ", "").replace("-", "")
    if not phone.startswith('+') or not phone[1:].isdigit():
        raise HTTPException(status_code=400, detail="شماره موبایل باید با فرمت کد کشور وارد شود (مثلاً +989123456789)")
    
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
            if not p.startswith('+') or not p[1:].isdigit():
                raise HTTPException(status_code=400, detail=f"فرمت شماره موبایل نامعتبر است: {p}. باید همراه با کد کشور باشد (مثال: +989123456789)")
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
    bot.remove_webhook()
    bot.infinity_polling()


@app.get("/api/stats")
def get_stats(_ = Depends(verify_admin)):
    import datetime
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM users")
    total_users = c.fetchone()[0]
    
    # Get users grouped by date (YYYY-MM-DD)
    c.execute("SELECT DATE(created_at), COUNT(*) FROM users GROUP BY DATE(created_at) ORDER BY DATE(created_at)")
    users_by_date = {row[0]: row[1] for row in c.fetchall() if row[0]}
    conn.close()

    total_photos = 0
    total_size_bytes = 0
    photos_by_date = {}
    storage_by_date = {}
    
    if os.path.exists(PHOTOS_DIR):
        files = [f for f in os.listdir(PHOTOS_DIR) if f.endswith('.jpg')]
        total_photos = len(files)
        total_size_bytes = sum(os.path.getsize(os.path.join(PHOTOS_DIR, f)) for f in files)
        
        # Group by file modification time
        for f in files:
            filepath = os.path.join(PHOTOS_DIR, f)
            mtime = os.path.getmtime(filepath)
            date_str = datetime.datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')
            size = os.path.getsize(filepath)
            
            photos_by_date[date_str] = photos_by_date.get(date_str, 0) + 1
            storage_by_date[date_str] = storage_by_date.get(date_str, 0) + size
            
    # Merge dates to create a unified timeline
    all_dates = set(users_by_date.keys()).union(set(photos_by_date.keys()))
    sorted_dates = sorted(list(all_dates))
    
    historical_data = []
    cum_users = 0
    cum_photos = 0
    cum_storage = 0
    
    for date in sorted_dates:
        cum_users += users_by_date.get(date, 0)
        cum_photos += photos_by_date.get(date, 0)
        cum_storage += storage_by_date.get(date, 0)
        
        historical_data.append({
            "date": date,
            "users": cum_users,
            "photos": cum_photos,
            "storage_mb": round(cum_storage / (1024 * 1024), 2)
        })

    return {
        "total_users": total_users,
        "total_photos": total_photos,
        "storage_size_mb": round(total_size_bytes / (1024 * 1024), 2),
        "historical_data": historical_data
    }


@app.get("/api/user/photos/{phone}")
def get_user_photos(phone: str, request: Request):
    clean_phone = phone.replace(" ", "").replace("-", "")
    if not clean_phone.startswith("+"):
        clean_phone = "+" + clean_phone
        
    if not os.path.exists(PHOTOS_DIR):
        return {"photos": []}
        
    photos = []
    base_url = str(request.base_url).rstrip("/")
    for f in os.listdir(PHOTOS_DIR):
        if f.startswith(f"{clean_phone}_") or f == f"{clean_phone}.jpg":
            photos.append(f"{base_url}/photos/{f}")
            
    return {"photos": photos}

@app.get("/api/admin/photos")
def get_admin_photos(request: Request, _ = Depends(verify_admin)):
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT phone_number, has_received_photo FROM users WHERE phone_number IS NOT NULL")
    users = c.fetchall()
    conn.close()
    
    # Map phone to status
    user_status = {}
    for row in users:
        p = row['phone_number']
        if p:
            user_status[p] = row['has_received_photo']
            
    if not os.path.exists(PHOTOS_DIR):
        return {"items": []}
        
    items = []
    base_url = str(request.base_url).rstrip("/")
    
    # Group photos by phone number
    phone_photos = {}
    for f in os.listdir(PHOTOS_DIR):
        if f.endswith('.jpg'):
            # Extract phone from filename (e.g., 09123456789.jpg or 09123456789_2.jpg)
            phone_part = f.split('_')[0].replace('.jpg', '')
            if phone_part not in phone_photos:
                phone_photos[phone_part] = []
            phone_photos[phone_part].append(f"{base_url}/photos/{f}")
            
    for phone, urls in phone_photos.items():
        items.append({
            "phone_number": phone,
            "has_received_photo": user_status.get(phone, 0),
            "photos": urls
        })
        
    return {"items": items}

@app.delete("/api/admin/photos/{filename}")
def delete_photo(filename: str, _ = Depends(verify_admin)):
    file_path = os.path.join(PHOTOS_DIR, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        return {"status": "success", "message": "Photo deleted"}
    raise HTTPException(status_code=404, detail="File not found")

@app.on_event("startup")
def startup_event():
    if not os.path.exists(PHOTOS_DIR):
        os.makedirs(PHOTOS_DIR)
        
    # Migration for has_received_photo
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute("ALTER TABLE users ADD COLUMN has_received_photo INTEGER DEFAULT 0")
        conn.commit()
    except sqlite3.OperationalError:
        pass # Column already exists
        
    # Migration for created_at
    try:
        c.execute("SELECT created_at FROM users LIMIT 1")
    except sqlite3.OperationalError:
        print("Migrating database to add created_at column...")
        c.execute("ALTER TABLE users RENAME TO users_old")
        c.execute('''CREATE TABLE users
                     (user_id INTEGER PRIMARY KEY,
                      language TEXT,
                      name TEXT,
                      profession TEXT,
                      contribution TEXT,
                      phone_number TEXT,
                      has_received_photo INTEGER DEFAULT 0,
                      created_at DATETIME DEFAULT CURRENT_TIMESTAMP)''')
        
        # Determine columns that actually existed in users_old to avoid errors if some are missing
        c.execute("PRAGMA table_info(users_old)")
        columns = [row[1] for row in c.fetchall()]
        
        # Build the INSERT statement dynamically based on available columns
        target_cols = []
        select_cols = []
        for col in ["user_id", "language", "name", "profession", "contribution", "phone_number", "has_received_photo"]:
            if col in columns:
                target_cols.append(col)
                select_cols.append(col)
                
        target_str = ", ".join(target_cols)
        select_str = ", ".join(select_cols)
        
        c.execute(f"INSERT INTO users ({target_str}) SELECT {select_str} FROM users_old")
        c.execute("DROP TABLE users_old")
        conn.commit()
    finally:
        conn.close()
    
    # Start bots in a background thread
    thread = threading.Thread(target=run_bot, daemon=True)
    thread.start()
    
    from bale_bot import bot as b_bot
    def run_bale_bot():
        print("Bale Bot is starting in background...")
        try:
            b_bot.polling(none_stop=True)
        except Exception as e:
            print(f"Bale Bot error: {e}")

    bale_thread = threading.Thread(target=run_bale_bot, daemon=True)
    bale_thread.start()
    
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
