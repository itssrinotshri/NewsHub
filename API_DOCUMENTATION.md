# REST API Documentation & Endpoint Specification

This document specifies the routing schemas, JSON query payloads, response bodies, and error responses for the News Intelligence Platform backend.

---

## 📡 Base Endpoint URL
*   **Local Development**: `http://localhost:8000`
*   **Interactive Documentation (Swagger UI)**: `http://localhost:8000/docs`
*   **ReDoc Visualizer**: `http://localhost:8000/redoc`

---

## 🚪 Core API Endpoints

### 1. Retrieve News Feed
Fetches current headlines, applying optional country, category, or keyword filters.

*   **Route**: `GET /news`
*   **Query Parameters**:
    *   `country` (string, optional, default: `'in'`): ISO-2 country code (e.g. `'in'`, `'us'`, `'gb'`).
    *   `category` (string, optional, default: `'general'`): Category filter (e.g. `'general'`, `'business'`, `'technology'`, `'science'`).
    *   `keyword` (string, optional, default: `""`): Specific search term query.
*   **Success Response (Status: 200 OK)**:
    ```json
    [
      {
        "title": "Quantum Computing Breakthrough",
        "description": "Researchers announce a 1,000-qubit processor...",
        "url": "https://techchronicle.com/quantum",
        "urlToImage": "https://techchronicle.com/quantum.jpg",
        "publishedAt": "2026-07-27T10:14:00Z",
        "source": { "name": "Tech Chronicle" }
      }
    ]
    ```

---

### 2. Generate Article Intelligence
Invokes the active AI provider to analyze an article's context, bias, sentiment, reading level, and impacts.

*   **Route**: `POST /news/intelligence`
*   **Request Headers**: `Content-Type: application/json`
*   **Request Body**:
    ```json
    {
      "title": "Quantum Computing Breakthrough",
      "description": "Researchers announce a 1,000-qubit processor...",
      "content": "Full article textual body content goes here..."
    }
    ```
*   **Success Response (Status: 200 OK)**:
    ```json
    {
      "summary": {
        "one_minute": "Scientists have successfully fabricated a scalable 1,000-qubit processor...",
        "tldr": [
          "1,000-qubit quantum chip successfully tested.",
          "Reduces calculation error rates by a factor of 10."
        ],
        "eli10": "Computers just got a whole lot smarter at solving super hard puzzle games."
      },
      "political_analysis": {
        "leaning": "Center",
        "confidence": 0.95,
        "bias_description": "Objective scientific reporting with factual data statements."
      },
      "sentiment": {
        "label": "POSITIVE",
        "score": 0.94
      },
      "domain_impact": {
        "politics": "Low",
        "economy": "Medium",
        "technology": "High",
        "future_outlook": "Widespread commercial quantum testing is anticipated by 2028."
      },
      "metadata": {
        "reading_difficulty": "Medium",
        "tags": ["quantum", "processors", "computing"]
      }
    }
    ```

---

### 3. Add Article to Favorites
Saves a bookmark into the relational database.

*   **Route**: `POST /favorites`
*   **Request Body**:
    ```json
    {
      "title": "Quantum Computing Breakthrough",
      "description": "Researchers announce a 1,000-qubit processor...",
      "url": "https://techchronicle.com/quantum",
      "urlToImage": "https://techchronicle.com/quantum.jpg",
      "publishedAt": "2026-07-27T10:14:00Z",
      "source": { "name": "Tech Chronicle" }
    }
    ```
*   **Success Response (Status: 200 OK)**:
    ```json
    { "status": "success", "message": "Article saved to favorites" }
    ```

---

### 4. Delete Article from Favorites
Removes a saved bookmark.

*   **Route**: `DELETE /favorites`
*   **Query Parameters**:
    *   `url` (string, required): The URL of the bookmarked article to delete.
*   **Success Response (Status: 200 OK)**:
    ```json
    { "status": "success", "message": "Article removed from favorites" }
    ```

---

## ⚠️ Error Codes & Formats
If an operation fails, the backend returns standard HTTP error formats:
*   `400 Bad Request`: Validation errors or missing payloads.
*   `500 Internal Server Error`: Server failure or database write blocks.

```json
{
  "detail": "Failed to communicate with AI Provider: Gemini quota exceeded"
}
```
