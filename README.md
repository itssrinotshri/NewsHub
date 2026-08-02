# NewsHub: AI-Powered News Intelligence Platform

NewsHub is a production-ready, open-source-quality AI news intelligence platform that aggregates live worldwide news and generates multi-dimensional intelligence briefs (structured summaries, sentiment metrics, political leaning scores, reading difficulty levels, and domain-specific impact vectors).

---

## 🌟 Core Features

*   **Real-time Aggregation**: Dynamic news ingestion using NewsAPI integrations.
*   **Auto-Refresh Feed**: Automated background news updates every 5 minutes with a glowing recency status badge.
*   **Multi-Provider AI Abstraction**: Dynamic client engine supporting **Google Gemini**, OpenAI, Claude, Groq, or Ollama.
*   **Interactive Intelligence Drawer**: Tabbed analysis panels displaying:
    *   *Summary*: 1-Minute overview, TL;DR bullet points, and "ELI10" child-friendly breakdowns.
    *   *Bias & Sentiment*: Confidence-weighted sentiment and political leaning scales.
    *   *Impact Analysis*: Vector lists showing technological, political, economic, environmental, and business impact scores.
    *   *Takeaways*: Readability scores and related context tags.
*   **Robust Local Fallback**: When API keys are unconfigured, a local PyTorch fallback utilizing `facebook/bart-large-cnn` and `twitter-roberta-base-sentiment` models runs natively offline.
*   **Bookmarks Management**: SQLite/PostgreSQL dynamic adapters with connection pools to store favorite articles.

---

## 🛠️ Technology Stack

*   **Frontend**: React (JS), Lucide Icons, Vanilla CSS (with responsive grid layouts).
*   **Backend**: FastAPI, Uvicorn, Python 3.11, Pydantic.
*   **NLP / AI**: Google Generative AI SDK, HuggingFace Transformers, PyTorch.
*   **Database**: PostgreSQL (Production) / SQLite (Local fallback).
*   **Cache**: Redis 7.

---

## 🏗️ Technical Architecture
Refer to **[ARCHITECTURE.md](file:///c:/Users/srini/Desktop/MP3/ARCHITECTURE.md)** for detailed data flow schemas.

```
[ React SPA Client ] <== HTTP ==> [ FastAPI API ] <== Connections ==> [ Database (PostgreSQL/SQLite) ]
                                      │
                                      └───> [ Gemini / Local PyTorch Models ]
```

---

## 🚀 Getting Started (Running Locally)

### Prerequisites
*   Python 3.10+
*   Node.js 18+

### 1. Configure Secrets
Create a `.env` file in the [backend/](file:///c:/Users/srini/Desktop/MP3/backend/) directory (refer to [backend/.env.example](file:///c:/Users/srini/Desktop/MP3/backend/.env.example)):
```env
NEWSAPI_KEY=your_newsapi_key
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
```

Create a `.env` file in the [frontend/](file:///c:/Users/srini/Desktop/MP3/frontend/) directory (refer to [frontend/.env.example](file:///c:/Users/srini/Desktop/MP3/frontend/.env.example)):
```env
VITE_API_BASE_URL=http://localhost:8000
```

### 2. Launch Local Servers
Run both frontend and backend using our local Windows startup scripts:

*   **Start Backend**: Run `python start_backend.py` from your terminal.
*   **Start Frontend**: Run `start_frontend.bat` from your command prompt.

---

## 🐳 Running with Docker (Local Production Stack)

To run the full stack containerized with PostgreSQL and Redis:
1. Ensure **Docker Desktop** is running.
2. Build the images:
   ```bash
   docker compose build
   ```
3. Boot up the services:
   ```bash
   docker compose up -d
   ```
4. Access the site at `http://localhost:3000`.

---

## ☁️ Zero-Docker Deployment (PaaS Hosting)
Refer to **[deployment_documentation.md](file:///C:/Users/srini/.gemini/antigravity-ide/brain/53d52c2c-8172-401b-8c7c-f478731280fd/deployment_documentation.md)** for a complete configuration guide.

*   **Frontend**: Hosted natively on Vercel (rewrites managed in [vercel.json](file:///c:/Users/srini/Desktop/MP3/frontend/vercel.json)).
*   **Backend**: Hosted on Render web services (declared in [render.yaml](file:///c:/Users/srini/Desktop/MP3/render.yaml)).
*   **Database**: Managed on Neon Serverless PostgreSQL.
*   **CI/CD**: Automatic lint/test/deploy loops managed by GitHub Actions inside `.github/workflows/`.

---

## 🤝 Contributing
Contributions are welcome! Please read **[CONTRIBUTING.md](file:///c:/Users/srini/Desktop/MP3/CONTRIBUTING.md)** and **[CODE_OF_CONDUCT.md](file:///c:/Users/srini/Desktop/MP3/CODE_OF_CONDUCT.md)** before opening PRs.

---

## 📄 License
This project is open-source and distributed under the **[MIT License](file:///c:/Users/srini/Desktop/MP3/LICENSE)**.