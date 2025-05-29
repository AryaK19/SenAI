import re
from difflib import SequenceMatcher
import nltk
from nltk.stem import WordNetLemmatizer
from Models.candidate import ProficiencyLevel


# nltk.download('wordnet')

def preprocess_skill(skill):
    if not skill:
        return ""
        
    # Convert to lowercase and remove special characters
    skill = skill.lower().strip()
    skill = re.sub(r'[^\w\s]', ' ', skill)
    
    # Remove common words that don't add meaning
    
    words = [word for word in skill.split()]
    
    # Lemmatize words to handle different forms
    lemmatizer = WordNetLemmatizer()
    words = [lemmatizer.lemmatize(word) for word in words]
    
    return ' '.join(words)

def calculate_skill_similarity(skill1, skill2):

    proc_skill1 = preprocess_skill(skill1)
    proc_skill2 = preprocess_skill(skill2)
    
    # For very short skills, be more strict in matching
    if len(proc_skill1) < 4 or len(proc_skill2) < 4:
        return 1.0 if proc_skill1 == proc_skill2 else 0.0
    
    # Calculate similarity ratio
    return SequenceMatcher(None, proc_skill1, proc_skill2).ratio()

def get_proficiency_score(proficiency_level):
    if not proficiency_level:
        return 0.5  # Default to intermediate
        
    proficiency_scores = {
        'beginner': 0.25,
        'intermediate': 0.5,
        'advanced': 0.75,
        'expert': 1.0
    }
    
    return proficiency_scores.get(proficiency_level, 0.5)

def match_skills(required_skills_str, candidate_skills):

    if not required_skills_str or not candidate_skills:
        return {
            'score': 0.0,
            'matched_skills': [],
            'missing_skills': [],
            'total_required': 0
        }
    
    # Parse required skills
    required_skills = [skill.strip() for skill in required_skills_str.split(',') if skill.strip()]
    
    # Track matches for each required skill
    skill_matches = []
    matched_skills = []
    missing_skills = []
    
    # For each required skill, find the best match in candidate skills
    for req_skill in required_skills:
        best_match = None
        best_match_score = 0
        best_match_proficiency = 0
        
        for cand_skill in candidate_skills:
            # Skip if we've already matched this candidate skill
            if cand_skill in matched_skills:
                continue
                
            skill_name = cand_skill.get('skill_name', '')
            sim_score = calculate_skill_similarity(req_skill, skill_name)
            
            # Consider as a match if similarity is high enough
            if sim_score > 0.7 and sim_score > best_match_score:
                best_match = cand_skill
                best_match_score = sim_score
                prof = cand_skill.get('proficiency', 'intermediate')
                best_match_proficiency = get_proficiency_score(prof)
        
        # If we found a good match
        if best_match:
            matched_skills.append(best_match)
            skill_matches.append({
                'required': req_skill,
                'matched': best_match.get('skill_name', ''),
                'similarity': best_match_score,
                'proficiency': best_match.get('proficiency', 'intermediate'),
                'proficiency_score': best_match_proficiency
            })
        else:
            missing_skills.append(req_skill)
    
    # Calculate overall score based on:
    # 1. Percentage of required skills matched
    # 2. Average proficiency level of matched skills
    # 3. Average similarity score of matches
    
    total_required = len(required_skills)
    matched_count = len(skill_matches)
    
    if total_required == 0:
        return {
            'score': 0.0,
            'matched_skills': [],
            'missing_skills': [],
            'total_required': 0
        }
    
    # Calculate coverage score (how many required skills were matched)
    coverage_score = matched_count / total_required
    
    # Calculate average proficiency and similarity for matched skills
    if matched_count > 0:
        avg_proficiency = sum(match['proficiency_score'] for match in skill_matches) / matched_count
        avg_similarity = sum(match['similarity'] for match in skill_matches) / matched_count
    else:
        avg_proficiency = 0
        avg_similarity = 0
    
    # Final score is weighted combination of coverage, proficiency and similarity
    final_score = (coverage_score * 0.6) + (avg_proficiency * 0.3) + (avg_similarity * 0.1)
    final_score = round(final_score * 100) / 100  # Round to 2 decimal places
    
    return {
        'score': final_score,
        'matched_skills': skill_matches,
        'missing_skills': missing_skills,
        'total_required': total_required,
        'matched_count': matched_count,
        'coverage': coverage_score,
        'avg_proficiency': avg_proficiency,
        'avg_similarity': avg_similarity
    }

def shortlist_by_skills(candidates, job_details):

    required_skills = job_details.get('skills_required', '')
    
    scored_candidates = []
    for candidate in candidates:
        candidate_skills = candidate.get('skills', [])
        

        match_results = match_skills(required_skills, candidate_skills)
        

        candidate_with_score = candidate.copy()
        candidate_with_score['skill_score'] = match_results['score']
        candidate_with_score['skill_match_details'] = match_results
        
        scored_candidates.append(candidate_with_score)
    
    return sorted(scored_candidates, key=lambda c: c.get('skill_score', 0), reverse=True)