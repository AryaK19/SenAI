from database import db
from Models.company import Company
from Models.candidate import Candidate, Education, Skills, AppliedCandidate

def get_job_details(job_id):

    job = Company.query.get(job_id)
    if not job:
        return None
    
    return {
        'job_id': job.job_id,
        'company_name': job.company_name,
        'job_role': job.job_role,
        'job_type': job.job_type,
        'location': job.location,
        'skills_required': job.skills_required,
        'education_qualification': job.education_qualification,
        'description': job.description,
        'stipend': job.stipend
    }

def get_applied_candidates(job_id):

    # Find all applications for this job
    applications = AppliedCandidate.query.filter_by(job_id=job_id).all()
    
    candidates_list = []
    for application in applications:
        candidate = Candidate.query.get(application.candidate_id)
        
        if candidate:
            # Get education details
            education = []
            for edu in candidate.education:
                education.append({
                    'degree': edu.degree,
                    'institution': edu.institution,
                    'graduation_year': edu.graduation_year,
                    'gpa': float(edu.gpa) if edu.gpa else None
                })
            
            # Get skills details
            skills = []
            for skill in candidate.skills:
                skills.append({
                    'skill_name': skill.skill_name,
                    'category': skill.skill_category.value if skill.skill_category else None,
                    'proficiency': skill.proficiency_level.value if skill.proficiency_level else None
                })
            
            # Compile candidate data
            candidate_data = {
                'candidate_id': candidate.candidate_id,
                'fullname': candidate.fullname,
                'email': candidate.email,
                'phone': candidate.phone,
                'location': candidate.location,
                'years_experience': candidate.years_experience,
                'resume_file_path': candidate.resume_file_path,
                'status': candidate.status,
                'applied_at': application.applied_at.strftime('%Y-%m-%d %H:%M:%S') if application.applied_at else None,
                'shortlisted': application.shortlisted,
                'education': education,
                'skills': skills
            }
            
            candidates_list.append(candidate_data)
    
    return candidates_list

def get_shortlisting_data(job_id):

    job_details = get_job_details(job_id)
    
    if not job_details:
        return {
            'success': False,
            'message': 'Job not found'
        }
    
    candidates = get_applied_candidates(job_id)
    
    return {
        'success': True,
        'job': job_details,
        'candidates': candidates,
        'total_candidates': len(candidates)
    }