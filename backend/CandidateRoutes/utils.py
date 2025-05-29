from Models.candidate import Candidate, Education, Skills, SkillCategory, ProficiencyLevel
from database import db


def update_candidate_from_parsed_data(candidate_id, parsed_data):
        """Helper function to update candidate data from parsed resume"""
        try:
            candidate = Candidate.query.filter_by(candidate_id=candidate_id).first()
            if not candidate:
                return {'success': False, 'message': 'Candidate not found'}
            
            # Update candidate profile data
            candidate_data = parsed_data.get('candidate', {})
            if candidate_data.get('fullname'):
                candidate.fullname = candidate_data['fullname']
            if candidate_data.get('phone'):
                candidate.phone = candidate_data['phone']
            if candidate_data.get('location'):
                candidate.location = candidate_data['location']
            if candidate_data.get('years_experience') is not None:
                candidate.years_experience = candidate_data['years_experience']
            
            # Clear existing education and skills to replace with new data
            Education.query.filter_by(candidate_id=candidate_id).delete()
            Skills.query.filter_by(candidate_id=candidate_id).delete()
            
            # Add education records
            education_list = parsed_data.get('education', [])
            for edu_data in education_list:
                if edu_data.get('degree') or edu_data.get('institution'):
                    new_education = Education(
                        candidate_id=candidate_id,
                        degree=edu_data.get('degree'),
                        institution=edu_data.get('institution'),
                        graduation_year=edu_data.get('graduation_year'),
                        gpa=edu_data.get('gpa')
                    )
                    db.session.add(new_education)
            
            # Add skills records
            skills_list = parsed_data.get('skills', [])
            for skill_data in skills_list:
                if skill_data.get('skill_name'):
                    # Validate enum values
                    skill_category = None
                    if skill_data.get('skill_category'):
                        try:
                            skill_category = SkillCategory(skill_data['skill_category'])
                        except ValueError:
                            skill_category = SkillCategory.other
                    
                    proficiency_level = None
                    if skill_data.get('proficiency_level'):
                        try:
                            proficiency_level = ProficiencyLevel(skill_data['proficiency_level'])
                        except ValueError:
                            proficiency_level = ProficiencyLevel.intermediate
                    
                    new_skill = Skills(
                        candidate_id=candidate_id,
                        skill_name=skill_data['skill_name'],
                        skill_category=skill_category,
                        proficiency_level=proficiency_level
                    )
                    db.session.add(new_skill)
            
            db.session.commit()
            return {'success': True, 'message': 'Candidate data updated successfully'}
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': f'Error updating candidate data: {str(e)}'}