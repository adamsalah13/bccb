"""
Pathway recommendation model
Uses content-based filtering and semantic similarity
"""
import logging
from typing import List, Dict, Any, Optional
import numpy as np
from dataclasses import dataclass

from services.embeddings import get_embedding_service
from services.vector_store import get_vector_store
from utils.preprocessing import clean_text, calculate_text_similarity

logger = logging.getLogger(__name__)


@dataclass
class PathwayRecommendation:
    """Pathway recommendation result"""
    pathway_id: str
    target_program_id: str
    confidence_score: float
    reasoning: str
    similarity_score: float
    transfer_credits: Optional[float] = None
    institution_name: Optional[str] = None


class PathwayRecommender:
    """ML model for pathway recommendations"""
    
    def __init__(self, model_version: str = "v1"):
        """
        Initialize pathway recommender
        
        Args:
            model_version: Version of the model
        """
        self.model_version = model_version
        self.embedding_service = get_embedding_service()
        self.vector_store = get_vector_store(
            dimension=self.embedding_service.get_embedding_dimension()
        )
        logger.info(f"Pathway recommender initialized (version={model_version})")
    
    def recommend(
        self,
        micro_credential: Dict[str, Any],
        target_institution_id: Optional[str] = None,
        student_profile: Optional[Dict[str, Any]] = None,
        top_k: int = 10,
        min_similarity: float = 0.5
    ) -> List[PathwayRecommendation]:
        """
        Generate pathway recommendations
        
        Args:
            micro_credential: Micro-credential data
            target_institution_id: Optional target institution filter
            student_profile: Optional student profile data
            top_k: Number of recommendations to return
            min_similarity: Minimum similarity threshold
            
        Returns:
            List[PathwayRecommendation]: Ranked recommendations
        """
        logger.info(f"Generating recommendations for credential: {micro_credential.get('id')}")
        
        # Extract text for embedding
        text_parts = []
        
        if 'title' in micro_credential:
            text_parts.append(micro_credential['title'])
        
        if 'description' in micro_credential:
            text_parts.append(micro_credential['description'])
        
        if 'learning_outcomes' in micro_credential:
            outcomes = micro_credential['learning_outcomes']
            if isinstance(outcomes, list):
                text_parts.extend(outcomes)
            elif isinstance(outcomes, str):
                text_parts.append(outcomes)
        
        query_text = ' '.join(text_parts)
        query_text = clean_text(query_text)
        
        # Generate embedding
        query_embedding = self.embedding_service.encode(query_text)
        
        # If vector store is empty, return mock recommendations
        if self.vector_store.size() == 0:
            logger.warning("Vector store is empty, generating mock recommendations")
            return self._generate_mock_recommendations(
                micro_credential,
                target_institution_id,
                top_k
            )
        
        # Search vector store
        results = self.vector_store.search(
            query_embedding,
            top_k=top_k * 2,  # Get more than needed for filtering
            threshold=min_similarity
        )
        
        # Build recommendations
        recommendations = []
        for vector_id, similarity, metadata in results:
            # Filter by institution if specified
            if target_institution_id:
                if metadata.get('institution_id') != target_institution_id:
                    continue
            
            # Calculate confidence score
            confidence = self._calculate_confidence(
                similarity,
                micro_credential,
                metadata,
                student_profile
            )
            
            # Generate reasoning
            reasoning = self._generate_reasoning(
                similarity,
                micro_credential,
                metadata
            )
            
            recommendation = PathwayRecommendation(
                pathway_id=metadata.get('pathway_id', vector_id),
                target_program_id=metadata.get('program_id', 'unknown'),
                confidence_score=confidence,
                reasoning=reasoning,
                similarity_score=similarity,
                transfer_credits=metadata.get('credits', None),
                institution_name=metadata.get('institution_name', None)
            )
            
            recommendations.append(recommendation)
            
            if len(recommendations) >= top_k:
                break
        
        return recommendations
    
    def _calculate_confidence(
        self,
        similarity: float,
        source: Dict[str, Any],
        target: Dict[str, Any],
        student_profile: Optional[Dict[str, Any]]
    ) -> float:
        """
        Calculate confidence score for recommendation
        
        Args:
            similarity: Semantic similarity score
            source: Source credential data
            target: Target program data
            student_profile: Student profile
            
        Returns:
            float: Confidence score
        """
        # Start with semantic similarity
        confidence = similarity
        
        # Boost for matching levels
        source_level = source.get('level', '').lower()
        target_level = target.get('level', '').lower()
        if source_level and target_level and source_level == target_level:
            confidence *= 1.1
        
        # Boost for matching subjects/domains
        source_subject = source.get('subject', '').lower()
        target_subject = target.get('subject', '').lower()
        if source_subject and target_subject:
            if calculate_text_similarity(source_subject, target_subject) > 0.7:
                confidence *= 1.15
        
        # Cap at 1.0
        confidence = min(confidence, 1.0)
        
        return confidence
    
    def _generate_reasoning(
        self,
        similarity: float,
        source: Dict[str, Any],
        target: Dict[str, Any]
    ) -> str:
        """
        Generate human-readable reasoning for recommendation
        
        Args:
            similarity: Similarity score
            source: Source credential
            target: Target program
            
        Returns:
            str: Reasoning text
        """
        reasons = []
        
        # Similarity-based reason
        if similarity > 0.8:
            reasons.append("High semantic similarity in program content and learning outcomes")
        elif similarity > 0.6:
            reasons.append("Moderate alignment in program objectives and outcomes")
        else:
            reasons.append("Some overlap in subject matter and skills")
        
        # Level matching
        if source.get('level') == target.get('level'):
            reasons.append(f"Matching credential level ({source.get('level')})")
        
        # Subject matching
        source_subject = source.get('subject', '')
        target_subject = target.get('subject', '')
        if source_subject and target_subject:
            if calculate_text_similarity(source_subject, target_subject) > 0.7:
                reasons.append("Aligned subject areas")
        
        return ". ".join(reasons) + "."
    
    def _generate_mock_recommendations(
        self,
        micro_credential: Dict[str, Any],
        target_institution_id: Optional[str],
        top_k: int
    ) -> List[PathwayRecommendation]:
        """
        Generate mock recommendations when vector store is empty
        
        Args:
            micro_credential: Source credential
            target_institution_id: Target institution
            top_k: Number of recommendations
            
        Returns:
            List[PathwayRecommendation]: Mock recommendations
        """
        recommendations = []
        
        for i in range(min(top_k, 3)):
            confidence = 0.85 - (i * 0.1)
            
            recommendation = PathwayRecommendation(
                pathway_id=f"pathway_{i+1}",
                target_program_id=f"program_{i+1}",
                confidence_score=confidence,
                reasoning="Mock recommendation based on general subject alignment and credential level compatibility.",
                similarity_score=confidence,
                transfer_credits=3.0 if i == 0 else 2.0,
                institution_name=f"Institution {i+1}"
            )
            
            recommendations.append(recommendation)
        
        return recommendations
    
    def train(self, training_data: List[Dict[str, Any]]):
        """
        Train/update the model with new data
        
        Args:
            training_data: List of training examples
        """
        logger.info(f"Training pathway recommender with {len(training_data)} examples")
        
        # Clear existing data
        self.vector_store.clear()
        
        # Process each training example
        texts = []
        metadata_list = []
        vector_ids = []
        
        for example in training_data:
            # Extract text
            text_parts = [
                example.get('title', ''),
                example.get('description', ''),
            ]
            
            if 'learning_outcomes' in example:
                outcomes = example['learning_outcomes']
                if isinstance(outcomes, list):
                    text_parts.extend(outcomes)
                elif isinstance(outcomes, str):
                    text_parts.append(outcomes)
            
            text = ' '.join(text_parts)
            text = clean_text(text)
            texts.append(text)
            
            # Store metadata
            metadata = {
                'pathway_id': example.get('pathway_id', f"pathway_{len(metadata_list)}"),
                'program_id': example.get('program_id', ''),
                'institution_id': example.get('institution_id', ''),
                'institution_name': example.get('institution_name', ''),
                'title': example.get('title', ''),
                'level': example.get('level', ''),
                'subject': example.get('subject', ''),
                'credits': example.get('credits', 0)
            }
            metadata_list.append(metadata)
            vector_ids.append(metadata['pathway_id'])
        
        # Generate embeddings
        embeddings = self.embedding_service.encode(texts, batch_size=32)
        
        # Add to vector store
        self.vector_store.add_batch(embeddings, metadata_list, vector_ids)
        
        logger.info(f"Training complete. Vector store size: {self.vector_store.size()}")
    
    def save(self, path: str):
        """Save model to disk"""
        self.vector_store.save(path)
        logger.info(f"Model saved to {path}")
    
    def load(self, path: str):
        """Load model from disk"""
        self.vector_store.load(path)
        logger.info(f"Model loaded from {path}")
