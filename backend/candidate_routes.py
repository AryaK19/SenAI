from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity


def register_candidate_routes(app):
    from database import db
    from models import Candidate
    
    @app.route('/api/candidate/profile', methods=['GET'])
    @jwt_required()
    def get_candidate_profile():
        """Get candidate profile"""
        current_user = get_jwt_identity()
        
        # Verify user is a candidate
        if current_user.get('type') != 'candidate':
            return jsonify({'message': 'Unauthorized access'}), 403
        
        # Use candidate_id instead of id
        candidate = Candidate.query.filter_by(candidate_id=current_user['id']).first()
        if not candidate:
            return jsonify({'message': 'Candidate not found'}), 404
        
        return jsonify({
            'id': candidate.candidate_id,  # Use candidate_id
            'email': candidate.email,
            'fullName': candidate.fullname,  # Match model field name
            'phone': candidate.phone,
            'location': candidate.location,
            'years_experience': candidate.years_experience
        }), 200

    @app.route('/api/candidate/profile', methods=['PUT'])
    @jwt_required()
    def update_candidate_profile():
        """Update candidate profile"""
        current_user = get_jwt_identity()
        
        # Verify user is a candidate
        if current_user.get('type') != 'candidate':
            return jsonify({'message': 'Unauthorized access'}), 403
        
        # Use candidate_id instead of id
        candidate = Candidate.query.filter_by(candidate_id=current_user['id']).first()
        if not candidate:
            return jsonify({'message': 'Candidate not found'}), 404
        
        data = request.get_json()
        
        # Update fields if provided
        if 'fullName' in data:
            candidate.fullname = data['fullName']  # Match model field name
        if 'phone' in data:
            candidate.phone = data['phone']
        if 'location' in data:
            candidate.location = data['location']
        if 'years_experience' in data:
            candidate.years_experience = data['years_experience']
        
        # Save changes
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'candidate': {
                'id': candidate.candidate_id,  # Use candidate_id
                'email': candidate.email,
                'fullName': candidate.fullname,  # Match model field name
                'phone': candidate.phone,
                'location': candidate.location,
                'years_experience': candidate.years_experience
            }
        }), 200