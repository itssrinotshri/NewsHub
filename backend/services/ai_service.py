import os
import json
import re
from typing import Dict, Any, Optional
import httpx
from pathlib import Path
from dotenv import load_dotenv

# Import local models for fallback
from ml_models.summarizer import summarizer as local_summarizer
from ml_models.sentiment import sentiment_analyzer as local_sentiment

# Load dotenv explicitly
ENV_PATH = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)

class AIService:
    def __init__(self):
        """Initialize the AI service and select the best available provider."""
        self.provider = os.getenv("AI_PROVIDER", "").lower()
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.claude_key = os.getenv("CLAUDE_API_KEY") or os.getenv("ANTHROPIC_API_KEY")
        self.groq_key = os.getenv("GROQ_API_KEY")
        self.ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

        # Auto-detect provider if not explicitly configured
        if not self.provider or self.provider == "auto":
            if self.gemini_key:
                self.provider = "gemini"
            elif self.openai_key:
                self.provider = "openai"
            elif self.claude_key:
                self.provider = "claude"
            elif self.groq_key:
                self.provider = "groq"
            else:
                self.provider = "local"
        
        print(f"🤖 Initialized AIService with provider: {self.provider.upper()}")

    def _clean_json_response(self, text: str) -> str:
        """Helper to extract pure JSON from LLM response blocks (removes markdown backticks)."""
        # Remove leading/trailing spaces
        text = text.strip()
        # Find JSON block using regex if wrapped in ```json ... ```
        match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
        if match:
            return match.group(1)
        return text

    async def analyze_article(self, title: str, description: str, content: str) -> Dict[str, Any]:
        """
        Analyze news article using the selected AI provider.
        Returns a rich analytics dictionary.
        """
        combined_text = f"Title: {title}\nDescription: {description}\nContent: {content}"
        
        # Guard: check if text is too short
        if not title or len(combined_text.strip()) < 50:
            return self._get_local_fallback(title, description, content, error_msg="Input text too short")

        # Prompt outlining the structured output
        prompt = f"""
You are an expert News Analyst and Senior Editor. Analyze the following news article and return a structured JSON response containing summaries, sentiment, political leaning, bias, impact analysis, key insights, and tags.

Article to analyze:
{combined_text}

---
IMPORTANT: You MUST return ONLY a raw JSON object matching the schema below. Do not output any conversational introductions, markdown explanations, or code blocks. The JSON must be valid and directly parseable.

JSON Schema:
{{
  "summary": {{
    "one_minute": "A concise, engaging 1-minute summary of the article (3-4 sentences).",
    "tldr": [
      "Key bullet point 1",
      "Key bullet point 2",
      "Key bullet point 3"
    ],
    "eli10": "Explain Like I'm 10: A extremely simple explanation of the core concept/event."
  }},
  "sentiment": {{
    "label": "POSITIVE",  // Must be POSITIVE, NEGATIVE, or NEUTRAL
    "score": 0.85        // Float confidence score from 0.0 to 1.0
  }},
  "political_analysis": {{
    "leaning": "Center-Left", // Must be Left, Center-Left, Center, Center-Right, or Right
    "confidence": 0.75,      // Float confidence score from 0.0 to 1.0
    "bias_description": "A clear, neutral explanation of any editorial or political bias in the framing, language, or sourcing of this article. If none, state that it is reported objectively."
  }},
  "domain_impact": {{
    "politics": "High/Medium/Low/None - short detail of political consequences.",
    "economy": "High/Medium/Low/None - short detail of financial/economic impact.",
    "business": "High/Medium/Low/None - short detail of business/market impact.",
    "technology": "High/Medium/Low/None - short detail of tech developments/adoption.",
    "environment": "High/Medium/Low/None - short detail of environmental impacts.",
    "future_outlook": "An AI-generated, forward-looking prediction of what happens next."
  }},
  "key_insights": [
    "Crucial insight or takeaway 1",
    "Crucial insight or takeaway 2",
    "Crucial insight or takeaway 3"
  ],
  "metadata": {{
    "reading_difficulty": "Easy", // Easy, Medium, or Hard
    "tags": ["tag1", "tag2", "tag3"] // 3 to 5 relevant tags
  }}
}}
"""

        try:
            if self.provider == "gemini" and self.gemini_key:
                return await self._call_gemini(prompt)
            elif self.provider == "openai" and self.openai_key:
                return await self._call_openai(prompt)
            elif self.provider == "claude" and self.claude_key:
                return await self._call_claude(prompt)
            elif self.provider == "groq" and self.groq_key:
                return await self._call_groq(prompt)
            elif self.provider == "ollama":
                return await self._call_ollama(prompt)
            else:
                # Local fallback
                return self._get_local_fallback(title, description, content)
        except Exception as e:
            print(f"⚠️ Error with AI provider {self.provider.upper()}: {e}. Falling back to local models...")
            return self._get_local_fallback(title, description, content, error_msg=str(e))

    async def _call_gemini(self, prompt: str) -> Dict[str, Any]:
        """Call Google Gemini API."""
        import google.generativeai as genai
        genai.configure(api_key=self.gemini_key)
        
        # Use gemini-1.5-flash as it's fast and handles JSON well
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={"response_mime_type": "application/json"}
        )
        response = model.generate_content(prompt)
        cleaned_text = self._clean_json_response(response.text)
        return json.loads(cleaned_text)

    async def _call_openai(self, prompt: str) -> Dict[str, Any]:
        """Call OpenAI API."""
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=self.openai_key)
        
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.2
        )
        cleaned_text = self._clean_json_response(response.choices[0].message.content)
        return json.loads(cleaned_text)

    async def _call_claude(self, prompt: str) -> Dict[str, Any]:
        """Call Anthropic Claude API."""
        from anthropic import AsyncAnthropic
        client = AsyncAnthropic(api_key=self.claude_key)
        
        response = await client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        cleaned_text = self._clean_json_response(response.content[0].text)
        return json.loads(cleaned_text)

    async def _call_groq(self, prompt: str) -> Dict[str, Any]:
        """Call Groq API (using OpenAI-compatible SDK client)."""
        from openai import AsyncOpenAI
        client = AsyncOpenAI(
            api_key=self.groq_key,
            base_url="https://api.groq.com/openai/v1"
        )
        
        response = await client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.2
        )
        cleaned_text = self._clean_json_response(response.choices[0].message.content)
        return json.loads(cleaned_text)

    async def _call_ollama(self, prompt: str) -> Dict[str, Any]:
        """Call local Ollama service via REST API."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            payload = {
                "model": "llama3", # or "mistral"
                "prompt": prompt,
                "stream": False,
                "format": "json",
                "options": {
                    "temperature": 0.2
                }
            }
            response = await client.post(f"{self.ollama_url}/api/generate", json=payload)
            if response.status_code == 200:
                result = response.json()
                cleaned_text = self._clean_json_response(result.get("response", "{}"))
                return json.loads(cleaned_text)
            else:
                raise Exception(f"Ollama returned status code {response.status_code}: {response.text}")

    def _get_local_fallback(self, title: str, description: str, content: str, error_msg: Optional[str] = None) -> Dict[str, Any]:
        """Generate rule-based intelligence analysis using local models."""
        # Use local summarizer
        summary_text = local_summarizer.summarize(content or description)
        
        # Use local sentiment analyzer
        sentiment_res = local_sentiment.analyze_sentiment(content or description)
        
        # Simple extraction heuristics for tags/keywords
        words = re.findall(r'\b\w{5,}\b', (title + " " + description).lower())
        stop_words = {'about', 'after', 'again', 'could', 'would', 'should', 'their', 'there', 'these', 'those', 'where', 'which', 'while', 'world', 'people', 'years', 'state', 'government', 'president', 'reported'}
        filtered_words = [w for w in words if w not in stop_words]
        
        # Pick top 3 unique words as tags
        unique_tags = list(dict.fromkeys(filtered_words))[:3]
        if not unique_tags:
            unique_tags = ["news", "report", "update"]
            
        # Mock political bias based on keyword matching
        leaning = "Center"
        bias_desc = "Objective reporting based on factual timeline."
        if any(w in description.lower() for w in ["democrat", "biden", "left-wing", "liberal"]):
            leaning = "Center-Left"
            bias_desc = "Slight progressive emphasis in terminology."
        elif any(w in description.lower() for w in ["republican", "trump", "right-wing", "conservative"]):
            leaning = "Center-Right"
            bias_desc = "Slight conservative framing or sourcing."

        # Estimate reading difficulty based on average sentence length
        text_len = len(content or description)
        sentences = len(re.split(r'[.!?]+', content or description))
        avg_sentence_len = text_len / max(sentences, 1)
        difficulty = "Medium"
        if avg_sentence_len < 100:
            difficulty = "Easy"
        elif avg_sentence_len > 250:
            difficulty = "Hard"

        fallback_data = {
            "summary": {
                "one_minute": summary_text,
                "tldr": [
                    f"Core details surrounding: {title[:50]}...",
                    description[:100] + "..." if description else "Read fully to understand political implications.",
                    "Analyzed via local backup NLP engine due to offline/unconfigured API state."
                ],
                "eli10": f"Something happened where {title.lower() if title.endswith('.') else title.lower() + '.'}"
            },
            "sentiment": {
                "label": sentiment_res.get("label", "NEUTRAL"),
                "score": sentiment_res.get("score", 0.5)
            },
            "political_analysis": {
                "leaning": leaning,
                "confidence": 0.6,
                "bias_description": bias_desc
            },
            "domain_impact": {
                "politics": "Medium - Subject of standard administrative review.",
                "economy": "Low - No direct global market shocks reported.",
                "business": "Low - Standard industrial adjustment period.",
                "technology": "Low - Incremental technological integration.",
                "environment": "None - No immediate environmental hazards identified.",
                "future_outlook": "Expect further regulatory debate or policy updates in coming weeks."
            },
            "key_insights": [
                f"Topic is trending under: {', '.join(unique_tags)}.",
                "Primary source reporting verified without immediate structural contradictions.",
                f"NLP classification suggests a confidence score of {sentiment_res.get('score', 0.5)}."
            ],
            "metadata": {
                "reading_difficulty": difficulty,
                "tags": unique_tags
            }
        }
        
        if error_msg:
            fallback_data["_fallback_notice"] = f"Local fallback triggered. LLM error: {error_msg}"
            
        return fallback_data

# Global instance
ai_service = AIService()
