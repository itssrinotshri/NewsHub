# System Architecture & Design Specification

This document provides a technical walkthrough of the News Intelligence Platform's architecture, data modeling patterns, dynamic database adaptations, and multi-provider AI processing layers.

---

## 🗺️ 1. Technical Architecture & Component Boundaries

The system is decoupled into an asynchronous Python microservice (Backend API) and a modular React Single Page Application (Frontend).

```
                        +----------------------------+
                        |        React Client        |
                        |      (Single Page App)     |
                        +--------------+-------------+
                                       |
                                       | HTTP REST requests
                                       v
                        +----------------------------+
                        |     FastAPI API Engine     |
                        |    (Uvicorn ASGI Server)   |
                        +--------------+-------------+
                                       |
                     +-----------------+-----------------+
                     |                 |                 |
                     v                 v                 v
            +----------------+ +---------------+ +---------------+
            |  Database      | | Caching       | | AI Service    |
            |  Postgres/     | | (Redis 7)     | | Abstraction   |
            |  SQLite        | |               | | Layer         |
            +----------------+ +---------------+ +-------+-------+
                                                         |
                                                +--------+--------+
                                                |                 |
                                                v                 v
                                        +---------------+ +---------------+
                                        | Cloud APIs    | | Local fallback|
                                        | Gemini/OpenAI | | BART/RoBERTa  |
                                        +---------------+ +---------------+
```

### Component Details
1.  **FastAPI REST Controller (`main.py`)**: Defines endpoints, routes incoming data, handles JSON schema serialization via Pydantic, and schedules background scraping loops.
2.  **AI Provider Abstraction Layer (`services/ai_service.py`)**: Intercepts requests, selects the configured LLM API (defaulting to Gemini), applies custom system instructions, and validates returning structured outputs.
3.  **Local Fallback Engine**: If Cloud APIs fail or are unconfigured, a fallback sequence loads localized sequence classification models (BART for text summaries and RoBERTa for sentiment analysis) to execute NLP rules natively.
4.  **Dual Database Adapter (`database/db.py`)**: Directs database commands to either file-based SQLite or high-concurrency PostgreSQL using connection pools based on current environmental configurations.

---

## 💾 2. Database Adaptation Pattern

The SQLite to PostgreSQL dynamic adaptation allows local development simplicity without sacrificing scalable database needs in staging/production environments.

*   **Database Pooling**: When `DATABASE_URL` is parsed as a Postgres connection string, `psycopg2.pool.SimpleConnectionPool` manages open database descriptors, resolving SQLite thread locking under high user concurrency.
*   **Dialect Abstraction**: Query strings branch internally to accommodate target syntactic differences (e.g., `INSERT OR IGNORE` in SQLite vs. `ON CONFLICT (url) DO NOTHING` in PostgreSQL, and `?` vs. `%s` placeholders).

---

## 🧠 3. Multi-Provider AI Abstraction

The AI engine in `ai_service.py` translates raw article details into detailed structured metrics.

1.  **Strict Schema Prompts**: Instructions explicitly mandate valid JSON output matching:
    ```json
    {
      "summary": { "one_minute": "...", "tldr": ["..."], "eli10": "..." },
      "political_analysis": { "leaning": "...", "confidence": 0.0, "bias_description": "..." },
      "sentiment": { "label": "...", "score": 0.0 },
      "domain_impact": { "politics": "...", "economy": "...", "technology": "...", "future_outlook": "..." },
      "metadata": { "reading_difficulty": "...", "tags": ["..."] }
    }
    ```
2.  **Fallback Heuristics**: If the local fallback is triggered, keywords and sentiment indices formulate simulated JSON insights, ensuring client cards render fully without exceptions.
