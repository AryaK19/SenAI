import re
from difflib import SequenceMatcher

def parse_degree(degree_string):
    """Parse a degree string into components (level, field, specialization)"""
    if not degree_string:
        return None, None, None
    
    # Normalize the string
    degree_string = degree_string.lower().strip()
    
    # Extract degree level
    level_patterns = {
        'bachelor': ['bachelor', 'bachelors', 'b.s.', 'b.a.', 'b.tech', 'b.e.', 'undergraduate'],
        'master': ['master', 'masters', 'm.s.', 'm.a.', 'm.tech', 'm.e.', 'graduate', 'post graduate'],
        'phd': ['phd', 'ph.d', 'doctorate', 'doctoral'],
        'associate': ['associate', 'diploma']
    }
    
    degree_level = None
    for level, patterns in level_patterns.items():
        if any(pattern in degree_string for pattern in patterns):
            degree_level = level
            break
    
    # Extract field of study
    field_patterns = {
        'science': ['science', 'technology', 'engineering', 'technical'],
        'arts': ['arts', 'design', 'fine arts', 'liberal arts'],
        'business': ['business', 'commerce', 'administration', 'management', 'mba'],
        'law': ['law', 'legal', 'juris'],
        'medicine': ['medicine', 'medical', 'health', 'nursing']
    }
    
    degree_field = None
    for field, patterns in field_patterns.items():
        if any(pattern in degree_string for pattern in patterns):
            degree_field = field
            break
    

    specialization = None
    spec_match = re.search(r'(?:in|of|with focus on|specializing in)\s+(.+?)(?:$|with|and)', degree_string)
    if spec_match:
        specialization = spec_match.group(1).strip()
    else:
   
        parts = re.split(r'\s+', degree_string)
        if len(parts) > 2:
            specialization = parts[-1]
    
    return degree_level, degree_field, specialization

def are_degrees_compatible(required_degree, candidate_degree):
    """Determine if the candidate degree meets the required degree"""
    # Parse both degrees
    req_level, req_field, req_spec = parse_degree(required_degree)
    cand_level, cand_field, cand_spec = parse_degree(candidate_degree)
    
    # If we couldn't parse either degree properly
    if not req_level or not cand_level:
        # Fall back to simple similarity check
        return SequenceMatcher(None, required_degree.lower(), candidate_degree.lower()).ratio() > 0.8
    
    # Check degree level compatibility
    level_hierarchy = {
        'associate': 1,
        'bachelor': 2,
        'master': 3,
        'phd': 4
    }
    
    # If candidate's degree level is lower than required
    if level_hierarchy.get(cand_level, 0) < level_hierarchy.get(req_level, 0):
        return False
    
    # Check field compatibility
    if req_field and cand_field and req_field != cand_field:
        # Some fields are compatible (e.g., technology and science)
        compatible_fields = {
            'science': ['technology', 'engineering'],
            'technology': ['science', 'engineering'],
            'engineering': ['science', 'technology']
        }
        if cand_field not in compatible_fields.get(req_field, []):
            return False
    
    # Check specialization using fuzzy matching if both exist
    if req_spec and cand_spec:
        similarity = SequenceMatcher(None, req_spec.lower(), cand_spec.lower()).ratio()
        return similarity > 0.6  # 60% similarity threshold
    
    return True  # If we got this far, the degrees are compatible enough

def shortlist_by_education(candidates, job_qualification):
    """Shortlist candidates based on educational qualifications"""
    shortlisted = []
    
    for candidate in candidates:
        if 'education' not in candidate:
            continue
            
        for education in candidate['education']:
            if not education.get('degree'):
                continue
                
            if are_degrees_compatible(job_qualification, education['degree']):
                shortlisted.append(candidate)
                break 
    
    return shortlisted