from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import hashlib
import hmac

app = FastAPI(
    title="HashLab API",
    description="Hash generation and verification API",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Supported hashing algorithms
SUPPORTED_ALGORITHMS = {
    "md5": hashlib.md5,
    "sha256": hashlib.sha256,
    "sha512": hashlib.sha512,
}


def get_hash_function(algorithm: str):
    algorithm = algorithm.lower()

    if algorithm not in SUPPORTED_ALGORITHMS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported algorithm. "
                "Choose from: md5, sha256, sha512"
            ),
        )

    return SUPPORTED_ALGORITHMS[algorithm]


# =========================================
# ROOT
# =========================================

@app.get("/")
def root():
    return {
        "message": "HashLab API",
        "status": "running",
        "version": "1.0.0",
    }


# =========================================
# HEALTH CHECK
# =========================================

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy"
    }


# =========================================
# HASH TEXT
# =========================================

@app.post("/api/hash/text")
def hash_text(
    text: str,
    algorithm: str = "sha256",
):
    hash_function = get_hash_function(algorithm)

    hash_value = hash_function(
        text.encode("utf-8")
    ).hexdigest()

    return {
        "type": "text",
        "algorithm": algorithm.lower(),
        "hash": hash_value,
    }


# =========================================
# HASH FILE
# =========================================

@app.post("/api/hash/file")
async def hash_file(
    file: UploadFile = File(...),
    algorithm: str = "sha256",
):
    hash_function = get_hash_function(algorithm)

    hasher = hash_function()

    # Read the file in 1 MB chunks.
    # This avoids loading large files completely
    # into memory.
    while chunk := await file.read(1024 * 1024):
        hasher.update(chunk)

    hash_value = hasher.hexdigest()

    return {
        "type": "file",
        "filename": file.filename,
        "algorithm": algorithm.lower(),
        "hash": hash_value,
    }


# =========================================
# VERIFY TEXT
# =========================================

@app.post("/api/verify/text")
def verify_text_hash(
    text: str,
    expected_hash: str,
    algorithm: str = "sha256",
):
    hash_function = get_hash_function(algorithm)

    expected_hash = expected_hash.strip().lower()

    if not expected_hash:
        raise HTTPException(
            status_code=400,
            detail="Expected hash is required.",
        )

    actual_hash = hash_function(
        text.encode("utf-8")
    ).hexdigest()

    verified = hmac.compare_digest(
        actual_hash,
        expected_hash,
    )

    return {
        "type": "text",
        "algorithm": algorithm.lower(),
        "expected_hash": expected_hash,
        "actual_hash": actual_hash,
        "verified": verified,
    }


# =========================================
# VERIFY FILE
# =========================================

@app.post("/api/verify/file")
async def verify_file_hash(
    file: UploadFile = File(...),
    expected_hash: str = "",
    algorithm: str = "sha256",
):
    hash_function = get_hash_function(algorithm)

    expected_hash = expected_hash.strip().lower()

    if not expected_hash:
        raise HTTPException(
            status_code=400,
            detail="Expected hash is required.",
        )

    hasher = hash_function()

    while chunk := await file.read(1024 * 1024):
        hasher.update(chunk)

    actual_hash = hasher.hexdigest()

    verified = hmac.compare_digest(
        actual_hash,
        expected_hash,
    )

    return {
        "type": "file",
        "filename": file.filename,
        "algorithm": algorithm.lower(),
        "expected_hash": expected_hash,
        "actual_hash": actual_hash,
        "verified": verified,
    }