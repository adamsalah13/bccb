"""
Text embedding generation service
Uses Sentence Transformers for creating semantic embeddings
"""
import logging
from typing import List, Union, Optional
import numpy as np
from functools import lru_cache

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Service for generating text embeddings"""
    
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        """
        Initialize embedding service
        
        Args:
            model_name: Name of the sentence transformer model
        """
        self.model_name = model_name
        self._model = None
        logger.info(f"Embedding service initialized with model: {model_name}")
    
    @property
    def model(self):
        """Lazy load the model"""
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                logger.info(f"Loading embedding model: {self.model_name}")
                self._model = SentenceTransformer(self.model_name)
                logger.info("Embedding model loaded successfully")
            except ImportError:
                logger.warning("sentence-transformers not installed, using fallback embeddings")
                self._model = "fallback"
            except Exception as e:
                logger.error(f"Error loading embedding model: {e}")
                self._model = "fallback"
        return self._model
    
    def encode(
        self,
        texts: Union[str, List[str]],
        batch_size: int = 32,
        show_progress: bool = False
    ) -> np.ndarray:
        """
        Generate embeddings for text(s)
        
        Args:
            texts: Single text or list of texts
            batch_size: Batch size for encoding
            show_progress: Whether to show progress bar
            
        Returns:
            np.ndarray: Embedding vectors
        """
        if isinstance(texts, str):
            texts = [texts]
        
        if not texts:
            return np.array([])
        
        # Use actual model if available
        if self.model != "fallback":
            try:
                embeddings = self.model.encode(
                    texts,
                    batch_size=batch_size,
                    show_progress_bar=show_progress,
                    convert_to_numpy=True
                )
                return embeddings
            except Exception as e:
                logger.error(f"Error encoding with model: {e}")
                # Fall through to fallback
        
        # Fallback: Simple hash-based embeddings
        logger.warning("Using fallback embeddings (for testing only)")
        return self._fallback_embeddings(texts)
    
    def _fallback_embeddings(self, texts: List[str]) -> np.ndarray:
        """
        Generate simple fallback embeddings using hashing
        For testing/development when sentence-transformers isn't available
        
        Args:
            texts: List of texts
            
        Returns:
            np.ndarray: Simple embedding vectors
        """
        embedding_dim = 384  # Match all-MiniLM-L6-v2 dimension
        embeddings = []
        
        for text in texts:
            # Simple hash-based embedding
            np.random.seed(hash(text) % (2**32))
            embedding = np.random.randn(embedding_dim)
            # Normalize
            embedding = embedding / np.linalg.norm(embedding)
            embeddings.append(embedding)
        
        return np.array(embeddings)
    
    def similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """
        Calculate cosine similarity between two embeddings
        
        Args:
            embedding1: First embedding vector
            embedding2: Second embedding vector
            
        Returns:
            float: Similarity score between -1 and 1
        """
        # Normalize vectors
        norm1 = np.linalg.norm(embedding1)
        norm2 = np.linalg.norm(embedding2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        # Cosine similarity
        similarity = np.dot(embedding1, embedding2) / (norm1 * norm2)
        
        return float(similarity)
    
    def batch_similarity(
        self,
        query_embedding: np.ndarray,
        candidate_embeddings: np.ndarray
    ) -> np.ndarray:
        """
        Calculate similarity between query and multiple candidates
        
        Args:
            query_embedding: Query embedding vector
            candidate_embeddings: Array of candidate embeddings
            
        Returns:
            np.ndarray: Array of similarity scores
        """
        # Normalize query
        query_norm = query_embedding / np.linalg.norm(query_embedding)
        
        # Normalize candidates
        candidate_norms = candidate_embeddings / np.linalg.norm(
            candidate_embeddings, axis=1, keepdims=True
        )
        
        # Compute similarities
        similarities = np.dot(candidate_norms, query_norm)
        
        return similarities
    
    def get_embedding_dimension(self) -> int:
        """
        Get the dimension of embeddings produced by this service
        
        Returns:
            int: Embedding dimension
        """
        if self.model != "fallback":
            try:
                return self.model.get_sentence_embedding_dimension()
            except:
                pass
        return 384  # Default dimension


# Global instance
_embedding_service: Optional[EmbeddingService] = None


@lru_cache()
def get_embedding_service(model_name: str = "sentence-transformers/all-MiniLM-L6-v2") -> EmbeddingService:
    """
    Get or create embedding service singleton
    
    Args:
        model_name: Name of the model to use
        
    Returns:
        EmbeddingService: Embedding service instance
    """
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService(model_name)
    return _embedding_service
