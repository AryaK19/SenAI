from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
import os
import zipfile
from werkzeug.utils import secure_filename
import uuid
import bcrypt
from datetime import datetime
from ResumeParser.main import resumeParser
from Models.candidate import Candidate, AppliedCandidate


def register_company_routes(app):
    from database import db
    from Models.company import Company
    @app.route('/api/company/profile', methods=['GET'])
    @jwt_required()
    def get_company_profile():
        """Get company profile"""
        user_id = int(get_jwt_identity())
        claims = get_jwt()
        
        # Verify user is a company
        if claims.get('type') != 'company':
            return jsonify({'message': 'Unauthorized access'}), 403
        
        company = Company.query.get(user_id)
        if not company:
            return jsonify({'message': 'Company not found'}), 404
        
        return jsonify({
            'id': company.job_id,
            'email': company.company_email,
            'companyName': company.company_name,
            'job_role': company.job_role,
            'job_type': company.job_type,
            'stipend': company.stipend,
            'location': company.location,
            'skills_required': company.skills_required,
            'education_qualification': company.education_qualification,
            'description': company.description,
            'posted_date': company.posted_date.isoformat() if company.posted_date else None,
            'application_deadline': company.application_deadline.isoformat() if company.application_deadline else None,
            'profile_completed': company.profile_completed
        }), 200

    @app.route('/api/company/profile', methods=['PUT'])
    @jwt_required()
    def update_company_profile():
        """Update company profile"""
        user_id = int(get_jwt_identity())
        claims = get_jwt()
        
        # Verify user is a company
        if claims.get('type') != 'company':
            return jsonify({'message': 'Unauthorized access'}), 403
        
        company = Company.query.get(user_id)
        if not company:
            return jsonify({'message': 'Company not found'}), 404
        
        data = request.get_json()
        
        # Update fields if provided
        if 'companyName' in data:
            company.company_name = data['companyName']
        if 'job_role' in data:
            company.job_role = data['job_role']
        if 'job_type' in data:
            company.job_type = data['job_type']
        if 'stipend' in data:
            company.stipend = data['stipend']
        if 'location' in data:
            company.location = data['location']
        if 'skills_required' in data:
            company.skills_required = data['skills_required']
        if 'education_qualification' in data:
            company.education_qualification = data['education_qualification']
        if 'description' in data:
            company.description = data['description']
        if 'application_deadline' in data:
            company.application_deadline = data['application_deadline']
        
        # Check if required fields are filled to mark profile as complete
        required_fields = [
            company.company_name,
            company.job_role,
            company.job_type,
            company.stipend,
            company.location,
            company.skills_required,
            company.description
        ]
        
        company.profile_completed = all(required_fields)
        
        # Save changes
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'company': {
                'id': company.job_id,
                'email': company.company_email,
                'companyName': company.company_name,
                'job_role': company.job_role,
                'job_type': company.job_type,
                'stipend': company.stipend,
                'location': company.location,
                'skills_required': company.skills_required,
                'education_qualification': company.education_qualification,
                'description': company.description,
                'posted_date': company.posted_date.isoformat() if company.posted_date else None,
                'application_deadline': company.application_deadline.isoformat() if company.application_deadline else None,
                'profile_completed': company.profile_completed
            }
        }), 200
    
    @app.route('/api/company/bulkUpload', methods=['POST'])
    @jwt_required()
    def bulk_upload_resumes():
        """Bulk upload resumes for a job posting"""
        try:
            user_id = int(get_jwt_identity())
            claims = get_jwt()
            
            # Verify user is a company
            if claims.get('type') != 'company':
                return jsonify({'message': 'Unauthorized access'}), 403
            
            company = Company.query.get(user_id)
            if not company:
                return jsonify({'message': 'Company not found'}), 404
            
            # Check if 'resumes' is in the request files
            if 'resumes' not in request.files:
                return jsonify({'message': 'No file provided'}), 400
            
            zip_file = request.files['resumes']
            if zip_file.filename == '':
                return jsonify({'message': 'No file selected'}), 400
                
            # Ensure it's a zip file
            if not zip_file.filename.endswith('.zip'):
                return jsonify({'message': 'Only ZIP files are supported for bulk upload'}), 400
            
            # Create temporary directory for extraction
            temp_dir = os.path.join(os.getcwd(), 'Uploads', 'temp', f'bulk_{uuid.uuid4().hex}')
            os.makedirs(temp_dir, exist_ok=True)
            
            # Save the uploaded zip file
            zip_path = os.path.join(temp_dir, secure_filename(zip_file.filename))
            zip_file.save(zip_path)
            
            # Extract the zip file
            extract_dir = os.path.join(temp_dir, 'extracted')
            os.makedirs(extract_dir, exist_ok=True)
            
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)
            
            # Process each file in the extracted directory
            uploaded_count = 0
            errors = []
            candidates_created = []
            candidates_applied = []
            
            for root, _, files in os.walk(extract_dir):
                for filename in files:
                    file_path = os.path.join(root, filename)
                    file_ext = os.path.splitext(filename)[1].lower()
                    
                    # Check if it's a supported file type
                    if file_ext in ['.pdf', '.doc', '.docx', '.txt']:
                        try:
                            # Move file to permanent storage
                            upload_dir = os.path.join(os.getcwd(), 'Uploads', 'resumes')
                            os.makedirs(upload_dir, exist_ok=True)
                            
                            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
                            new_filename = f"bulk_{timestamp}_{secure_filename(filename)}"
                            new_file_path = os.path.join(upload_dir, new_filename)
                            
                            # Copy file to new location
                            with open(file_path, 'rb') as src, open(new_file_path, 'wb') as dst:
                                dst.write(src.read())
                                
                            relative_path = f"/Uploads/resumes/{new_filename}"
                            
                            # Parse resume
                            parsed_data = resumeParser(new_file_path)
                            
                            if parsed_data.get('error'):
                                errors.append({
                                    'filename': filename,
                                    'error': parsed_data['error']
                                })
                                continue
                            
                            # Get candidate email from parsed data
                            candidate_email = parsed_data.get('candidate', {}).get('email')
                            
                            if not candidate_email:
                                errors.append({
                                    'filename': filename,
                                    'error': 'No email found in resume'
                                })
                                continue
                            
                            # Check if candidate already exists
                            existing_candidate = Candidate.query.filter_by(email=candidate_email).first()
                            
                            if existing_candidate:
                                candidate = existing_candidate
                            else:
                                # Create new candidate with default password
                                hashed_password = bcrypt.hashpw("12345678".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                                
                                candidate = Candidate(
                                    email=candidate_email,
                                    fullname=parsed_data.get('candidate', {}).get('fullname') or 'New Candidate',
                                    phone=parsed_data.get('candidate', {}).get('phone'),
                                    location=parsed_data.get('candidate', {}).get('location'),
                                    years_experience=parsed_data.get('candidate', {}).get('years_experience'),
                                    resume_file_path=relative_path,
                                    password=hashed_password
                                )
                                
                                db.session.add(candidate)
                                db.session.flush()  # Get the candidate_id before committing
                                candidates_created.append({
                                    'email': candidate_email,
                                    'name': candidate.fullname
                                })
                            
                            # Check if candidate has already applied to this job
                            existing_application = AppliedCandidate.query.filter_by(
                                candidate_id=candidate.candidate_id,
                                job_id=company.job_id
                            ).first()
                            
                            if not existing_application:
                                # Create application entry
                                application = AppliedCandidate(
                                    candidate_id=candidate.candidate_id,
                                    job_id=company.job_id
                                )
                                db.session.add(application)
                                candidates_applied.append({
                                    'email': candidate_email,
                                    'name': candidate.fullname
                                })
                            
                            # Update candidate profile with parsed data
                            from CandidateRoutes.utils import update_candidate_from_parsed_data
                            update_candidate_from_parsed_data(candidate.candidate_id, parsed_data)
                            
                            uploaded_count += 1
                            
                        except Exception as e:
                            errors.append({
                                'filename': filename,
                                'error': str(e)
                            })
            
            # Commit all database changes
            db.session.commit()
            
            # Clean up temporary directory
            import shutil
            shutil.rmtree(temp_dir, ignore_errors=True)
            
            return jsonify({
                'message': 'Bulk upload processed successfully',
                'total_files': uploaded_count,
                'candidates_created': candidates_created,
                'candidates_applied': candidates_applied,
                'errors': errors
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f'Error processing bulk upload: {str(e)}'}), 500

    @app.route('/api/company/dashboard/stats', methods=['GET'])
    @jwt_required()
    def get_company_dashboard_stats():
        """Get company dashboard statistics"""
        user_id = int(get_jwt_identity())
        claims = get_jwt()
        
        # Verify user is a company
        if claims.get('type') != 'company':
            return jsonify({'message': 'Unauthorized access'}), 403
        
        company = Company.query.get(user_id)
        if not company:
            return jsonify({'message': 'Company not found'}), 404
        
        # Count total applications, shortlisted, and pending for this company
        total_applications = AppliedCandidate.query.filter_by(job_id=user_id).count()
        shortlisted = AppliedCandidate.query.filter_by(job_id=user_id, shortlisted=True).count()
        pending = total_applications - shortlisted
        
        return jsonify({
            'totalResumes': total_applications,
            'shortlisted': shortlisted,
            'pending': pending
        }), 200

    @app.route('/api/company/candidates', methods=['GET'])
    @jwt_required()
    def get_applied_candidates():
        """Get candidates who applied to the company's job"""
        user_id = int(get_jwt_identity())
        claims = get_jwt()
        
        # Verify user is a company
        if claims.get('type') != 'company':
            return jsonify({'message': 'Unauthorized access'}), 403
        
        company = Company.query.get(user_id)
        if not company:
            return jsonify({'message': 'Company not found'}), 404
        
        # Query all applications for this job
        applications = AppliedCandidate.query.filter_by(job_id=user_id).all()
        
        candidates_list = []
        for application in applications:
            candidate = Candidate.query.get(application.candidate_id)
            if candidate:
                # Get candidate's education and skills
                education = []
                if candidate.education:
                    for edu in candidate.education:
                        education.append({
                            'degree': edu.degree,
                            'institution': edu.institution,
                            'graduation_year': edu.graduation_year,
                            'gpa': float(edu.gpa) if edu.gpa else None
                        })
                
                skills = []
                if candidate.skills:
                    for skill in candidate.skills:
                        skills.append({
                            'skill_name': skill.skill_name,
                            'category': skill.skill_category.value if skill.skill_category else None,
                            'proficiency': skill.proficiency_level.value if skill.proficiency_level else None
                        })
                
                candidates_list.append({
                    'id': candidate.candidate_id,
                    'fullname': candidate.fullname,
                    'email': candidate.email,
                    'phone': candidate.phone,
                    'location': candidate.location,
                    'years_experience': candidate.years_experience,
                    'resume_path': candidate.resume_file_path,
                    'status': candidate.status,
                    'shortlisted': application.shortlisted,
                    'applied_date': application.applied_at.strftime('%Y-%m-%d %H:%M:%S'),
                    'education': education,
                    'skills': skills
                })
        
        return jsonify(candidates_list), 200

    @app.route('/api/company/candidates/<int:candidate_id>/shortlist', methods=['PUT'])
    @jwt_required()
    def update_candidate_shortlist_status(candidate_id):
        """Update candidate's shortlist status"""
        user_id = int(get_jwt_identity())
        claims = get_jwt()
        
        # Verify user is a company
        if claims.get('type') != 'company':
            return jsonify({'message': 'Unauthorized access'}), 403
        
        data = request.get_json()
        shortlisted = data.get('shortlisted')
        
        if shortlisted is None:
            return jsonify({'message': 'Shortlist status is required'}), 400
        
        # Find the application
        application = AppliedCandidate.query.filter_by(
            job_id=user_id,
            candidate_id=candidate_id
        ).first()
        
        if not application:
            return jsonify({'message': 'Application not found'}), 404
        
        # Update shortlist status
        application.shortlisted = shortlisted
        
        # If shortlisted, update candidate status as well
        candidate = Candidate.query.get(candidate_id)
        if candidate:
            candidate.status = 'shortlisted' if shortlisted else 'pending'
        
        db.session.commit()
        
        return jsonify({
            'message': f'Candidate {"shortlisted" if shortlisted else "removed from shortlist"} successfully',
            'shortlisted': application.shortlisted
        }), 200