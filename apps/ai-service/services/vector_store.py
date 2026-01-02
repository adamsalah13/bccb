"""
Vector store service for similarity search
Uses in-memory storage with optional persistence
"""
import logging
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import json
import os
from pathlib import Path

logger = logging.getLogger(__name__)


class VectorStore:
    """In-memory vector store for similarity search"""
    
    def __init__(self, dimension: int, store_path: Optional[str] = None):
        """
        Initialize vector store
        
        Args:
            dimension: Dimension of vectors
            store_path: Optional path for persistence
        """
        self.dimension = dimension
        self.store_path = store_path
        self.vectors: np.ndarray = np.array([]).reshape(0, dimension)
        self.metadata: List[Dict[str, Any]] = []
        self.id_to_index: Dict[str, int] = {}
        
        # Load existing data if available
        if store_path and os.path.exists(store_path):
            self.load()
        
        logger.info(f"Vector store initialized (dimension={dimension})")
    
    def add(
        self,
        vector: np.ndarray,
        metadata: Dict[str, Any],
        vector_id: Optional[str] = None
    ) -> str:
        """
        Add a vector to the store
        
        Args:
            vector: Vector to add
            metadata: Associated metadata
            vector_id: Optional ID for the vector
            
        Returns:
            str: ID of the added vector
        """
        # Generate ID if not provided
        if vector_id is None:
            vector_id = f"vec_{len(self.metadata)}"
        
        # Check if ID already exists
        if vector_id in self.id_to_index:
            # Update existing vector
            idx = self.id_to_index[vector_id]
            self.vectors[idx] = vector
            self.metadata[idx] = metadata
        else:
            # Add new vector
            if len(self.vectors) == 0:
                self.vectors = vector.reshape(1, -1)
            else:
                self.vectors = np.vstack([self.vectors, vector])
            
            self.metadata.append(metadata)
            self.id_to_index[vector_id] = len(self.metadata) - 1
        
        return vector_id
    
    def add_batch(
        self,
        vectors: np.ndarray,
        metadata_list: List[Dict[str, Any]],
        vector_ids: Optional[List[str]] = None
    ) -> List[str]:
        """
        Add multiple vectors at once
        
        Args:
            vectors: Array of vectors to add
            metadata_list: List of metadata dicts
            vector_ids: Optional list of IDs
            
        Returns:
            List[str]: List of vector IDs
        """
        if vector_ids is None:
            vector_ids = [f"vec_{i}" for i in range(len(self.metadata), len(self.metadata) + len(vectors))]
        
        ids = []
        for vector, metadata, vector_id in zip(vectors, metadata_list, vector_ids):
            id_ = self.add(vector, metadata, vector_id)
            ids.append(id_)
        
        return ids
    
    def search(
        self,
        query_vector: np.ndarray,
        top_k: int = 10,
        threshold: Optional[float] = None
    ) -> List[Tuple[str, float, Dict[str, Any]]]:
        """
        Search for similar vectors
        
        Args:
            query_vector: Query vector
            top_k: Number of results to return
            threshold: Minimum similarity threshold
            
        Returns:
            List of (vector_id, similarity_score, metadata) tuples
        """
        if len(self.vectors) == 0:
            return []
        
        # Calculate cosine similarities
        # Ensure query_vector is 1D
        query_vector = query_vector.flatten()
        query_norm = query_vector / np.linalg.norm(query_vector)
        vector_norms = self.vectors / np.linalg.norm(self.vectors, axis=1, keepdims=True)
        similarities = np.dot(vector_norms, query_norm)
        
        # Apply threshold if provided
        if threshold is not None:
            mask = similarities >= threshold
            similarities = similarities[mask]
            indices = np.where(mask)[0]
        else:
            indices = np.arange(len(similarities))
        
        # Get top k
        if len(similarities) > top_k:
            top_indices = np.argpartition(similarities, -top_k)[-top_k:]
            top_indices = top_indices[np.argsort(similarities[top_indices])][::-1]
        else:
            top_indices = np.argsort(similarities)[::-1]
        
        # Build results
        results = []
        index_to_id = {v: k for k, v in self.id_to_index.items()}
        
        for idx in top_indices:
            actual_idx = indices[idx]
            vector_id = index_to_id[actual_idx]
            similarity = float(similarities[idx])
            metadata = self.metadata[actual_idx]
            results.append((vector_id, similarity, metadata))
        
        return results
    
    def get(self, vector_id: str) -> Optional[Tuple[np.ndarray, Dict[str, Any]]]:
        """
        Get vector and metadata by ID
        
        Args:
            vector_id: ID of the vector
            
        Returns:
            Tuple of (vector, metadata) or None if not found
        """
        if vector_id not in self.id_to_index:
            return None
        
        idx = self.id_to_index[vector_id]
        return self.vectors[idx], self.metadata[idx]
    
    def delete(self, vector_id: str) -> bool:
        """
        Delete a vector by ID
        
        Args:
            vector_id: ID of the vector to delete
            
        Returns:
            bool: True if deleted, False if not found
        """
        if vector_id not in self.id_to_index:
            return False
        
        idx = self.id_to_index[vector_id]
        
        # Remove from arrays
        self.vectors = np.delete(self.vectors, idx, axis=0)
        del self.metadata[idx]
        
        # Update index mapping
        del self.id_to_index[vector_id]
        for vid, vidx in self.id_to_index.items():
            if vidx > idx:
                self.id_to_index[vid] = vidx - 1
        
        return True
    
    def save(self, path: Optional[str] = None):
        """
        Save vector store to disk
        
        Args:
            path: Path to save to (uses self.store_path if not provided)
        """
        save_path = path or self.store_path
        if save_path is None:
            logger.warning("No save path specified")
            return
        
        # Create directory if needed
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Save data
        data = {
            'dimension': self.dimension,
            'vectors': self.vectors.tolist(),
            'metadata': self.metadata,
            'id_to_index': self.id_to_index
        }
        
        with open(save_path, 'w') as f:
            json.dump(data, f)
        
        logger.info(f"Vector store saved to {save_path}")
    
    def load(self, path: Optional[str] = None):
        """
        Load vector store from disk
        
        Args:
            path: Path to load from (uses self.store_path if not provided)
        """
        load_path = path or self.store_path
        if load_path is None or not os.path.exists(load_path):
            logger.warning(f"Load path {load_path} does not exist")
            return
        
        with open(load_path, 'r') as f:
            data = json.load(f)
        
        self.dimension = data['dimension']
        self.vectors = np.array(data['vectors'])
        self.metadata = data['metadata']
        self.id_to_index = data['id_to_index']
        
        logger.info(f"Vector store loaded from {load_path} ({len(self.metadata)} vectors)")
    
    def size(self) -> int:
        """Get number of vectors in store"""
        return len(self.metadata)
    
    def clear(self):
        """Clear all vectors from store"""
        self.vectors = np.array([]).reshape(0, self.dimension)
        self.metadata = []
        self.id_to_index = {}
        logger.info("Vector store cleared")


# Global store instance
_vector_store: Optional[VectorStore] = None


def get_vector_store(dimension: int = 384, store_path: Optional[str] = None) -> VectorStore:
    """
    Get or create vector store singleton
    
    Args:
        dimension: Dimension of vectors
        store_path: Optional path for persistence
        
    Returns:
        VectorStore: Vector store instance
    """
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStore(dimension, store_path)
    return _vector_store
