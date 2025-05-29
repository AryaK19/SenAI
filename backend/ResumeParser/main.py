from ResumeParser.readResume import readResume
from ResumeParser.LLMParser import LLMParser
from ResumeParser.validateResult import validate_and_clean_data

def resumeParser(file_path):
    """
    Main function to parse a resume file and extract structured data
    """
    # Read the resume file and extract text
    resume_text = readResume(file_path)
    
    if not resume_text:
        return {
            'error': 'Could not extract text from resume file',
            'candidate': None,
            'education': [],
            'skills': []
        }
    
    # Use LLMParser to extract structured data
    parsed_data = LLMParser(resume_text)
    
    # Validate and clean the parsed data
    validated_data = validate_and_clean_data(parsed_data)
    print(f"Parsed Data: {parsed_data}")
    print(f"Validated Data: {validated_data}")
    
    # Return validated data instead of raw parsed data
    return validated_data if not validated_data.get('error') else parsed_data