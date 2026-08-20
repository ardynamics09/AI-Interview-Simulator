import sqlite3
import hashlib
import hmac
import secrets
import json
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "simulator.db")
SECRET_KEY = os.getenv("ADMIN_JWT_SECRET", "ai_simulator_super_secret_admin_key_2026_x99")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, timeout=30.0, check_same_thread=False)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        branch TEXT,
        year TEXT,
        role TEXT,
        created_at TEXT NOT NULL,
        last_active TEXT NOT NULL,
        role_type TEXT DEFAULT 'user'
    )
    """)

    # 2. Admin Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        role_type TEXT DEFAULT 'admin',
        created_at TEXT NOT NULL,
        last_login TEXT
    )
    """)

    # 3. Interviews table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS interviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        test_id TEXT UNIQUE NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        branch TEXT,
        year TEXT,
        role TEXT,
        interview_type TEXT NOT NULL,
        overall_score REAL NOT NULL,
        performance_level TEXT,
        duration_minutes INTEGER DEFAULT 15,
        integrity_score REAL DEFAULT 100,
        tab_switches INTEGER DEFAULT 0,
        radar_skills_json TEXT,
        communication_json TEXT,
        ai_analysis_json TEXT,
        topics_to_revise_json TEXT,
        evaluated_questions_json TEXT,
        dsa_summary_json TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # 4. OTP codes table for Admin Password Reset
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS otp_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        otp_code TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        used INTEGER DEFAULT 0
    )
    """)

    # Auto-seed Default Project Owner Admin
    cursor.execute("SELECT COUNT(*) as count FROM admin_users")
    admin_count = cursor.fetchone()["count"]
    if admin_count == 0:
        default_email = "masteraniketraj09@gmail.com"
        default_username = "aniket"
        default_pass = "yashaniketraj"
        pwd_hash, salt = hash_password(default_pass)
        now_iso = datetime.utcnow().isoformat()
        cursor.execute("""
        INSERT INTO admin_users (email, username, password_hash, salt, role_type, created_at, last_login)
        VALUES (?, ?, ?, ?, 'admin', ?, ?)
        """, (default_email, default_username, pwd_hash, salt, now_iso, now_iso))
        print(f"[DATABASE] Default Owner Admin Account initialized: {default_email}")

    conn.commit()
    conn.close()

# ==========================================
# Security & Password Hashing Utilities
# ==========================================

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    pwd_bytes = password.encode("utf-8")
    salt_bytes = salt.encode("utf-8")
    pwd_hash = hashlib.pbkdf2_hmac("sha256", pwd_bytes, salt_bytes, 100000).hex()
    return pwd_hash, salt

def verify_password(password: str, salt: str, hashed: str) -> bool:
    pwd_bytes = password.encode("utf-8")
    salt_bytes = salt.encode("utf-8")
    computed = hashlib.pbkdf2_hmac("sha256", pwd_bytes, salt_bytes, 100000).hex()
    return hmac.compare_digest(computed, hashed)

def create_admin_token(email: str, username: str) -> str:
    payload = {
        "email": email,
        "username": username,
        "role": "admin",
        "exp": (datetime.utcnow() + timedelta(days=7)).isoformat()
    }
    payload_str = json.dumps(payload, separators=(',', ':'))
    payload_b64 = payload_str.encode("utf-8").hex()
    signature = hmac.new(SECRET_KEY.encode("utf-8"), payload_b64.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{signature}"

def verify_admin_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        payload_b64, signature = parts
        expected_sig = hmac.new(SECRET_KEY.encode("utf-8"), payload_b64.encode("utf-8"), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected_sig):
            return None
        payload_str = bytes.fromhex(payload_b64).decode("utf-8")
        payload = json.loads(payload_str)
        exp = datetime.fromisoformat(payload.get("exp"))
        if datetime.utcnow() > exp:
            return None
        if payload.get("role") != "admin":
            return None
        return payload
    except Exception as e:
        return None

# ==========================================
# User & Interview Sync Helpers
# ==========================================

def upsert_user(user_id: str, name: str, branch: str, year: str, role: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    clean_id = user_id.lower().strip().lstrip("@")
    now_iso = datetime.utcnow().isoformat()

    try:
        cursor.execute("SELECT id FROM users WHERE user_id = ?", (clean_id,))
        row = cursor.fetchone()
        if row:
            cursor.execute("""
            UPDATE users SET name = ?, branch = ?, year = ?, role = ?, last_active = ?
            WHERE user_id = ?
            """, (name, branch, year, role, now_iso, clean_id))
        else:
            cursor.execute("""
            INSERT INTO users (user_id, name, branch, year, role, created_at, last_active, role_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'user')
            """, (clean_id, name, branch, year, role, now_iso, now_iso))
        conn.commit()
    finally:
        conn.close()

    return {"user_id": clean_id, "name": name, "branch": branch, "year": year, "role": role}

def insert_interview_record(record: Dict[str, Any]) -> str:
    conn = get_db_connection()
    cursor = conn.cursor()

    test_id = record.get("id") or f"test_{int(datetime.utcnow().timestamp()*1000)}"
    user_id = (record.get("userId") or record.get("user_id") or "candidate").lower().strip().lstrip("@")
    user_name = record.get("name") or "Candidate"
    branch = record.get("branch") or "CSE"
    year = record.get("year") or "3rd Year"
    role = record.get("role") or "Software Engineer"
    interview_type = record.get("interviewType") or record.get("interview_type") or "Technical Interview"
    overall_score = float(record.get("overallScore") if record.get("overallScore") is not None else (record.get("overall_score") or 0))
    perf_level = record.get("performanceLevel") or "Developing"
    duration = int(record.get("durationMinutes") or 15)
    integrity = float(record.get("integrityScore") if record.get("integrityScore") is not None else 100)
    tab_switches = int(record.get("tabSwitches") or 0)

    now_iso = record.get("dateIso") or datetime.utcnow().isoformat()

    radar_json = json.dumps(record.get("radarSkills") or [])
    comm_json = json.dumps(record.get("communicationAnalysis") or {})
    ai_json = json.dumps(record.get("aiAnalysis") or {})
    topics_json = json.dumps(record.get("topicsToRevise") or [])
    questions_json = json.dumps(record.get("evaluatedQuestions") or [])
    dsa_json = json.dumps(record.get("dsaSummary") or {})

    try:
        cursor.execute("""
        INSERT OR REPLACE INTO interviews (
            test_id, user_id, user_name, branch, year, role, interview_type,
            overall_score, performance_level, duration_minutes, integrity_score,
            tab_switches, radar_skills_json, communication_json, ai_analysis_json,
            topics_to_revise_json, evaluated_questions_json, dsa_summary_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            test_id, user_id, user_name, branch, year, role, interview_type,
            overall_score, perf_level, duration, integrity, tab_switches,
            radar_json, comm_json, ai_json, topics_json, questions_json, dsa_json, now_iso
        ))

        cursor.execute("""
        INSERT INTO users (user_id, name, branch, year, role, created_at, last_active, role_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'user')
        ON CONFLICT(user_id) DO UPDATE SET last_active = excluded.last_active, name = excluded.name
        """, (user_id, user_name, branch, year, role, now_iso, now_iso))

        conn.commit()
    finally:
        conn.close()

    return test_id
