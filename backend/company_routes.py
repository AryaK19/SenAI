from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity


def register_company_routes(app):
    from database import db
    from models import Company
    @app.route('/api/company/profile', methods=['GET'])
    @jwt_required()
    def get_company_profile():
        """Get company profile"""
        current_user = get_jwt_identity()
        
        # Verify user is a company
        if current_user.get('type') != 'company':
            return jsonify({'message': 'Unauthorized access'}), 403
        
        company = Company.query.get(current_user['id'])
        if not company:
            return jsonify({'message': 'Company not found'}), 404
        
        return jsonify({
            'id': company.id,
            'email': company.email,
            'companyName': company.company_name
        }), 200

    @app.route('/api/company/profile', methods=['PUT'])
    @jwt_required()
    def update_company_profile():
        """Update company profile"""
        current_user = get_jwt_identity()
        
        # Verify user is a company
        if current_user.get('type') != 'company':
            return jsonify({'message': 'Unauthorized access'}), 403
        
        company = Company.query.get(current_user['id'])
        if not company:
            return jsonify({'message': 'Company not found'}), 404
        
        data = request.get_json()
        
        # Update fields if provided
        if 'companyName' in data:
            company.company_name = data['companyName']
        
        # Save changes
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'company': {
                'id': company.id,
                'email': company.email,
                'companyName': company.company_name
            }
        }), 200