"""
Semantic similarity search API endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging

from services.embeddings import get_embedding_service
from services.vector_store import get_vector_store
from config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()


# Request/Response Models
class TextInput(BaseModel):
    """Text input for embedding"""
    text: str
    metadata: Optional[Dict[str, Any]] = None


class EmbeddingRequest(BaseModel):
    """Embedding generation request"""
    texts: List[str]
    batch_size: int = Field(default=32, ge=1, le=128)


class EmbeddingResponse(BaseModel):
    """Embedding generation response"""
    embeddings: List[List[float]]
    dimension: int
    count: int


class SemanticSearchRequest(BaseModel):
    """Semantic search request"""
    query: str
    top_k: int = Field(default=10, ge=1, le=100)
    threshold: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    filters: Optional[Dict[str, Any]] = None


class SearchResult(BaseModel):
    """Single search result"""
    id: str
    similarity: float
    metadata: Dict[str, Any]


class SemanticSearchResponse(BaseModel):
    """Semantic search response"""
    query: str
    results: List[SearchResult]
    total: int


class IndexRequest(BaseModel):
    """Request to index documents"""
    documents: List[TextInput]


class IndexResponse(BaseModel):
    """Index response"""
    indexed_count: int
    total_documents: int
    message: str


class SimilarityRequest(BaseModel):
    """Text similarity comparison request"""
    text1: str
    text2: str


class SimilarityResponse(BaseModel):
    """Similarity comparison response"""
    text1: str
    text2: str
    similarity: float
    interpretation: str


# Endpoints
@router.post("/embeddings", response_model=EmbeddingResponse)
async def generate_embeddings(request: EmbeddingRequest):
    """
    Generate embeddings for text inputs
    
    Args:
        request: List of texts to embed
        
    Returns:
        EmbeddingResponse: Embedding vectors
    """
    try:
        logger.info(f"Generating embeddings for {len(request.texts)} texts")
        
        embedding_service = get_embedding_service(settings.embedding_model)
        
        # Generate embeddings
        embeddings = embedding_service.encode(
            request.texts,
            batch_size=request.batch_size
        )
        
        # Convert to list format
        embeddings_list = embeddings.tolist()
        
        return EmbeddingResponse(
            embeddings=embeddings_list,
            dimension=embedding_service.get_embedding_dimension(),
            count=len(embeddings_list)
        )
        
    except Exception as e:
        logger.error(f"Error generating embeddings: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search", response_model=SemanticSearchResponse)
async def semantic_search(request: SemanticSearchRequest):
    """
    Perform semantic similarity search
    
    Args:
        request: Search query and parameters
        
    Returns:
        SemanticSearchResponse: Search results
    """
    try:
        logger.info(f"Performing semantic search: '{request.query[:50]}...'")
        
        embedding_service = get_embedding_service(settings.embedding_model)
        vector_store = get_vector_store(
            dimension=embedding_service.get_embedding_dimension(),
            store_path=settings.vector_db_path
        )
        
        # Generate query embedding
        query_embedding = embedding_service.encode(request.query)
        
        # Search vector store
        results = vector_store.search(
            query_vector=query_embedding,
            top_k=request.top_k,
            threshold=request.threshold
        )
        
        # Apply filters if provided
        if request.filters:
            filtered_results = []
            for vector_id, similarity, metadata in results:
                # Check if metadata matches filters
                matches = all(
                    metadata.get(key) == value
                    for key, value in request.filters.items()
                )
                if matches:
                    filtered_results.append((vector_id, similarity, metadata))
            results = filtered_results
        
        # Convert to response format
        search_results = [
            SearchResult(
                id=vector_id,
                similarity=similarity,
                metadata=metadata
            )
            for vector_id, similarity, metadata in results
        ]
        
        return SemanticSearchResponse(
            query=request.query,
            results=search_results,
            total=len(search_results)
        )
        
    except Exception as e:
        logger.error(f"Error performing semantic search: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/index", response_model=IndexResponse)
async def index_documents(request: IndexRequest):
    """
    Index documents for semantic search
    
    Args:
        request: Documents to index
        
    Returns:
        IndexResponse: Indexing status
    """
    try:
        logger.info(f"Indexing {len(request.documents)} documents")
        
        embedding_service = get_embedding_service(settings.embedding_model)
        vector_store = get_vector_store(
            dimension=embedding_service.get_embedding_dimension(),
            store_path=settings.vector_db_path
        )
        
        # Extract texts and metadata
        texts = [doc.text for doc in request.documents]
        metadata_list = [doc.metadata or {} for doc in request.documents]
        
        # Generate embeddings
        embeddings = embedding_service.encode(texts, batch_size=32)
        
        # Add to vector store
        vector_ids = vector_store.add_batch(
            vectors=embeddings,
            metadata_list=metadata_list
        )
        
        # Optionally save to disk
        if settings.vector_db_path:
            vector_store.save()
        
        return IndexResponse(
            indexed_count=len(vector_ids),
            total_documents=vector_store.size(),
            message=f"Successfully indexed {len(vector_ids)} documents"
        )
        
    except Exception as e:
        logger.error(f"Error indexing documents: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/similarity", response_model=SimilarityResponse)
async def compare_similarity(request: SimilarityRequest):
    """
    Compare similarity between two texts
    
    Args:
        request: Two texts to compare
        
    Returns:
        SimilarityResponse: Similarity score
    """
    try:
        logger.info("Comparing text similarity")
        
        embedding_service = get_embedding_service(settings.embedding_model)
        
        # Generate embeddings
        embeddings = embedding_service.encode([request.text1, request.text2])
        
        # Calculate similarity
        similarity = embedding_service.similarity(embeddings[0], embeddings[1])
        
        # Interpret score
        if similarity >= 0.8:
            interpretation = "Very high similarity - texts are nearly identical in meaning"
        elif similarity >= 0.6:
            interpretation = "High similarity - texts share strong semantic overlap"
        elif similarity >= 0.4:
            interpretation = "Moderate similarity - texts have some common themes"
        elif similarity >= 0.2:
            interpretation = "Low similarity - texts are somewhat related"
        else:
            interpretation = "Very low similarity - texts are largely unrelated"
        
        return SimilarityResponse(
            text1=request.text1[:100] + ("..." if len(request.text1) > 100 else ""),
            text2=request.text2[:100] + ("..." if len(request.text2) > 100 else ""),
            similarity=float(similarity),
            interpretation=interpretation
        )
        
    except Exception as e:
        logger.error(f"Error comparing similarity: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/store/info")
async def get_store_info():
    """
    Get information about the vector store
    
    Returns:
        dict: Store information
    """
    try:
        embedding_service = get_embedding_service(settings.embedding_model)
        vector_store = get_vector_store(
            dimension=embedding_service.get_embedding_dimension(),
            store_path=settings.vector_db_path
        )
        
        return {
            "total_documents": vector_store.size(),
            "dimension": vector_store.dimension,
            "embedding_model": settings.embedding_model,
            "store_path": settings.vector_db_path
        }
        
    except Exception as e:
        logger.error(f"Error getting store info: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/store/clear")
async def clear_store():
    """
    Clear all documents from vector store
    
    Returns:
        dict: Status message
    """
    try:
        embedding_service = get_embedding_service(settings.embedding_model)
        vector_store = get_vector_store(
            dimension=embedding_service.get_embedding_dimension(),
            store_path=settings.vector_db_path
        )
        
        vector_store.clear()
        
        return {
            "status": "success",
            "message": "Vector store cleared successfully"
        }
        
    except Exception as e:
        logger.error(f"Error clearing store: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
