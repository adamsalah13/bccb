"""
Credit assessor model
Evaluates micro-credential recognition eligibility
"""
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from enum import Enum

from utils.preprocessing import clean_text, calculate_text_similarity, extract_keywords

logger = logging.getLogger(__name__)


class AssessmentResult(str, Enum):
    """Credit assessment result categories"""
    APPROVED = "approved"
    CONDITIONAL = "conditional"
    DENIED = "denied"
    REVIEW_REQUIRED = "review_required"


@dataclass
class CreditAssessment:
    """Credit assessment result"""
    result: AssessmentResult
    confidence_score: float
    recommended_credits: float
    reasoning: str
    requirements_met: List[str]
    requirements_missing: List[str]
    conditions: Optional[List[str]] = None


class CreditAssessor:
    """ML model for credit assessment"""
    
    def __init__(self, model_version: str = "v1"):
        """
        Initialize credit assessor
        
        Args:
            model_version: Version of the model
        """
        self.model_version = model_version
        self._initialize_rules()
        logger.info(f"Credit assessor initialized (version={model_version})")
    
    def _initialize_rules(self):
        """Initialize assessment rules and thresholds"""
        self.rules = {
            'min_duration_hours': 12,
            'min_outcome_overlap': 0.6,
            'min_content_similarity': 0.5,
            'required_assessment_methods': ['exam', 'project', 'assignment'],
            'level_mapping': {
                'certificate': 1,
                'diploma': 2,
                'advanced_diploma': 3,
                'degree': 4
            }
        }
    
    def assess(
        self,
        micro_credential: Dict[str, Any],
        target_program: Dict[str, Any],
        institution_requirements: Optional[Dict[str, Any]] = None
    ) -> CreditAssessment:
        """
        Assess credit eligibility for a micro-credential
        
        Args:
            micro_credential: Micro-credential data
            target_program: Target program data
            institution_requirements: Institution-specific requirements
            
        Returns:
            CreditAssessment: Assessment result
        """
        logger.info(
            f"Assessing credit for credential: {micro_credential.get('id')} "
            f"against program: {target_program.get('id')}"
        )
        
        requirements_met = []
        requirements_missing = []
        conditions = []
        
        # Check duration requirement
        duration_check = self._check_duration(micro_credential)
        if duration_check['met']:
            requirements_met.append(duration_check['message'])
        else:
            requirements_missing.append(duration_check['message'])
        
        # Check learning outcomes overlap
        outcome_check = self._check_outcomes(micro_credential, target_program)
        if outcome_check['met']:
            requirements_met.append(outcome_check['message'])
        else:
            requirements_missing.append(outcome_check['message'])
        
        # Check content similarity
        content_check = self._check_content_similarity(micro_credential, target_program)
        if content_check['met']:
            requirements_met.append(content_check['message'])
        else:
            requirements_missing.append(content_check['message'])
        
        # Check assessment methods
        assessment_check = self._check_assessment_methods(micro_credential)
        if assessment_check['met']:
            requirements_met.append(assessment_check['message'])
        else:
            conditions.append(assessment_check['message'])
        
        # Check level compatibility
        level_check = self._check_level_compatibility(micro_credential, target_program)
        if level_check['met']:
            requirements_met.append(level_check['message'])
        else:
            requirements_missing.append(level_check['message'])
        
        # Calculate overall confidence
        confidence = self._calculate_confidence(
            duration_check, outcome_check, content_check,
            assessment_check, level_check
        )
        
        # Determine result
        result = self._determine_result(
            confidence,
            requirements_met,
            requirements_missing,
            conditions
        )
        
        # Calculate recommended credits
        recommended_credits = self._calculate_credits(
            micro_credential,
            target_program,
            confidence
        )
        
        # Generate reasoning
        reasoning = self._generate_reasoning(
            result,
            confidence,
            requirements_met,
            requirements_missing
        )
        
        return CreditAssessment(
            result=result,
            confidence_score=confidence,
            recommended_credits=recommended_credits,
            reasoning=reasoning,
            requirements_met=requirements_met,
            requirements_missing=requirements_missing,
            conditions=conditions if conditions else None
        )
    
    def _check_duration(self, micro_credential: Dict[str, Any]) -> Dict[str, Any]:
        """Check if duration meets minimum requirement"""
        duration = micro_credential.get('duration_hours', 0)
        min_duration = self.rules['min_duration_hours']
        
        met = duration >= min_duration
        
        return {
            'met': met,
            'score': min(duration / min_duration, 1.0),
            'message': f"Duration: {duration} hours ({'meets' if met else 'below'} minimum {min_duration} hours)"
        }
    
    def _check_outcomes(
        self,
        micro_credential: Dict[str, Any],
        target_program: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Check learning outcomes overlap"""
        mc_outcomes = micro_credential.get('learning_outcomes', [])
        prog_outcomes = target_program.get('learning_outcomes', [])
        
        if not mc_outcomes or not prog_outcomes:
            return {
                'met': False,
                'score': 0.0,
                'message': "Insufficient learning outcomes data for comparison"
            }
        
        # Convert to text
        mc_text = ' '.join(mc_outcomes) if isinstance(mc_outcomes, list) else mc_outcomes
        prog_text = ' '.join(prog_outcomes) if isinstance(prog_outcomes, list) else prog_outcomes
        
        # Calculate similarity
        similarity = calculate_text_similarity(mc_text, prog_text)
        min_overlap = self.rules['min_outcome_overlap']
        
        met = similarity >= min_overlap
        
        return {
            'met': met,
            'score': similarity,
            'message': f"Learning outcomes overlap: {similarity:.2f} ({'sufficient' if met else 'insufficient'})"
        }
    
    def _check_content_similarity(
        self,
        micro_credential: Dict[str, Any],
        target_program: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Check content similarity"""
        mc_desc = clean_text(micro_credential.get('description', ''))
        prog_desc = clean_text(target_program.get('description', ''))
        
        if not mc_desc or not prog_desc:
            return {
                'met': False,
                'score': 0.0,
                'message': "Insufficient content for comparison"
            }
        
        similarity = calculate_text_similarity(mc_desc, prog_desc)
        min_similarity = self.rules['min_content_similarity']
        
        met = similarity >= min_similarity
        
        return {
            'met': met,
            'score': similarity,
            'message': f"Content similarity: {similarity:.2f} ({'adequate' if met else 'insufficient'})"
        }
    
    def _check_assessment_methods(self, micro_credential: Dict[str, Any]) -> Dict[str, Any]:
        """Check assessment methods"""
        methods = micro_credential.get('assessment_methods', [])
        
        if not methods:
            return {
                'met': False,
                'score': 0.0,
                'message': "No assessment methods specified"
            }
        
        # Check for rigorous assessment
        methods_lower = [m.lower() for m in methods]
        has_rigorous = any(
            req in ' '.join(methods_lower)
            for req in self.rules['required_assessment_methods']
        )
        
        return {
            'met': has_rigorous,
            'score': 1.0 if has_rigorous else 0.5,
            'message': f"Assessment methods: {', '.join(methods)} ({'rigorous' if has_rigorous else 'may require additional validation'})"
        }
    
    def _check_level_compatibility(
        self,
        micro_credential: Dict[str, Any],
        target_program: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Check level compatibility"""
        mc_level = micro_credential.get('level', '').lower()
        prog_level = target_program.get('level', '').lower()
        
        if not mc_level or not prog_level:
            return {
                'met': True,  # Default to true if level not specified
                'score': 0.5,
                'message': "Level information not available"
            }
        
        mc_level_num = self.rules['level_mapping'].get(mc_level, 0)
        prog_level_num = self.rules['level_mapping'].get(prog_level, 0)
        
        # Credential should be at or below program level
        compatible = mc_level_num <= prog_level_num
        
        return {
            'met': compatible,
            'score': 1.0 if compatible else 0.5,
            'message': f"Level compatibility: {mc_level} → {prog_level} ({'compatible' if compatible else 'may require review'})"
        }
    
    def _calculate_confidence(self, *checks) -> float:
        """Calculate overall confidence score"""
        scores = [check['score'] for check in checks if 'score' in check]
        
        if not scores:
            return 0.0
        
        # Weighted average
        return sum(scores) / len(scores)
    
    def _determine_result(
        self,
        confidence: float,
        requirements_met: List[str],
        requirements_missing: List[str],
        conditions: List[str]
    ) -> AssessmentResult:
        """Determine assessment result"""
        if confidence >= 0.8 and not requirements_missing:
            return AssessmentResult.APPROVED
        elif confidence >= 0.6 and len(requirements_missing) <= 1:
            if conditions:
                return AssessmentResult.CONDITIONAL
            return AssessmentResult.APPROVED
        elif confidence >= 0.4:
            return AssessmentResult.REVIEW_REQUIRED
        else:
            return AssessmentResult.DENIED
    
    def _calculate_credits(
        self,
        micro_credential: Dict[str, Any],
        target_program: Dict[str, Any],
        confidence: float
    ) -> float:
        """Calculate recommended credit value"""
        # Base credits from duration
        duration = micro_credential.get('duration_hours', 0)
        base_credits = duration / 15.0  # Rough conversion: 15 hours per credit
        
        # Adjust by confidence
        adjusted_credits = base_credits * confidence
        
        # Cap at program credits if available
        max_credits = target_program.get('credits', float('inf'))
        
        return min(round(adjusted_credits * 2) / 2, max_credits)  # Round to nearest 0.5
    
    def _generate_reasoning(
        self,
        result: AssessmentResult,
        confidence: float,
        requirements_met: List[str],
        requirements_missing: List[str]
    ) -> str:
        """Generate human-readable reasoning"""
        reasoning_parts = []
        
        # Result explanation
        if result == AssessmentResult.APPROVED:
            reasoning_parts.append(
                f"Assessment approved with {confidence:.2f} confidence. "
                "All key requirements are satisfied."
            )
        elif result == AssessmentResult.CONDITIONAL:
            reasoning_parts.append(
                f"Conditional approval with {confidence:.2f} confidence. "
                "Additional validation may be required."
            )
        elif result == AssessmentResult.REVIEW_REQUIRED:
            reasoning_parts.append(
                f"Manual review recommended ({confidence:.2f} confidence). "
                "Some requirements need further evaluation."
            )
        else:
            reasoning_parts.append(
                f"Assessment denied ({confidence:.2f} confidence). "
                "Insufficient alignment with target program requirements."
            )
        
        # Add details
        if requirements_met:
            reasoning_parts.append(f"Met: {', '.join(requirements_met[:2])}")
        
        if requirements_missing:
            reasoning_parts.append(f"Missing: {', '.join(requirements_missing[:2])}")
        
        return ' '.join(reasoning_parts)
