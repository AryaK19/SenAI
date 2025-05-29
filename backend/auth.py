from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import json


def register_auth_routes(app):
    from database import db, bcrypt
    from Models.company import Company
    from Models.candidate import Candidate
    
    @app.route('/api/register/company', methods=['POST'])
    def register_company():
        data = request.get_json()
        
        # Validate required fields
        if not all(key in data for key in ['email', 'companyName', 'password']):
            return jsonify({'message': 'Missing required fields'}), 400
        
        # Check if email already exists
        if Company.query.filter_by(company_email=data['email']).first():
            return jsonify({'message': 'Email already registered'}), 409
        
        # Create new company
        new_company = Company(
            company_email=data['email'],
            company_name=data['companyName'],
            password=bcrypt.generate_password_hash(data['password']).decode('utf-8')
        )
        
        db.session.add(new_company)
        db.session.commit()
        
        return jsonify({'message': 'Company registered successfully'}), 201

    @app.route('/api/register/candidate', methods=['POST'])
    def register_candidate():
        data = request.get_json()
        
        # Validate required fields
        if not all(key in data for key in ['email', 'fullName', 'password']):
            return jsonify({'message': 'Missing required fields'}), 400
        
        # Check if email already exists
        if Candidate.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already registered'}), 409
        
        # Create new candidate
        new_candidate = Candidate(
            email=data['email'],
            fullname=data['fullName'],  # Changed from full_name to fullname
            phone=data.get('phone', ''),
            password=bcrypt.generate_password_hash(data['password']).decode('utf-8')
        )
        
        db.session.add(new_candidate)
        db.session.commit()
        
        return jsonify({'message': 'Candidate registered successfully'}), 201

    @app.route('/api/login/company', methods=['POST'])
    def login_company():
        data = request.get_json()
        
        # Find company by email
        company = Company.query.filter_by(company_email=data.get('email', '')).first()
        
        # Check if company exists and password is correct
        if not company or not bcrypt.check_password_hash(company.password, data.get('password', '')):
            return jsonify({'message': 'Invalid email or password'}), 401
        
        # Generate access token with string subject
        access_token = create_access_token(
            identity=str(company.job_id),
            additional_claims={'email': company.company_email, 'type': 'company'}
        )
        
        return jsonify({
            'access_token': access_token,
            'company': {
                'id': company.job_id,
                'email': company.company_email,
                'companyName': company.company_name
            }
        }), 200

    @app.route('/api/login/candidate', methods=['POST'])
    def login_candidate():
        data = request.get_json()
        
        # Find candidate by email
        candidate = Candidate.query.filter_by(email=data.get('email', '')).first()
        
        # Check if candidate exists and password is correct
        if not candidate or not bcrypt.check_password_hash(candidate.password, data.get('password', '')):
            return jsonify({'message': 'Invalid email or password'}), 401
        
        # Generate access token with string subject
        access_token = create_access_token(
            identity=str(candidate.candidate_id),
            additional_claims={'email': candidate.email, 'type': 'candidate'}
        )
        
        return jsonify({
            'access_token': access_token,
            'candidate': {
                'id': candidate.candidate_id,
                'email': candidate.email,
                'fullName': candidate.fullname,
                'phone': candidate.phone
            }
        }), 200

    @app.route('/api/me', methods=['GET'])
    @jwt_required()
    def get_current_user():
        from flask_jwt_extended import get_jwt_claims, get_jwt
        
        # Get the identity (user ID) and claims (additional data)
        user_id = int(get_jwt_identity())
        claims = get_jwt()
        user_type = claims.get('type')
        
        if user_type == 'company':
            company = Company.query.get(user_id)
            if not company:
                return jsonify({'message': 'Company not found'}), 404
            
            return jsonify({
                'id': company.job_id,
                'email': company.email,
                'companyName': company.company_name,
                'type': 'company'
            })
        else:
            candidate = Candidate.query.filter_by(candidate_id=user_id).first()
            if not candidate:
                return jsonify({'message': 'Candidate not found'}), 404
            
            return jsonify({
                'id': candidate.candidate_id,
                'email': candidate.email,
                'fullName': candidate.fullname,
                'phone': candidate.phone,
                'type': 'candidate'
            })

    @app.route('/api/forgot-password', methods=['POST'])
    def forgot_password():
        # This would typically send an email with a reset token
        # For this example, we'll just return a success message
        return jsonify({'message': 'Password reset link sent to your email'}), 200