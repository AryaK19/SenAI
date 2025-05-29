from flask import Flask
from flask_cors import CORS
from datetime import timedelta
import os
from dotenv import load_dotenv
from database import db, migrate, jwt, bcrypt

# Load environment variables
load_dotenv()

def create_app():
    # Initialize Flask application
    app = Flask(__name__)

    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
    # Add this configuration
    app.config['JWT_IDENTITY_CLAIM'] = 'sub'

    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)



    # Import routes
    from auth import register_auth_routes
    from CompanyRoutes.company_routes import register_company_routes
    from CandidateRoutes.candidate_routes import register_candidate_routes

    # Register routes
    register_auth_routes(app)
    register_company_routes(app)
    register_candidate_routes(app)

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)