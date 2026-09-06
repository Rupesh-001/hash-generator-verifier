# 🔐 HashLab — Hash Generator & Verifier

A modern cybersecurity utility for generating and verifying cryptographic hashes of text and files using **MD5, SHA-256, and SHA-512**.

HashLab provides a simple web interface backed by a **FastAPI REST API**, making it useful for learning cryptographic hashing, file integrity verification, and practical cybersecurity concepts.

---

## 🚀 Features

- 🔑 Generate cryptographic hashes from text
- 📁 Generate hashes from uploaded files
- 🔍 Verify text against an expected hash
- 🛡️ Verify file integrity using hashes
- ⚡ Supports MD5, SHA-256, and SHA-512
- 📤 Drag-and-drop file upload
- 📋 One-click hash copying
- ⏳ Loading and error states
- 📱 Responsive user interface
- 🔒 Constant-time hash comparison using `hmac.compare_digest`
- 🌐 REST API built with FastAPI
- ⚛️ React-based frontend

---

## 🧰 Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Python
- FastAPI
- Uvicorn
- `hashlib`
- `hmac`

### Deployment

- Vercel

---

## 🏗️ Architecture

```text
┌──────────────────────────────┐
│          React UI             │
│                              │
│  Text Hashing                │
│  File Hashing                │
│  Hash Verification           │
└──────────────┬───────────────┘
               │
               │ HTTP REST API
               ▼
┌──────────────────────────────┐
│        FastAPI Backend       │
│                              │
│  /api/hash/text              │
│  /api/hash/file              │
│  /api/verify/text            │
│  /api/verify/file            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       Python hashlib         │
│                              │
│     MD5 / SHA-256 / SHA-512  │
└──────────────────────────────┘
