# PandaPulse AI: Local Runbook & Setup Guide

This runbook guides you through running PandaPulse AI locally, either as standalone native processes or via multi-container Docker Compose.

---

## 1. System Requirements & Prerequisites

- **Python**: Version 3.11 or higher (Python 3.11 - 3.14 supported)
- **Node.js**: Version 18.0 or higher
- **Ollama**: (Optional for full local neural generation) [https://ollama.ai](https://ollama.ai)
- **Docker & Docker Compose**: (Optional for containerized deployment)

---

## 2. Quickstart (Native Development Mode)

### Step 1: Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. (Recommended) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Linux/macOS:
   source venv/bin/activate
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
5. Start the FastAPI development server:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   *Note: On initial boot, PandaPulse will automatically index all markdown files from `data/pandas_docs/` into ChromaDB.*

### Step 2: Frontend Setup
1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web interface at **`http://localhost:5173`**.

---

## 3. Ollama Model Configuration (Optional Local LLM)

PandaPulse AI is pre-configured to communicate with Ollama at `http://localhost:11434`.

To pull the recommended models:
```bash
# 1. Pull the 768-dimensional text embedding model
ollama pull nomic-embed-text

# 2. Pull the generation model
ollama pull llama3:8b
# Or lightweight coder:
ollama pull qwen2.5-coder:7b
```

> **Resilient Fallback Design**: If Ollama is offline or the models have not finished downloading, PandaPulse AI automatically engages its internal Fast-Neural engine to deliver accurate, guardrailed Pandas 2.x answers without throwing errors.

---

## 4. Multi-Container Docker Compose Deployment

To deploy the entire stack in isolated Docker containers:

```bash
# Build and run backend and frontend containers
docker compose up --build -d
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000`
- **Swagger Docs**: `http://localhost:8000/docs`

To stop and remove containers:
```bash
docker compose down
```

---

## 5. Verification & Testing

### Run Backend Unit Tests:
```bash
cd backend
python -m pytest tests/ -v
```

### Build Production Frontend:
```bash
cd frontend
npm run build
```

### Health Check Endpoint:
```bash
curl http://localhost:8000/api/v1/status
```
