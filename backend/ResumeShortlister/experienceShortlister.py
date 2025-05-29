from sentence_transformers import SentenceTransformer, util
import re
import torch
import numpy as np

# Initialize the model - this will download the model if not already present
model = SentenceTransformer('all-MiniLM-L6-v2')

def preprocess_text(text):
    """Clean and prepare text for embedding"""
    if not text:
        return ""
    
    # Convert to lowercase
    text = text.lower()
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Remove special characters but keep spaces and periods
    text = re.sub(r'[^a-z0-9\s\.]', ' ', text)
    
    return text

def calculate_experience_similarity(candidate_experience, job_description):

    if not candidate_experience or not job_description:
        return 0.0
    
    # Preprocess texts
    processed_experience = preprocess_text(candidate_experience)
    processed_job_desc = preprocess_text(job_description)
    
    if not processed_experience or not processed_job_desc:
        return 0.0
    
    # Generate embeddings
    embeddings = model.encode([processed_experience, processed_job_desc])
    experience_embedding = embeddings[0]
    job_desc_embedding = embeddings[1]
    
    # Calculate cosine similarity
    similarity = util.pytorch_cos_sim(experience_embedding, job_desc_embedding).item()
    
    # Normalize to ensure it's between 0 and 1
    return float(similarity)

def experience_years_match(candidate_years, job_description):

    if candidate_years is None or not job_description:
        return 0.5  # Neutral score if information is missing
    
  
    experience_patterns = [
        r'(\d+)\+?\s*(?:years|yrs)(?:\s*of\s*experience)?',  # "X+ years" or "X years"
        r'(\d+)\s*-\s*(\d+)\s*(?:years|yrs)'  # "X-Y years"
    ]
    
    min_years_required = None
    max_years_required = None
    
    for pattern in experience_patterns:
        matches = re.findall(pattern, job_description.lower())
        if matches:
            for match in matches:
                if isinstance(match, tuple):
                    if len(match) >= 2:  # Range like "X-Y years"
                        min_years = int(match[0])
                        max_years = int(match[1])
                        min_years_required = min_years if min_years_required is None else min(min_years_required, min_years)
                        max_years_required = max_years if max_years_required is None else max(max_years_required, max_years)
                else:  # Single value like "X+ years"
                    min_year = int(match)
                    min_years_required = min_year if min_years_required is None else min(min_years_required, min_year)
    
    
    if min_years_required is not None:
        if max_years_required is not None:
           
            if candidate_years < min_years_required:
                return max(0.0, candidate_years / min_years_required * 0.8)  
            elif candidate_years > max_years_required:
                return 0.8  
            else:
                return 1.0  
        else:
           
            if candidate_years >= min_years_required:
                return 1.0  
            else:
                return max(0.0, candidate_years / min_years_required * 0.8) 
    
    
    return 0.7 

def shortlist_by_experience(candidates, job_details):

    job_description = job_details.get('description', '')
    
    scored_candidates = []
    for candidate in candidates:
        candidate_experience = candidate.get('experience', '')
        years_experience = candidate.get('years_experience')
        
        # Calculate text similarity
        similarity_score = calculate_experience_similarity(candidate_experience, job_description)
        
        # Calculate years match score
        years_match_score = experience_years_match(years_experience, job_description)
        
        # Combined score (70% similarity, 30% years match)
        combined_score = (similarity_score * 0.7) + (years_match_score * 0.3)
        combined_score = round(combined_score * 100) / 100  # Round to 2 decimal places
        
        # Add score to candidate data
        candidate_with_score = candidate.copy()
        candidate_with_score['experience_score'] = combined_score
        candidate_with_score['experience_match_details'] = {
            'text_similarity': similarity_score,
            'years_match': years_match_score
        }
        
        scored_candidates.append(candidate_with_score)
    
    # Sort by experience score in descending order
    return sorted(scored_candidates, key=lambda c: c.get('experience_score', 0), reverse=True)