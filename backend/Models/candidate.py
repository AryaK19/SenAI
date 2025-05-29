from database import db
from datetime import datetime
from sqlalchemy.sql import func
import enum

# Define enums for PostgreSQL ENUM types
class SkillCategory(enum.Enum):
    technical = 'technical'
    soft = 'soft'
    language = 'language'
    other = 'other'

class ProficiencyLevel(enum.Enum):
    beginner = 'beginner'
    intermediate = 'intermediate'
    advanced = 'advanced'
    expert = 'expert'



class Candidate(db.Model):
    """Candidate model for storing candidate related details"""
    __tablename__ = "candidates"
    
    candidate_id = db.Column(db.Integer, primary_key=True)
    fullname = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    location = db.Column(db.String(255), nullable=True)
    years_experience = db.Column(db.Integer, nullable=True)
    resume_file_path = db.Column(db.String(512), nullable=True)
    status = db.Column(db.String(20), nullable=True, 
                      default='pending',
                      info={'check_constraint': "status IN ('pending', 'shortlisted', 'rejected')"})
    created_at = db.Column(db.DateTime, server_default=func.now())
    updated_at = db.Column(db.DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    education = db.relationship('Education', backref='candidate', lazy=True, cascade='all, delete-orphan')
    skills = db.relationship('Skills', backref='candidate', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f"<Candidate '{self.fullname}'>"

class Education(db.Model):
    """Education model for storing candidate education details"""
    __tablename__ = "education"
    
    education_id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidates.candidate_id', ondelete='CASCADE'), nullable=False)
    degree = db.Column(db.String(255), nullable=True)
    institution = db.Column(db.String(255), nullable=True)
    graduation_year = db.Column(db.Integer, nullable=True)
    gpa = db.Column(db.Numeric(3, 2), nullable=True)

    def __repr__(self):
        return f"<Education '{self.degree}' at '{self.institution}'>"

class Skills(db.Model):
    """Skills model for storing candidate skills"""
    __tablename__ = "skills"
    
    skill_id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidates.candidate_id', ondelete='CASCADE'), nullable=False)
    skill_name = db.Column(db.String(255), nullable=True)
    skill_category = db.Column(db.Enum(SkillCategory), nullable=True)
    proficiency_level = db.Column(db.Enum(ProficiencyLevel), nullable=True)

    def __repr__(self):
        return f"<Skill '{self.skill_name}' - {self.proficiency_level}>"
    
class AppliedCandidate(db.Model):
    """Model for tracking job applications by candidates"""
    __tablename__ = "appliedcandidates"
    
    application_id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidates.candidate_id', ondelete='CASCADE'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('companies.job_id', ondelete='CASCADE'), nullable=False)
    applied_at = db.Column(db.DateTime, server_default=func.now())
    shortlisted = db.Column(db.Boolean, default=False)
    
    # Define relationships
    candidate = db.relationship('Candidate', backref=db.backref('applications', lazy=True))
    job = db.relationship('Company', backref=db.backref('applicants', lazy=True))
    
    # Add unique constraint
    __table_args__ = (
        db.UniqueConstraint('candidate_id', 'job_id', name='uq_candidate_job'),
    )
    
    def __repr__(self):
        return f"<Application {self.application_id}: Candidate {self.candidate_id} for Job {self.job_id}>"
