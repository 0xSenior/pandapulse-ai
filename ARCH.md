# Comprehensive Engineering Prompt: "PandaPulse AI" (Clean Architecture, Cinematic Landing, Bottom Dock & Production RAG Repository)

Act as a Principal Software Architect, an Elite AI Engineer, and a World-Class Creative Technologist. You are building a production-grade, enterprise-ready full-stack RAG (Retrieval-Augmented Generation) application inside **Antigravity IDE**, delivered as a complete, fully documented, and runnable Git repository from A to Z.

---

## 1. Complete Tech Stack & Model Selection (From A to Z)

| Layer | Technology / Tool | Version / Spec | Role in System |
| :--- | :--- | :--- | :--- |
| **Language & Runtime** | Python | 3.11+ | High-performance backend execution |
| **Backend Framework** | FastAPI | >= 0.110 | Asynchronous REST & Server-Sent Events (SSE) |
| **Serialization** | Pydantic v2 + orjson | Latest | Ultra-fast data validation and O(1) serialization |
| **Vector Database** | ChromaDB (Persistent) | Latest | Vector indexing, Cosine similarity search |
| **Embedding Model** | `nomic-embed-text` | via Ollama | Local vector embedding (8192 context window) |
| **Generation LLM** | `llama3:8b` (or `qwen2.5-coder:7b`) | via Ollama | Context-grounded response generation & code synthesis |
| **LLM Orchestration** | LangChain / LangChain-Community | Latest | Modular document chunking, prompting & retrieval chains |
| **Frontend Framework** | React 18 / Next.js 14 + Vite | Latest | Single Page App with fast client routing |
| **Styling & Design System** | Tailwind CSS + CSS Modules | v3.4+ | Cinematic Dark Theme, Glassmorphism, animations |
| **Icons & Motion** | Lucide React + Framer Motion | Latest | Spring-physics transitions & macOS-style dock hover |
| **Syntax Highlighting** | Prism.js / Highlight.js | Latest | Python & Pandas syntax highlighting with copy buttons |
| **Containerization** | Docker & Docker Compose | Compose v2 | Multi-container orchestration & host networking |
| **Dev Environment** | Antigravity IDE | Integrated | Full codebase scaffolding, linting, and execution |

---

## 2. Brand Identity & Visual Philosophy

- **Project Brand Name:** **PandaPulse AI**
- **Tagline:** *The Sub-millisecond Neural Engine for Modern Pandas Data Engineering.*
- **Visual Atmosphere (Cinematic Glassmorphism):**
  - Ultra-deep space theme: Background `#050811` transitioning to deep navy obsidian `#090d1a`.
  - Accent Gradients: Hyper-vibrant Cyan (`#00f2fe`), Electric Violet (`#4facfe`), and glowing Pandas Amber (`#f59e0b`).
  - Landing Hero Experience: Ambient glowing aura, subtle grid patterns, particle float micro-animations, and bold typography (`Cabinet Grotesk` or `Geist Sans` + `JetBrains Mono` for code).
- **Navigation Architecture (Floating Bottom Dock):**
  - A sleek, floating glassmorphic **Bottom Navigation Bar (macOS Dock style)** fixed at `bottom-6 left-1/2 -translate-x-1/2` with `backdrop-blur-2xl`, subtle border glow (`border-white/10`), and tooltips.
  - Dock Items:
    1. **Home / Hero (Landing Page)**: Cinematic overview, real-time benchmarks, live feature matrix.
    2. **Assistant (Chatbot)**: Real-time neural query workspace with live token streaming and citation drawer.
    3. **Documentation (System Architecture)**: Interactive Clean Architecture blueprint & RAG pipeline visualization.
    4. **Knowledge Base (Index Engine)**: Live vector database metrics, chunk inspections, and re-indexing controls.
    5. **The Engineer (About the Developer)**: High-end developer profile card showcasing engineering background, tech stack, and social/GitHub links.

---

## 3. End-to-End Execution Plan (From A to Z)

1. **Phase 1: Ingestion & Vector Indexing:**
   - Place Markdown/Text documentation into `backend/data/pandas_docs/`.
   - Calculate SHA-256 hashes per file; skip re-indexing if hashes match the stored manifest.
   - Chunk with `RecursiveCharacterTextSplitter` (700 chars, 100 overlap, code-conscious separators).
   - Generate embeddings via `nomic-embed-text` and persist into ChromaDB.
2. **Phase 2: RAG Retrieval & Cache-First Routing:**
   - Incoming user query is checked against an in-memory thread-safe LRU Cache ($O(1)$ lookup).
   - On cache miss, query embedding is computed, and ChromaDB retrieves top-$k$ relevant chunks ($k=3$).
   - Guardrail prompt injects the context and strictly forbids deprecated APIs (e.g., enforce `.concat()` over `.append()`).
3. **Phase 3: Generation & Token Streaming:**
   - `llama3` generates the answer via asynchronous generator streams (`AsyncIterator` via FastAPI SSE).
   - Frontend consumes SSE and renders tokens with smooth cursor animations.
4. **Phase 4: UI/UX Pro Max Landing & Dock Experience:**
   - Smooth navigation through the macOS-inspired bottom dock.
   - Interactive system pipeline rendering and real-time database statistics.

---

## 4. Software Architecture: Clean Architecture & SOLID (OOP)

Strictly isolate layers into **Domain**, **Application (Use Cases)**, **Infrastructure**, and **Presentation/Interface Adapters**:

```text
pandapulse-ai/
├── .github/
│   └── workflows/
│       └── ci.yml                # Automated linting and tests
├── .gitignore                    # Python, Node, ChromaDB, and environment exclusions
├── backend/
│   ├── app/
│   │   ├── domain/               # Enterprise Rules (Entities & Abstract Interfaces)
│   │   │   ├── entities.py       # Query, Chunk, RetrievalResult, PromptTemplate
│   │   │   └── interfaces.py     # IVectorStore, ILLMProvider, IDocLoader, ICache
│   │   ├── application/          # Use Cases (Business Orchestration)
│   │   │   ├── use_cases.py      # QueryPandasDocsUseCase, IngestDocsUseCase, GetStatusUseCase
│   │   │   └── dto.py            # Data Transfer Objects
│   │   ├── infrastructure/       # External Implementations
│   │   │   ├── cache/            # O(1) LRU Query Cache with SHA-256 keys
│   │   │   ├── llm/              # Ollama Provider (Llama3 client implementation)
│   │   │   ├── vector_db/        # ChromaDB Manager & nomic-embed-text client
│   │   │   └── loaders/          # Chunking & incremental markdown ingestion
│   │   ├── presentation/         # API Routers & Schemas
│   │   │   ├── routes.py         # /chat, /stream-chat, /status, /reindex
│   │   │   ├── schemas.py        # Pydantic v2 validation models
│   │   │   └── dependencies.py   # Strict Dependency Injection Container
│   │   ├── core/
│   │   │   └── config.py         # Settings & environment variables
│   │   └── main.py               # FastAPI factory & CORS configuration
│   ├── data/pandas_docs/         # Documentation target directory
│   ├── chroma_db/                # Persistent vector storage
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dock/             # Floating Glassmorphic Bottom Dock Navigation
│   │   │   │   └── FloatingDock.jsx
│   │   │   ├── ui/               # Glassmorphic cards, Glowing buttons, Shimmer loaders
│   │   │   ├── landing/          # Cinematic Hero, interactive benchmarks, feature showcase
│   │   │   │   ├── HeroSection.jsx
│   │   │   │   └── FeatureGrid.jsx
│   │   │   ├── chat/             # Streaming chat, Markdown parser, source drawer
│   │   │   │   ├── ChatContainer.jsx
│   │   │   │   ├── MessageBubble.jsx
│   │   │   │   └── SourceDrawer.jsx
│   │   │   └── docs/             # Animated RAG & Clean Architecture diagrams
│   │   ├── pages/
│   │   │   ├── HomePage.jsx      # Cinematic Landing Page
│   │   │   ├── ChatPage.jsx      # PandaPulse AI Assistant
│   │   │   ├── DocsPage.jsx      # System Architecture & Documentation
│   │   │   ├── KnowledgePage.jsx # Index Status & DB management
│   │   │   └── EngineerPage.jsx  # Developer / Engineer Profile Showcase
│   │   ├── hooks/                # Custom React hooks (useChatStream, useDock)
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── tailwind.config.js
│   ├── package.json
│   └── Dockerfile
├── docs/
│   ├── assets/                   # Architecture diagrams & mock preview screenshots
│   ├── ARCHITECTURE.md           # Clean Architecture layer breakdown & time complexity analysis
│   └── SETUP.md                  # Virtual environment and local runbook
├── docker-compose.yml
└── README.md                     # Comprehensive showcase README