"""
Pathway recommendation API endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging

from models.pathway_recommender import PathwayRecommender, PathwayRecommendation
from config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()

# Global model instance (lazy loaded)
_recommender: Optional[PathwayRecommender] = None


def get_recommender() -> PathwayRecommender:
    """Get or create recommender instance"""
    global _recommender
    if _recommender is None:
        _recommender = PathwayRecommender(
            model_version=settings.pathway_model_version
        )
    return _recommender


# Request/Response Models
class MicroCredentialInput(BaseModel):
    """Micro-credential input data"""
    id: str
    title: str
    description: str
    learning_outcomes: List[str]
    level: Optional[str] = None
    subject: Optional[str] = None
    duration_hours: Optional[int] = None


class StudentProfile(BaseModel):
    """Student profile data"""
    id: Optional[str] = None
    completed_credentials: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    target_level: Optional[str] = None


class RecommendationRequest(BaseModel):
    """Pathway recommendation request"""
    micro_credential: MicroCredentialInput
    target_institution_id: Optional[str] = None
    student_profile: Optional[StudentProfile] = None
    top_k: int = Field(default=10, ge=1, le=50)
    min_similarity: float = Field(default=0.5, ge=0.0, le=1.0)


class RecommendationResponse(BaseModel):
    """Single pathway recommendation"""
    pathway_id: str
    target_program_id: str
    confidence_score: float
    reasoning: str
    similarity_score: float
    transfer_credits: Optional[float] = None
    institution_name: Optional[str] = None


class RecommendationsResponse(BaseModel):
    """List of pathway recommendations"""
    recommendations: List[RecommendationResponse]
    total: int
    query_credential_id: str


class TrainingDataItem(BaseModel):
    """Training data item"""
    pathway_id: str
    program_id: str
    institution_id: str
    institution_name: str
    title: str
    description: str
    learning_outcomes: List[str]
    level: Optional[str] = None
    subject: Optional[str] = None
    credits: Optional[float] = None


class TrainingRequest(BaseModel):
    """Model training request"""
    training_data: List[TrainingDataItem]


# Endpoints
@router.post("/recommend", response_model=RecommendationsResponse)
async def recommend_pathways(request: RecommendationRequest):
    """
    Get pathway recommendations for a micro-credential
    
    Args:
        request: Recommendation request with micro-credential data
        
    Returns:
        RecommendationsResponse: List of recommended pathways
    """
    try:
        logger.info(f"Processing recommendation request for credential: {request.micro_credential.id}")
        
        recommender = get_recommender()
        
        # Convert to dict
        micro_credential_dict = request.micro_credential.model_dump()
        student_profile_dict = request.student_profile.model_dump() if request.student_profile else None
        
        # Get recommendations
        recommendations = recommender.recommend(
            micro_credential=micro_credential_dict,
            target_institution_id=request.target_institution_id,
            student_profile=student_profile_dict,
            top_k=request.top_k,
            min_similarity=request.min_similarity
        )
        
        # Convert to response format
        response_items = [
            RecommendationResponse(
                pathway_id=rec.pathway_id,
                target_program_id=rec.target_program_id,
                confidence_score=rec.confidence_score,
                reasoning=rec.reasoning,
                similarity_score=rec.similarity_score,
                transfer_credits=rec.transfer_credits,
                institution_name=rec.institution_name
            )
            for rec in recommendations
        ]
        
        return RecommendationsResponse(
            recommendations=response_items,
            total=len(response_items),
            query_credential_id=request.micro_credential.id
        )
        
    except Exception as e:
        logger.error(f"Error processing recommendation request: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/similar/{credential_id}", response_model=RecommendationsResponse)
async def find_similar_programs(
    credential_id: str,
    top_k: int = Query(default=10, ge=1, le=50),
    min_similarity: float = Query(default=0.5, ge=0.0, le=1.0)
):
    """
    Find similar programs for a given credential
    
    Args:
        credential_id: ID of the credential
        top_k: Number of results to return
        min_similarity: Minimum similarity threshold
        
    Returns:
        RecommendationsResponse: List of similar programs
    """
    try:
        logger.info(f"Finding similar programs for credential: {credential_id}")
        
        # This would typically fetch credential from database
        # For now, return mock response
        raise HTTPException(
            status_code=501,
            detail="This endpoint requires database integration to fetch credential data"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error finding similar programs: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/train")
async def train_model(request: TrainingRequest):
    """
    Train/update the pathway recommendation model
    
    Args:
        request: Training data
        
    Returns:
        dict: Training status
    """
    try:
        logger.info(f"Training model with {len(request.training_data)} examples")
        
        recommender = get_recommender()
        
        # Convert to dict format
        training_data = [item.model_dump() for item in request.training_data]
        
        # Train model
        recommender.train(training_data)
        
        return {
            "status": "success",
            "message": f"Model trained with {len(training_data)} examples",
            "vector_store_size": recommender.vector_store.size()
        }
        
    except Exception as e:
        logger.error(f"Error training model: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/model/info")
async def get_model_info():
    """
    Get information about the recommendation model
    
    Returns:
        dict: Model information
    """
    try:
        recommender = get_recommender()
        
        return {
            "model_version": recommender.model_version,
            "vector_store_size": recommender.vector_store.size(),
            "embedding_dimension": recommender.embedding_service.get_embedding_dimension(),
            "embedding_model": settings.embedding_model
        }
        
    except Exception as e:
        logger.error(f"Error getting model info: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
