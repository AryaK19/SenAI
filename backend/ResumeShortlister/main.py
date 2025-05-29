from .getData import get_shortlisting_data
from .educationShortlister import shortlist_by_education
from .skillShortlister import shortlist_by_skills
from .experienceShortlister import shortlist_by_experience
from database import db
from Models.candidate import AppliedCandidate

def shortlist_candidates(job_id):

    # Get job details and candidates
    data = get_shortlisting_data(job_id)
    
    if not data['success']:
        return data
    
    job_details = data['job']
    candidates = data['candidates']
    
    # If no candidates or job details, return early
    if not candidates or not job_details:
        return {
            'success': True,
            'message': 'No candidates to shortlist',
            'ranked_candidates': [],
            'total_candidates': 0
        }
    
    # Step 1: Apply education shortlisting if qualifications specified
    education_qualified = candidates
    if job_details.get('education_qualification'):
        education_qualified = shortlist_by_education(candidates, job_details['education_qualification'])
    
    # Step 2: Apply skill shortlisting to get skill scores
    skill_scored_candidates = shortlist_by_skills(education_qualified, job_details)
    
    # Step 3: Apply experience shortlisting to get experience scores
    experience_scored_candidates = shortlist_by_experience(skill_scored_candidates, job_details)
    
    # Step 4: Calculate aggregate score for each candidate
    ranked_candidates = []
    for candidate in experience_scored_candidates:
        # Get individual scores, defaulting to 0 if not present
        skill_score = candidate.get('skill_score', 0)
        experience_score = candidate.get('experience_score', 0)
        
        # Calculate aggregate score (equal weights for skills and experience)
        aggregate_score = (skill_score * 0.5) + (experience_score * 0.5)
        aggregate_score = round(aggregate_score * 100) / 100  # Round to 2 decimal places
        
        # Add aggregate score to candidate data
        candidate_with_aggregate = candidate.copy()
        candidate_with_aggregate['aggregate_score'] = aggregate_score
        
        ranked_candidates.append(candidate_with_aggregate)
    
    # Sort candidates by aggregate score in descending order
    ranked_candidates.sort(key=lambda c: c.get('aggregate_score', 0), reverse=True)
    
    # Update the database with the new scores
    for candidate in ranked_candidates:
        application = AppliedCandidate.query.filter_by(
            job_id=job_id,
            candidate_id=candidate['candidate_id']
        ).first()
        
        if application:
            application.compatibility_score = candidate['aggregate_score']
    
    # Commit changes to database
    db.session.commit()
    
    # Return the ranked candidates
    return {
        'success': True,
        'job': job_details,
        'ranked_candidates': ranked_candidates,
        'total_candidates': len(ranked_candidates)
    }

def get_shortlisted_candidates(job_id, threshold=0.4):

    # First, ensure scores are up to date
    results = shortlist_candidates(job_id)
    
    if not results['success'] or not results.get('ranked_candidates'):
        return []
    
    
    return results['ranked_candidates']
