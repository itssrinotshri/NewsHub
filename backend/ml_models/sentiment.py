from transformers import pipeline
import torch

class SentimentAnalyzer:
    def __init__(self):
        """Initialize the sentiment analysis model."""
        self.sentiment_pipeline = None
        self._load_model()
    
    def _load_model(self):
        """Load the sentiment analysis model."""
        try:
            print("🔄 Loading sentiment analysis model...")
            self.sentiment_pipeline = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                device=0 if torch.cuda.is_available() else -1
            )
            print("✅ Sentiment analysis model loaded successfully")
        except Exception as e:
            print(f"❌ Error loading sentiment model: {e}")
            # Fallback to a simpler model
            try:
                self.sentiment_pipeline = pipeline(
                    "sentiment-analysis",
                    device=0 if torch.cuda.is_available() else -1
                )
                print("✅ Fallback sentiment model loaded")
            except Exception as e2:
                print(f"❌ Error loading fallback sentiment model: {e2}")
                self.sentiment_pipeline = None
    
    def analyze_sentiment(self, text: str) -> dict:
        """
        Analyze sentiment of the given text.
        
        Args:
            text: Input text to analyze
        
        Returns:
            Dictionary with sentiment analysis results
        """
        if not text or len(text.strip()) < 10:
            return {
                "label": "NEUTRAL",
                "score": 0.5,
                "confidence": "low"
            }
        
        try:
            if self.sentiment_pipeline:
                # Truncate text if too long
                if len(text) > 512:
                    text = text[:512]
                
                result = self.sentiment_pipeline(text)
                
                # Handle different model outputs
                if isinstance(result, list) and len(result) > 0:
                    sentiment_data = result[0]
                    label = sentiment_data['label'].upper()
                    score = sentiment_data['score']
                    
                    # Map labels to our standard format
                    if 'POSITIVE' in label or 'LABEL_2' in label:
                        label = 'POSITIVE'
                    elif 'NEGATIVE' in label or 'LABEL_0' in label:
                        label = 'NEGATIVE'
                    else:
                        label = 'NEUTRAL'
                    
                    # Determine confidence level
                    if score > 0.8:
                        confidence = "high"
                    elif score > 0.6:
                        confidence = "medium"
                    else:
                        confidence = "low"
                    
                    return {
                        "label": label,
                        "score": round(score, 3),
                        "confidence": confidence
                    }
                else:
                    return self._fallback_sentiment(text)
            else:
                return self._fallback_sentiment(text)
        except Exception as e:
            print(f"Error in sentiment analysis: {e}")
            return self._fallback_sentiment(text)
    
    def _fallback_sentiment(self, text: str) -> dict:
        """Simple rule-based sentiment analysis as fallback."""
        positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'positive', 'success', 'win', 'achievement', 'breakthrough', 'innovation', 'growth', 'profit', 'gain']
        negative_words = ['bad', 'terrible', 'awful', 'horrible', 'negative', 'failure', 'lose', 'problem', 'issue', 'crisis', 'decline', 'loss', 'crash', 'disaster', 'crisis']
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            return {"label": "POSITIVE", "score": 0.7, "confidence": "low"}
        elif negative_count > positive_count:
            return {"label": "NEGATIVE", "score": 0.7, "confidence": "low"}
        else:
            return {"label": "NEUTRAL", "score": 0.5, "confidence": "low"}

# Global instance
sentiment_analyzer = SentimentAnalyzer()