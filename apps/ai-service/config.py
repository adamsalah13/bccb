"""
Configuration management for AI Service
Loads environment variables and provides application settings
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_workers: int = 4
    log_level: str = "info"
    
    # Database Configuration
    database_url: str = "postgresql://user:password@localhost:5432/microcredentials"
    
    # Redis Configuration
    redis_url: str = "redis://localhost:6379"
    redis_ttl: int = 3600  # Cache TTL in seconds
    
    # Model Configuration
    model_path: str = "./ml-models/trained"
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    vector_db_path: str = "./vector-db"
    
    # ML Model Settings
    pathway_model_version: str = "v1"
    credit_model_version: str = "v1"
    max_recommendations: int = 10
    similarity_threshold: float = 0.5
    
    # Hugging Face Configuration
    hf_token: Optional[str] = None
    
    # CORS Settings
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    cors_credentials: bool = True
    cors_methods: list[str] = ["*"]
    cors_headers: list[str] = ["*"]
    
    # Performance Settings
    batch_size: int = 32
    max_text_length: int = 512
    cache_enabled: bool = True
    
    # Feature Flags
    enable_gpu: bool = False
    enable_monitoring: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
