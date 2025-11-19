import sqlite3
import os
from typing import List, Optional

class Database:
    def __init__(self, db_path: str = "news_aggregator.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize the database and create tables if they don't exist."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create favorites table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS favorites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                url TEXT NOT NULL UNIQUE,
                urlToImage TEXT,
                publishedAt TEXT,
                source_name TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        print("✅ Database initialized successfully")
    
    def add_favorite(self, article: dict) -> bool:
        """Add an article to favorites."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR IGNORE INTO favorites (title, description, url, urlToImage, publishedAt, source_name)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                article.get('title', ''),
                article.get('description', ''),
                article.get('url', ''),
                article.get('urlToImage', ''),
                article.get('publishedAt', ''),
                article.get('source', {}).get('name', '')
            ))
            
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error adding favorite: {e}")
            return False
    
    def get_favorites(self) -> List[dict]:
        """Get all favorite articles."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT title, description, url, urlToImage, publishedAt, source_name, created_at
                FROM favorites
                ORDER BY created_at DESC
            ''')
            
            rows = cursor.fetchall()
            conn.close()
            
            favorites = []
            for row in rows:
                favorites.append({
                    'title': row[0],
                    'description': row[1],
                    'url': row[2],
                    'urlToImage': row[3],
                    'publishedAt': row[4],
                    'source': {'name': row[5]},
                    'created_at': row[6]
                })
            
            return favorites
        except Exception as e:
            print(f"Error getting favorites: {e}")
            return []
    
    def remove_favorite(self, url: str) -> bool:
        """Remove an article from favorites by URL."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM favorites WHERE url = ?', (url,))
            
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error removing favorite: {e}")
            return False
    
    def is_favorite(self, url: str) -> bool:
        """Check if an article is already in favorites."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('SELECT COUNT(*) FROM favorites WHERE url = ?', (url,))
            count = cursor.fetchone()[0]
            
            conn.close()
            return count > 0
        except Exception as e:
            print(f"Error checking favorite: {e}")
            return False