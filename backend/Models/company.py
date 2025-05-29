from database import db
from datetime import datetime
from sqlalchemy.sql import func

class Company(db.Model):
    """Company model for storing job posting details"""
    __tablename__ = "companies"
    
    job_id = db.Column(db.Integer, primary_key=True)
    company_email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    company_name = db.Column(db.String(255), nullable=False)
    job_role = db.Column(db.String(255), nullable=True)
    job_type = db.Column(db.String(100), nullable=True)
    stipend = db.Column(db.String(100), nullable=True)
    location = db.Column(db.String(255), nullable=True)
    skills_required = db.Column(db.Text, nullable=True)
    education_qualification = db.Column(db.Text, nullable=True)
    description = db.Column(db.Text, nullable=True)
    posted_date = db.Column(db.Date, default=datetime.utcnow().date())
    application_deadline = db.Column(db.Date, nullable=True)
    profile_completed = db.Column(db.Boolean, default=False)
    
    def __repr__(self):
        return f"<Job '{self.job_role}' at '{self.company_name}'>"