from ResumeParser.readResume import readResume
import os
import json
import re
from dotenv import load_dotenv
from google import genai

from ResumeParser.validateResult import validate_and_clean_data

# Load environment variables
load_dotenv()

def LLMParser(resume_text):
    """
    Extract candidate data from resume using Gemini 2.0 Flash
    Returns structured data matching the Candidate, Education, and Skills models
    """
    try:
        
        if not resume_text:
            return {
                'error': 'Could not extract text from resume file',
                'candidate': None,
                'education': [],
                'skills': []
            }
        print(f"Resume text to parse: {resume_text}")  



        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        
        # Create detailed prompt for data extraction
        prompt = f"""
        You are an expert resume parser. Extract the following information from this resume text and return it as a JSON object.

        IMPORTANT RULES:
        1. Return ONLY valid JSON, no additional text or explanation
        2. If information is not found, use null for that field
        3. For skills, categorize them as: 'technical', 'soft', 'language', or 'other'
        4. For proficiency levels, use: 'beginner', 'intermediate', 'advanced', or 'expert'
        5. Extract years of experience as a number (estimate if needed based on work history)
        6. For phone numbers, extract in clean format without special characters
        7. Extract all education entries and all skills
        8. GPA also known as CGPA should be extracted and rounded to 2 decimal places
        9. Ensure all fields are present in the JSON structure, even if null
        10. For proficiency levels, use the most appropriate level based on the context of the experiance/PROFESSIONAL BACKGROUND and projects mentioned in the resume
        11. If a field is not applicable, set it to null

        Expected JSON structure:
        {{
            "candidate": {{
                "fullname": "string",
                "email": "string", 
                "phone": "string",
                "location": "string",
                "years_experience": number
            }},
            "education": [
                {{
                    "degree": "string",
                    "institution": "string", 
                    "graduation_year": number,
                    "gpa": number
                }}
            ],
            "skills": [
                {{
                    "skill_name": "string",
                    "skill_category": "technical|soft|language|other",
                    "proficiency_level": "beginner|intermediate|advanced|expert"
                }}
            ]
        }}

        Resume text to parse:
        {resume_text}
        """

        # Generate content using Gemini
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        
        # Extract and clean the response
        response_text = response.text.strip()
        # print(f"Raw response from AI: {response_text}")
        
        # Remove markdown code blocks if present
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.startswith('```'):
            response_text = response_text[3:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        
        response_text = response_text.strip()
        
        # Parse JSON response
        try:
            parsed_data = json.loads(response_text)
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Raw response: {response_text}")
            return {
                'error': f'Invalid JSON response from AI: {str(e)}',
                'candidate': None,
                'education': [],
                'skills': []
            }
        
        # Validate and clean the extracted data
        
        
        return parsed_data
        
    except Exception as e:
        print(f"Error in LLMParser: {str(e)}")
        return {
            'error': f'Error processing resume: {str(e)}',
            'candidate': None,
            'education': [],
            'skills': []
        }

