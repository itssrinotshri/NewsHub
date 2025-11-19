from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import List, Dict

class NewsRecommender:
    def __init__(self):
        """Initialize the recommendation system."""
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        self.articles = []
        self.article_vectors = None
        self.is_fitted = False
    
    def fit(self, articles: List[Dict]):
        """
        Fit the recommendation system with articles.
        
        Args:
            articles: List of article dictionaries with 'title', 'description', and 'content'
        """
        self.articles = articles
        
        # Combine title, description, and content for better representation
        texts = []
        cleaned_articles = []
        for article in articles:
            text_parts = []
            if article.get('title'):
                text_parts.append(article['title'])
            if article.get('description'):
                text_parts.append(article['description'])
            if article.get('content'):
                text_parts.append(article['content'])

            combined_text = ' '.join(text_parts).strip()
            # Guard: skip empty or very short texts (avoid empty vocabulary)
            if combined_text and len(combined_text.split()) >= 3:
                texts.append(combined_text)
                cleaned_articles.append(article)

        if not texts:
            # Nothing useful to fit on
            self.articles = []
            self.article_vectors = None
            self.is_fitted = False
            print("⚠️ Skipping recommender fit: no usable article text")
            return

        # Fit TF-IDF vectorizer with safeguards
        try:
            self.article_vectors = self.vectorizer.fit_transform(texts)
            self.articles = cleaned_articles
            self.is_fitted = True
            print(f"✅ Recommendation system fitted with {len(cleaned_articles)} articles")
        except ValueError as e:
            # e.g., "empty vocabulary; perhaps the documents only contain stop words"
            self.articles = []
            self.article_vectors = None
            self.is_fitted = False
            print(f"⚠️ Recommender fit skipped due to ValueError: {e}")
    
    def recommend_similar(self, target_article: Dict, n_recommendations: int = 3) -> List[Dict]:
        """
        Find similar articles to the target article.
        
        Args:
            target_article: Article to find similar articles for
            n_recommendations: Number of recommendations to return
        
        Returns:
            List of similar articles with similarity scores
        """
        if not self.is_fitted:
            return []
        
        # Prepare target article text
        text_parts = []
        if target_article.get('title'):
            text_parts.append(target_article['title'])
        if target_article.get('description'):
            text_parts.append(target_article['description'])
        if target_article.get('content'):
            text_parts.append(target_article['content'])
        
        target_text = ' '.join(text_parts)
        
        # If not enough training data, bail out gracefully
        if not self.is_fitted or self.article_vectors is None:
            return []

        # Vectorize target article
        try:
            target_vector = self.vectorizer.transform([target_text])
        except ValueError:
            return []
        
        # Calculate cosine similarities
        similarities = cosine_similarity(target_vector, self.article_vectors).flatten()
        
        # Get indices of most similar articles (excluding the target article itself)
        similar_indices = np.argsort(similarities)[::-1]
        
        # Filter out the target article if it exists in our dataset
        recommendations = []
        for idx in similar_indices:
            if len(recommendations) >= n_recommendations:
                break
            
            # Check if this is not the same article
            if self._is_same_article(target_article, self.articles[idx]):
                continue
            
            article_with_score = self.articles[idx].copy()
            article_with_score['similarity_score'] = round(similarities[idx], 3)
            recommendations.append(article_with_score)
        
        return recommendations
    
    def _is_same_article(self, article1: Dict, article2: Dict) -> bool:
        """Check if two articles are the same based on URL or title."""
        if article1.get('url') and article2.get('url'):
            return article1['url'] == article2['url']
        
        if article1.get('title') and article2.get('title'):
            return article1['title'].lower() == article2['title'].lower()
        
        return False
    
    def get_trending_topics(self, n_topics: int = 5) -> List[str]:
        """
        Extract trending topics from articles using TF-IDF.
        
        Args:
            n_topics: Number of top topics to return
        
        Returns:
            List of trending topic terms
        """
        if not self.is_fitted or self.article_vectors is None:
            return []
        
        # Get feature names (terms)
        feature_names = self.vectorizer.get_feature_names_out()
        
        # Calculate mean TF-IDF scores across all articles
        mean_scores = np.mean(self.article_vectors.toarray(), axis=0)
        
        # Get top terms
        top_indices = np.argsort(mean_scores)[::-1][:n_topics]
        trending_topics = [feature_names[idx] for idx in top_indices]
        
        return trending_topics

# Global instance
recommender = NewsRecommender()