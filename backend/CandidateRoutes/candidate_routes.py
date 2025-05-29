from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
import os
from werkzeug.utils import secure_filename
from ResumeParser.main import resumeParser
from CandidateRoutes.utils import update_candidate_from_parsed_data


def register_candidate_routes(app):
    from database import db
    from Models.candidate import Candidate, Education, Skills, SkillCategory, ProficiencyLevel
    
    
    @app.route('/api/candidate/profile', methods=['GET'])
    @jwt_required()
    def get_candidate_profile():
        """Get candidate profile with education and skills"""
        # Get user_id as string and convert to int for database query

        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        claims = get_jwt()
        
        # Verify user is a candidate
        if claims.get('type') != 'candidate':
            return jsonify({'message': 'Unauthorized access'}), 403
        
        candidate = Candidate.query.filter_by(candidate_id=user_id).first()
        if not candidate:
            return jsonify({'message': 'Candidate not found'}), 404
        
        # Get education records
        education_list = []
        for edu in candidate.education:
            education_list.append({
                'education_id': edu.education_id,
                'degree': edu.degree,
                'institution': edu.institution,
                'graduation_year': edu.graduation_year,
                'gpa': float(edu.gpa) if edu.gpa else None
            })
        
        # Get skills records
        skills_list = []
        for skill in candidate.skills:
            skills_list.append({
                'skill_id': skill.skill_id,
                'skill_name': skill.skill_name,
                'skill_category': skill.skill_category.value if skill.skill_category else None,
                'proficiency_level': skill.proficiency_level.value if skill.proficiency_level else None
            })
        
        return jsonify({
            'id': candidate.candidate_id,
            'email': candidate.email,
            'fullName': candidate.fullname,
            'phone': candidate.phone,
            'location': candidate.location,
            'years_experience': candidate.years_experience,
            'resume_file_path': candidate.resume_file_path,
            'status': candidate.status,
            'created_at': candidate.created_at.isoformat() if candidate.created_at else None,
            'updated_at': candidate.updated_at.isoformat() if candidate.updated_at else None,
            'education': education_list,
            'skills': skills_list
        }), 200

    @app.route('/api/candidate/profile', methods=['PUT'])
    @jwt_required()
    def update_candidate_profile():
        """Update candidate profile"""
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        claims = get_jwt()
        
        # Verify user is a candidate
        if claims.get('type') != 'candidate':
            return jsonify({'message': 'Unauthorized access'}), 403
        
        candidate = Candidate.query.filter_by(candidate_id=user_id).first()
        if not candidate:
            return jsonify({'message': 'Candidate not found'}), 404
        
        data = request.get_json()
        
        # Update basic fields if provided
        if 'fullName' in data:
            candidate.fullname = data['fullName']
        if 'phone' in data:
            candidate.phone = data['phone']
        if 'location' in data:
            candidate.location = data['location']
        if 'years_experience' in data:
            candidate.years_experience = data['years_experience']
        if 'resume_file_path' in data:
            candidate.resume_file_path = data['resume_file_path']
        
        # Save changes
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'candidate': {
                'id': candidate.candidate_id,
                'email': candidate.email,
                'fullName': candidate.fullname,
                'phone': candidate.phone,
                'location': candidate.location,
                'years_experience': candidate.years_experience,
                'resume_file_path': candidate.resume_file_path
            }
        }), 200

    @app.route('/api/candidate/education', methods=['POST'])
    @jwt_required()
    def add_education():
        """Add education record for candidate"""
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        claims = get_jwt()
        
        if claims.get('type') != 'candidate':
            return jsonify({'message': 'Unauthorized access'}), 403
        
        data = request.get_json()
        
        new_education = Education(
            candidate_id=user_id,
            degree=data.get('degree'),
            institution=data.get('institution'),
            graduation_year=data.get('graduation_year'),
            gpa=data.get('gpa')
        )
        
        db.session.add(new_education)
        db.session.commit()
        
        return jsonify({
            'message': 'Education added successfully',
            'education': {
                'education_id': new_education.education_id,
                'degree': new_education.degree,
                'institution': new_education.institution,
                'graduation_year': new_education.graduation_year,
                'gpa': float(new_education.gpa) if new_education.gpa else None
            }
        }), 201

    @app.route('/api/candidate/education/<int:education_id>', methods=['PUT'])
    @jwt_required()
    def update_education(education_id):
        """Update education record"""
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        claims = get_jwt()
        
        if claims.get('type') != 'candidate':
            return jsonify({'message': 'Unauthorized access'}), 403
        
        education = Education.query.filter_by(
            education_id=education_id, 
            candidate_id=user_id
        ).first()
        
        if not education:
            return jsonify({'message': 'Education record not found'}), 404
        
        data = request.get_json()
        
        if 'degree' in data:
            education.degree = data['degree']
        if 'institution' in data:
            education.institution = data['institution']
        if 'graduation_year' in data:
            education.graduation_year = data['graduation_year']
        if 'gpa' in data:
            education.gpa = data['gpa']
        
        db.session.commit()
        
        return jsonify({'message': 'Education updated successfully'}), 200

    @app.route('/api/candidate/education/<int:education_id>', methods=['DELETE'])
    @jwt_required()
    def delete_education(education_id):
        """Delete education record"""
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        claims = get_jwt()
        
        if claims.get('type') != 'candidate':
            return jsonify({'message': 'Unauthorized access'}), 403
        
        education = Education.query.filter_by(
            education_id=education_id, 
            candidate_id=user_id
        ).first()
        
        if not education:
            return jsonify({'message': 'Education record not found'}), 404
        
        db.session.delete(education)
        db.session.commit()
        
        return jsonify({'message': 'Education deleted successfully'}), 200

    @app.route('/api/candidate/skills', methods=['POST'])
    @jwt_required()
    def add_skill():
        """Add skill for candidate"""
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        claims = get_jwt()
        
        if claims.get('type') != 'candidate':
            return jsonify({'message': 'Unauthorized access'}), 403
        
        data = request.get_json()
        
        # Validate enum values
        skill_category = None
        if data.get('skill_category'):
            try:
                skill_category = SkillCategory(data['skill_category'])
            except ValueError:
                return jsonify({'message': 'Invalid skill category'}), 400
        
        proficiency_level = None
        if data.get('proficiency_level'):
            try:
                proficiency_level = ProficiencyLevel(data['proficiency_level'])
            except ValueError:
                return jsonify({'message': 'Invalid proficiency level'}), 400
        
        new_skill = Skills(
            candidate_id=user_id,
            skill_name=data.get('skill_name'),
            skill_category=skill_category,
            proficiency_level=proficiency_level
        )
        
        db.session.add(new_skill)
        db.session.commit()
        
        return jsonify({
            'message': 'Skill added successfully',
            'skill': {
                'skill_id': new_skill.skill_id,
                'skill_name': new_skill.skill_name,
                'skill_category': new_skill.skill_category.value if new_skill.skill_category else None,
                'proficiency_level': new_skill.proficiency_level.value if new_skill.proficiency_level else None
            }
        }), 201

    @app.route('/api/candidate/skills/<int:skill_id>', methods=['PUT'])
    @jwt_required()
    def update_skill(skill_id):
        """Update skill record"""
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        claims = get_jwt()
        
        if claims.get('type') != 'candidate':
            return jsonify({'message': 'Unauthorized access'}), 403
        
        skill = Skills.query.filter_by(
            skill_id=skill_id, 
            candidate_id=user_id
        ).first()
        
        if not skill:
            return jsonify({'message': 'Skill not found'}), 404
        
        data = request.get_json()
        
        if 'skill_name' in data:
            skill.skill_name = data['skill_name']
        
        if 'skill_category' in data:
            try:
                skill.skill_category = SkillCategory(data['skill_category'])
            except ValueError:
                return jsonify({'message': 'Invalid skill category'}), 400
        
        if 'proficiency_level' in data:
            try:
                skill.proficiency_level = ProficiencyLevel(data['proficiency_level'])
            except ValueError:
                return jsonify({'message': 'Invalid proficiency level'}), 400
        
        db.session.commit()
        
        return jsonify({'message': 'Skill updated successfully'}), 200

    @app.route('/api/candidate/skills/<int:skill_id>', methods=['DELETE'])
    @jwt_required()
    def delete_skill(skill_id):
        """Delete skill record"""
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        claims = get_jwt()
        
        if claims.get('type') != 'candidate':
            return jsonify({'message': 'Unauthorized access'}), 403
        
        skill = Skills.query.filter_by(
            skill_id=skill_id, 
            candidate_id=user_id
        ).first()
        
        if not skill:
            return jsonify({'message': 'Skill not found'}), 404
        
        db.session.delete(skill)
        db.session.commit()
        
        return jsonify({'message': 'Skill deleted successfully'}), 200

    @app.route('/api/candidate/resume', methods=['POST'])
    @jwt_required()
    def upload_resume():
        """Upload resume file for candidate"""
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        claims = get_jwt()
        
        if claims.get('type') != 'candidate':
            return jsonify({'message': 'Unauthorized access'}), 403
        
        if 'resume' not in request.files:
            return jsonify({'message': 'No file provided'}), 400
        
        file = request.files['resume']
        if file.filename == '':
            return jsonify({'message': 'No file selected'}), 400
        
        upload_dir = os.path.join(os.getcwd(), 'Uploads', 'resumes')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Create secure filename
        secure_name = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        filename = f"{user_id}_{timestamp}_{secure_name}"
        
        # Full file path
        file_path = os.path.join(upload_dir, filename)
        relative_path = f"/Uploads/resumes/{filename}"
        
        try:
            # Save the file to filesystem
            file.save(file_path)
            parsed_data = resumeParser(file_path)
            
            # Check if parsing was successful
            if parsed_data.get('error'):
                return jsonify({
                    'message': 'Resume uploaded but parsing failed',
                    'file_path': relative_path,
                    'filename': filename,
                    'error': parsed_data['error']
                }), 200
            
            # Update candidate's resume path in database
            candidate = Candidate.query.filter_by(candidate_id=user_id).first()
            if candidate:
                # Delete old resume file if exists
                if candidate.resume_file_path:
                    old_file_path = os.path.join(os.getcwd(), candidate.resume_file_path.lstrip('/'))
                    if os.path.exists(old_file_path):
                        os.remove(old_file_path)
                
                candidate.resume_file_path = relative_path
                db.session.commit()
            
            # Update candidate data from parsed resume
            print(f"Parsed Data: {parsed_data}")
            update_result = update_candidate_from_parsed_data(user_id, parsed_data)
            
            response_data = {
                'message': 'Resume uploaded successfully',
                'file_path': relative_path,
                'filename': filename,
                'parsed_data': parsed_data
            }
            
            if update_result['success']:
                response_data['database_update'] = 'success'
                response_data['update_message'] = update_result['message']
            else:
                response_data['database_update'] = 'failed'
                response_data['update_error'] = update_result['message']
            
            return jsonify(response_data), 200
            
        except Exception as e:
            return jsonify({'message': f'Error saving file: {str(e)}'}), 500