"""
Credential assessment API endpoints
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
import logging

from models.credit_assessor import CreditAssessor, AssessmentResult, CreditAssessment
from config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()

# Global assessor instance (lazy loaded)
_assessor: Optional[CreditAssessor] = None


def get_assessor() -> CreditAssessor:
    """Get or create assessor instance"""
    global _assessor
    if _assessor is None:
        _assessor = CreditAssessor(
            model_version=settings.credit_model_version
        )
    return _assessor


# Request/Response Models
class MicroCredentialData(BaseModel):
    """Micro-credential data for assessment"""
    id: str
    title: str
    description: str
    learning_outcomes: List[str]
    duration_hours: int
    level: Optional[str] = None
    subject: Optional[str] = None
    assessment_methods: List[str] = Field(default_factory=list)


class TargetProgramData(BaseModel):
    """Target program data"""
    id: str
    title: str
    description: str
    learning_outcomes: List[str]
    credits: Optional[float] = None
    level: Optional[str] = None
    subject: Optional[str] = None


class InstitutionRequirements(BaseModel):
    """Institution-specific requirements"""
    min_duration_hours: Optional[int] = None
    required_assessment_types: List[str] = Field(default_factory=list)
    min_outcome_overlap: Optional[float] = None


class AssessmentRequest(BaseModel):
    """Credit assessment request"""
    micro_credential: MicroCredentialData
    target_program: TargetProgramData
    institution_requirements: Optional[InstitutionRequirements] = None


class AssessmentResponse(BaseModel):
    """Credit assessment response"""
    result: str
    confidence_score: float
    recommended_credits: float
    reasoning: str
    requirements_met: List[str]
    requirements_missing: List[str]
    conditions: Optional[List[str]] = None


class BatchAssessmentRequest(BaseModel):
    """Batch assessment request"""
    micro_credential: MicroCredentialData
    target_programs: List[TargetProgramData]
    institution_requirements: Optional[InstitutionRequirements] = None


class BatchAssessmentItem(BaseModel):
    """Single item in batch assessment results"""
    program_id: str
    program_title: str
    assessment: AssessmentResponse


class BatchAssessmentResponse(BaseModel):
    """Batch assessment response"""
    credential_id: str
    assessments: List[BatchAssessmentItem]
    total: int


class ValidationRequest(BaseModel):
    """Recognition criteria validation request"""
    micro_credential: MicroCredentialData
    criteria: Dict[str, Any]


class ValidationResponse(BaseModel):
    """Validation response"""
    is_valid: bool
    score: float
    issues: List[str]
    recommendations: List[str]


# Endpoints
@router.post("/assess", response_model=AssessmentResponse)
async def assess_credit(request: AssessmentRequest):
    """
    Assess credit eligibility for a micro-credential
    
    Args:
        request: Assessment request with credential and program data
        
    Returns:
        AssessmentResponse: Assessment result
    """
    try:
        logger.info(
            f"Processing credit assessment for credential: {request.micro_credential.id} "
            f"against program: {request.target_program.id}"
        )
        
        assessor = get_assessor()
        
        # Convert to dict
        micro_credential_dict = request.micro_credential.model_dump()
        target_program_dict = request.target_program.model_dump()
        institution_requirements_dict = (
            request.institution_requirements.model_dump()
            if request.institution_requirements
            else None
        )
        
        # Perform assessment
        assessment = assessor.assess(
            micro_credential=micro_credential_dict,
            target_program=target_program_dict,
            institution_requirements=institution_requirements_dict
        )
        
        # Convert to response
        return AssessmentResponse(
            result=assessment.result.value,
            confidence_score=assessment.confidence_score,
            recommended_credits=assessment.recommended_credits,
            reasoning=assessment.reasoning,
            requirements_met=assessment.requirements_met,
            requirements_missing=assessment.requirements_missing,
            conditions=assessment.conditions
        )
        
    except Exception as e:
        logger.error(f"Error processing assessment request: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/assess/batch", response_model=BatchAssessmentResponse)
async def assess_credit_batch(request: BatchAssessmentRequest):
    """
    Assess credit eligibility against multiple programs
    
    Args:
        request: Batch assessment request
        
    Returns:
        BatchAssessmentResponse: Assessment results for all programs
    """
    try:
        logger.info(
            f"Processing batch assessment for credential: {request.micro_credential.id} "
            f"against {len(request.target_programs)} programs"
        )
        
        assessor = get_assessor()
        
        # Convert credential data
        micro_credential_dict = request.micro_credential.model_dump()
        institution_requirements_dict = (
            request.institution_requirements.model_dump()
            if request.institution_requirements
            else None
        )
        
        # Assess each program
        assessments = []
        for program in request.target_programs:
            program_dict = program.model_dump()
            
            assessment = assessor.assess(
                micro_credential=micro_credential_dict,
                target_program=program_dict,
                institution_requirements=institution_requirements_dict
            )
            
            assessment_response = AssessmentResponse(
                result=assessment.result.value,
                confidence_score=assessment.confidence_score,
                recommended_credits=assessment.recommended_credits,
                reasoning=assessment.reasoning,
                requirements_met=assessment.requirements_met,
                requirements_missing=assessment.requirements_missing,
                conditions=assessment.conditions
            )
            
            assessments.append(
                BatchAssessmentItem(
                    program_id=program.id,
                    program_title=program.title,
                    assessment=assessment_response
                )
            )
        
        return BatchAssessmentResponse(
            credential_id=request.micro_credential.id,
            assessments=assessments,
            total=len(assessments)
        )
        
    except Exception as e:
        logger.error(f"Error processing batch assessment: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/validate", response_model=ValidationResponse)
async def validate_recognition_criteria(request: ValidationRequest):
    """
    Validate if a micro-credential meets recognition criteria
    
    Args:
        request: Validation request
        
    Returns:
        ValidationResponse: Validation result
    """
    try:
        logger.info(f"Validating recognition criteria for credential: {request.micro_credential.id}")
        
        # Basic validation logic
        issues = []
        recommendations = []
        score = 1.0
        
        # Check duration
        min_duration = request.criteria.get('min_duration_hours', 12)
        if request.micro_credential.duration_hours < min_duration:
            issues.append(f"Duration ({request.micro_credential.duration_hours}h) below minimum ({min_duration}h)")
            score -= 0.2
        
        # Check learning outcomes
        min_outcomes = request.criteria.get('min_outcomes', 3)
        if len(request.micro_credential.learning_outcomes) < min_outcomes:
            issues.append(f"Insufficient learning outcomes ({len(request.micro_credential.learning_outcomes)} < {min_outcomes})")
            score -= 0.3
        
        # Check assessment methods
        if not request.micro_credential.assessment_methods:
            issues.append("No assessment methods specified")
            recommendations.append("Add at least one rigorous assessment method (exam, project, etc.)")
            score -= 0.2
        
        # Check description
        if len(request.micro_credential.description) < 50:
            recommendations.append("Provide more detailed program description")
            score -= 0.1
        
        score = max(score, 0.0)
        is_valid = score >= 0.7 and len(issues) == 0
        
        return ValidationResponse(
            is_valid=is_valid,
            score=score,
            issues=issues,
            recommendations=recommendations
        )
        
    except Exception as e:
        logger.error(f"Error validating criteria: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/model/info")
async def get_model_info():
    """
    Get information about the assessment model
    
    Returns:
        dict: Model information
    """
    try:
        assessor = get_assessor()
        
        return {
            "model_version": assessor.model_version,
            "rules": assessor.rules
        }
        
    except Exception as e:
        logger.error(f"Error getting model info: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
