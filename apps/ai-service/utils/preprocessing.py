"""
Data preprocessing utilities for AI/ML models
Handles text cleaning, tokenization, and feature extraction
"""
import re
import string
from typing import List, Dict, Any, Optional
import numpy as np
from collections import Counter


def clean_text(text: str) -> str:
    """
    Clean and normalize text data
    
    Args:
        text: Raw text string
        
    Returns:
        str: Cleaned text
    """
    if not text:
        return ""
    
    # Convert to lowercase
    text = text.lower()
    
    # Remove URLs
    text = re.sub(r'http\S+|www\.\S+', '', text)
    
    # Remove email addresses
    text = re.sub(r'\S+@\S+', '', text)
    
    # Remove special characters but keep spaces and basic punctuation
    text = re.sub(r'[^\w\s.,!?-]', '', text)
    
    # Remove extra whitespace
    text = ' '.join(text.split())
    
    return text


def tokenize(text: str) -> List[str]:
    """
    Simple tokenization of text
    
    Args:
        text: Text to tokenize
        
    Returns:
        List[str]: List of tokens
    """
    # Clean text first
    text = clean_text(text)
    
    # Split on whitespace and punctuation
    tokens = re.findall(r'\b\w+\b', text)
    
    return tokens


def remove_stopwords(tokens: List[str], stopwords: Optional[set] = None) -> List[str]:
    """
    Remove common stopwords from token list
    
    Args:
        tokens: List of tokens
        stopwords: Set of stopwords (uses default if None)
        
    Returns:
        List[str]: Filtered tokens
    """
    if stopwords is None:
        # Common English stopwords
        stopwords = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
            'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
            'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this',
            'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
        }
    
    return [token for token in tokens if token.lower() not in stopwords]


def extract_keywords(text: str, top_n: int = 10) -> List[tuple]:
    """
    Extract top keywords from text using TF (term frequency)
    
    Args:
        text: Input text
        top_n: Number of top keywords to return
        
    Returns:
        List[tuple]: List of (keyword, frequency) tuples
    """
    tokens = tokenize(text)
    tokens = remove_stopwords(tokens)
    
    # Count token frequencies
    counter = Counter(tokens)
    
    return counter.most_common(top_n)


def calculate_text_similarity(text1: str, text2: str) -> float:
    """
    Calculate Jaccard similarity between two texts
    
    Args:
        text1: First text
        text2: Second text
        
    Returns:
        float: Similarity score between 0 and 1
    """
    tokens1 = set(tokenize(text1))
    tokens2 = set(tokenize(text2))
    
    if not tokens1 or not tokens2:
        return 0.0
    
    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    
    return len(intersection) / len(union) if union else 0.0


def extract_features(text: str, max_features: int = 100) -> Dict[str, float]:
    """
    Extract feature vector from text
    
    Args:
        text: Input text
        max_features: Maximum number of features
        
    Returns:
        Dict[str, float]: Feature dictionary
    """
    tokens = tokenize(text)
    tokens = remove_stopwords(tokens)
    
    # Calculate basic features
    features = {
        'length': len(text),
        'word_count': len(tokens),
        'avg_word_length': np.mean([len(token) for token in tokens]) if tokens else 0,
        'unique_words': len(set(tokens)),
        'lexical_diversity': len(set(tokens)) / len(tokens) if tokens else 0
    }
    
    # Add top term frequencies
    counter = Counter(tokens)
    for term, freq in counter.most_common(max_features - len(features)):
        features[f'term_{term}'] = freq
    
    return features


def normalize_features(features: Dict[str, float]) -> Dict[str, float]:
    """
    Normalize feature values to [0, 1] range
    
    Args:
        features: Feature dictionary
        
    Returns:
        Dict[str, float]: Normalized features
    """
    values = np.array(list(features.values()))
    
    if len(values) == 0:
        return features
    
    # Min-max normalization
    min_val = values.min()
    max_val = values.max()
    
    if max_val == min_val:
        return {k: 0.5 for k in features.keys()}
    
    return {
        k: (v - min_val) / (max_val - min_val)
        for k, v in features.items()
    }


def preprocess_program_data(program: Dict[str, Any]) -> Dict[str, Any]:
    """
    Preprocess program data for ML models
    
    Args:
        program: Raw program data
        
    Returns:
        Dict[str, Any]: Preprocessed program data
    """
    processed = program.copy()
    
    # Clean text fields
    if 'title' in processed:
        processed['title_clean'] = clean_text(processed['title'])
    
    if 'description' in processed:
        processed['description_clean'] = clean_text(processed['description'])
        processed['description_keywords'] = extract_keywords(processed['description'])
    
    if 'learning_outcomes' in processed:
        outcomes_text = ' '.join(processed['learning_outcomes'])
        processed['outcomes_clean'] = clean_text(outcomes_text)
        processed['outcomes_keywords'] = extract_keywords(outcomes_text)
    
    return processed


def create_feature_vector(
    program_data: Dict[str, Any],
    feature_names: List[str]
) -> np.ndarray:
    """
    Create numerical feature vector from program data
    
    Args:
        program_data: Preprocessed program data
        feature_names: List of feature names to extract
        
    Returns:
        np.ndarray: Feature vector
    """
    features = []
    
    for feature_name in feature_names:
        value = program_data.get(feature_name, 0)
        
        # Convert to float
        if isinstance(value, (int, float)):
            features.append(float(value))
        elif isinstance(value, str):
            features.append(float(len(value)))
        elif isinstance(value, list):
            features.append(float(len(value)))
        else:
            features.append(0.0)
    
    return np.array(features)
