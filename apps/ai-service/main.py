"""
Main FastAPI application entry point
Configures CORS, middleware, and routes for the AI/ML service
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import time
from typing import Dict, Any

from config import get_settings
from api import recommendations, assessment, similarity

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup: Initialize resources
    logger.info("Starting AI/ML Service...")
    logger.info(f"Using embedding model: {settings.embedding_model}")
    logger.info(f"Model path: {settings.model_path}")
    
    # Warmup models (lazy loading will happen on first request)
    logger.info("Models will be loaded on first request (lazy loading)")
    
    yield
    
    # Shutdown: Cleanup resources
    logger.info("Shutting down AI/ML Service...")


# Create FastAPI application
app = FastAPI(
    title="BCCB AI/ML Service",
    description="AI-powered micro-credentials management and pathway recommendations",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_credentials,
    allow_methods=settings.cors_methods,
    allow_headers=settings.cors_headers,
)


# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add X-Process-Time header to responses"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint to verify service status
    
    Returns:
        dict: Service health status
    """
    return {
        "status": "healthy",
        "service": "ai-ml-service",
        "version": "1.0.0",
        "models": {
            "embedding_model": settings.embedding_model,
            "pathway_recommender": f"v{settings.pathway_model_version}",
            "credit_assessor": f"v{settings.credit_model_version}"
        }
    }


@app.get("/", tags=["Root"])
async def root() -> Dict[str, str]:
    """
    Root endpoint with API information
    
    Returns:
        dict: API welcome message
    """
    return {
        "message": "BCCB AI/ML Service API",
        "docs": "/docs",
        "health": "/health"
    }


# Include API routers
app.include_router(
    recommendations.router,
    prefix="/api/v1/recommendations",
    tags=["Recommendations"]
)

app.include_router(
    assessment.router,
    prefix="/api/v1/assessment",
    tags=["Assessment"]
)

app.include_router(
    similarity.router,
    prefix="/api/v1/similarity",
    tags=["Similarity"]
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler for unhandled errors
    
    Args:
        request: The incoming request
        exc: The exception that was raised
        
    Returns:
        JSONResponse: Error response
    """
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "type": type(exc).__name__
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True,
        log_level=settings.log_level.lower()
    )
