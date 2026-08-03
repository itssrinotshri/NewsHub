import os
from typing import List, Optional

class Database:
    def __init__(self, db_path: str = "news_aggregator.db"):
        self.db_path = db_path
        self.db_url = os.getenv("DATABASE_URL")
        self.is_postgres = False
        self.pool = None

        # Detect database URL and configure connection pooling
        if self.db_url and (self.db_url.startswith("postgresql://") or self.db_url.startswith("postgres://")):
            self.is_postgres = True
            try:
                import psycopg2
                from psycopg2.pool import SimpleConnectionPool
                
                # Setup a connection pool for concurrent environments (min 1, max 10 conns)
                self.pool = SimpleConnectionPool(1, 10, self.db_url)
                print("🔌 PostgreSQL Connection Pool initialized successfully")
            except Exception as e:
                print(f"❌ Error setting up PostgreSQL Connection Pool: {e}. Falling back to SQLite.")
                self.is_postgres = False

        self.init_database()
    
    def get_connection(self):
        """Get database connection from pool or file."""
        if self.is_postgres:
            return self.pool.getconn()
        else:
            import sqlite3
            return sqlite3.connect(self.db_path)

    def release_connection(self, conn):
        """Release connection back to the pool or close it."""
        if self.is_postgres:
            self.pool.putconn(conn)
        else:
            conn.close()

    def init_database(self):
        """Initialize the database and create tables if they don't exist."""
        conn = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            if self.is_postgres:
                # PostgreSQL Serial Auto-increment syntax
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS favorites (
                        id SERIAL PRIMARY KEY,
                        title TEXT NOT NULL,
                        description TEXT,
                        url TEXT NOT NULL UNIQUE,
                        urlToImage TEXT,
                        publishedAt TEXT,
                        source_name TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
            else:
                # SQLite Auto-increment syntax
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
            print("✅ Database tables verified and initialized successfully")
        except Exception as e:
            print(f"❌ Database initialization failed: {e}")
            if conn and not self.is_postgres:
                conn.rollback()
        finally:
            if conn:
                self.release_connection(conn)
    
    def add_favorite(self, article: dict) -> bool:
        """Add an article to favorites."""
        conn = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            if self.is_postgres:
                # Postgres upsert logic using ON CONFLICT (url) DO NOTHING
                cursor.execute('''
                    INSERT INTO favorites (title, description, url, urlToImage, publishedAt, source_name)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (url) DO NOTHING
                ''', (
                    article.get('title', ''),
                    article.get('description', ''),
                    article.get('url', ''),
                    article.get('urlToImage', ''),
                    article.get('publishedAt', ''),
                    article.get('source', {}).get('name', '')
                ))
            else:
                # SQLite INSERT OR IGNORE syntax
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
            return True
        except Exception as e:
            print(f"Error adding favorite: {e}")
            if conn:
                conn.rollback()
            return False
        finally:
            if conn:
                self.release_connection(conn)
    
    def get_favorites(self) -> List[dict]:
        """Get all favorite articles."""
        conn = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT title, description, url, urlToImage, publishedAt, source_name, created_at
                FROM favorites
                ORDER BY created_at DESC
            ''')
            
            rows = cursor.fetchall()
            
            favorites = []
            for row in rows:
                favorites.append({
                    'title': row[0],
                    'description': row[1],
                    'url': row[2],
                    'urlToImage': row[3],
                    'publishedAt': row[4],
                    'source': {'name': row[5]},
                    'created_at': str(row[6]) # Convert datetime object to string
                })
            
            return favorites
        except Exception as e:
            print(f"Error getting favorites: {e}")
            return []
        finally:
            if conn:
                self.release_connection(conn)
    
    def remove_favorite(self, url: str) -> bool:
        """Remove an article from favorites by URL."""
        conn = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            placeholder = "%s" if self.is_postgres else "?"
            cursor.execute(f'DELETE FROM favorites WHERE url = {placeholder}', (url,))
            
            conn.commit()
            return True
        except Exception as e:
            print(f"Error removing favorite: {e}")
            if conn:
                conn.rollback()
            return False
        finally:
            if conn:
                self.release_connection(conn)
    
    def is_favorite(self, url: str) -> bool:
        """Check if an article is already in favorites."""
        conn = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            placeholder = "%s" if self.is_postgres else "?"
            cursor.execute(f'SELECT COUNT(*) FROM favorites WHERE url = {placeholder}', (url,))
            count = cursor.fetchone()[0]
            
            return count > 0
        except Exception as e:
            print(f"Error checking favorite: {e}")
            return False
        finally:
            if conn:
                self.release_connection(conn)