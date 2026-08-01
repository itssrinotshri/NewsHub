from transformers import pipeline
import torch

class NewsSummarizer:
    def __init__(self):
        """Initialize the summarization model."""
        self.model_name = "facebook/bart-large-cnn"
        self.summarizer = None
        self._load_model()
    
    def _load_model(self):
        """Load the summarization model."""
        try:
            print("🔄 Loading BART summarization model...")
            self.summarizer = pipeline(
                "summarization",
                model="facebook/bart-large-cnn",
                device=0 if torch.cuda.is_available() else -1
            )
            print("✅ Summarization model loaded successfully")
        except Exception as e:
            print(f"❌ Error loading summarization model: {e}")
            # Fallback to a simpler approach
            self.summarizer = None
    
    def summarize(self, text: str, max_length: int = 150, min_length: int = 30) -> str:
        """
        Summarize the given text.
        
        Args:
            text: Input text to summarize
            max_length: Maximum length of summary
            min_length: Minimum length of summary
        
        Returns:
            Summarized text
        """
        if not text or len(text.strip()) < 50:
            return "Text too short for summarization"
        
        try:
            if self.summarizer:
                # Truncate text if too long (BART has input limits)
                if len(text) > 1024:
                    text = text[:1024]
                
                result = self.summarizer(
                    text,
                    max_length=max_length,
                    min_length=min_length,
                    do_sample=False
                )
                return result[0]['summary_text']
            else:
                # Fallback: simple extractive summarization
                return self._simple_summarize(text, max_length)
        except Exception as e:
            print(f"Error in summarization: {e}")
            return self._simple_summarize(text, max_length)
    
    def _simple_summarize(self, text: str, max_length: int) -> str:
        """Simple extractive summarization as fallback."""
        sentences = text.split('. ')
        if len(sentences) <= 2:
            return text
        
        # Take first few sentences as summary
        summary_sentences = sentences[:3]
        summary = '. '.join(summary_sentences)
        
        if not summary.endswith('.'):
            summary += '.'
        
        return summary[:max_length]

# Global instance
summarizer = NewsSummarizer()