import json
import re


def validate_and_clean_data(data):
    """
    Validate and clean the extracted data to ensure it matches our model requirements
    """
    try:
        result = {
            'candidate': {},
            'education': [],
            'skills': [],
            'error': None
        }
        
        # Validate candidate data
        candidate = data.get('candidate', {})
        result['candidate'] = {
            'fullname': clean_string(candidate.get('fullname')),
            'email': validate_email(candidate.get('email')),
            'phone': clean_phone(candidate.get('phone')),
            'location': clean_string(candidate.get('location')),
            'years_experience': validate_number(candidate.get('years_experience'))
        }
        
        # Validate education data
        education_list = data.get('education', [])
        for edu in education_list:
            if isinstance(edu, dict):
                education_entry = {
                    'degree': clean_string(edu.get('degree')),
                    'institution': clean_string(edu.get('institution')),
                    'graduation_year': validate_year(edu.get('graduation_year')),
                    'gpa': validate_gpa(edu.get('gpa'))
                }
                # Only add if at least degree or institution is present
                if education_entry['degree'] or education_entry['institution']:
                    result['education'].append(education_entry)
        
        # Validate skills data
        skills_list = data.get('skills', [])
        valid_categories = ['technical', 'soft', 'language', 'other']
        valid_proficiency = ['beginner', 'intermediate', 'advanced', 'expert']
        
        for skill in skills_list:
            if isinstance(skill, dict) and skill.get('skill_name'):
                skill_category = skill.get('skill_category', '').lower()
                proficiency_level = skill.get('proficiency_level', '').lower()
                
                skill_entry = {
                    'skill_name': clean_string(skill.get('skill_name')),
                    'skill_category': skill_category if skill_category in valid_categories else 'other',
                    'proficiency_level': proficiency_level if proficiency_level in valid_proficiency else 'intermediate'
                }
                
                if skill_entry['skill_name']:
                    result['skills'].append(skill_entry)
        
        return result
        
    except Exception as e:
        return {
            'error': f'Data validation error: {str(e)}',
            'candidate': None,
            'education': [],
            'skills': []
        }

def clean_string(value):
    """Clean and validate string fields"""
    if not value or not isinstance(value, str):
        return None
    return value.strip()[:255] if value.strip() else None

def validate_email(email):
    """Validate email format"""
    if not email or not isinstance(email, str):
        return None
    
    email = email.strip().lower()
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if re.match(email_pattern, email):
        return email
    return None

def clean_phone(phone):
    """Clean phone number"""
    if not phone or not isinstance(phone, str):
        return None
    
    # Remove all non-numeric characters
    cleaned = re.sub(r'[^\d]', '', phone)
    
    # Return if it's a reasonable length for a phone number
    if 10 <= len(cleaned) <= 15:
        return cleaned
    return None

def validate_number(value):
    """Validate numeric fields"""
    if value is None:
        return None
    
    try:
        num = int(value)
        return num if 0 <= num <= 50 else None
    except (ValueError, TypeError):
        return None

def validate_year(year):
    """Validate graduation year"""
    if year is None:
        return None
    
    try:
        year_int = int(year)
        current_year = 2025
        # Reasonable range for graduation years
        if 1950 <= year_int <= current_year + 10:
            return year_int
    except (ValueError, TypeError):
        pass
    return None

def validate_gpa(gpa):
    if gpa is None:
        return None
    
    try:
        gpa_float = float(gpa)
        if 0.0 <= gpa_float <= 10.0:
            return round(gpa_float, 2)
    except (ValueError, TypeError):
        pass
    return None


