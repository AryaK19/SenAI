# SenAI - AI-Powered Resume Screening & Candidate Management

## Frontend Overview

SenAI is a comprehensive AI-powered platform designed to streamline the resume screening and candidate management process. The frontend is built with modern web technologies to provide a seamless and intuitive user experience.

### Tech Stack

- **React**: A JavaScript library for building user interfaces
- **Vite**: Next-generation frontend build tool
- **Ant Design**: UI component library for elegant and professional interfaces
- **React Router DOM**: For declarative routing
- **Axios**: Promise-based HTTP client for API requests
- **Moment.js**: For date manipulation and formatting

### Project Structure

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── AIShortlistModal/
│   │   ├── CandidateCard/
│   │   ├── NavBar/
│   │   └── ResumeUpload/
│   ├── layouts/            # Layout components
│   │   └── MainLayout.jsx
│   ├── modules/            # Page modules
│   │   ├── Dashboard/      # Dashboard pages
│   │   ├── Login/          # Authentication pages
│   │   ├── Profile/        # User profile pages
│   │   └── ResumeUpload/   # Resume upload pages
│   ├── services/           # API service functions
│   │   ├── authService.js
│   │   ├── companyService.js
│   │   └── profileService.js
│   ├── App.jsx             # Main application component
│   ├── App.css             # Global styles
│   ├── main.jsx            # Application entry point
│   └── index.css           # Base styles
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
└── package.json            # Dependencies and scripts
```

## Key Features

### 1. Authentication System

The application implements a complete authentication system with login functionality:

- JWT-based authentication
- Role-based access control (Candidate/Company)
- Token storage in localStorage for persistent sessions
- Secure API requests with authentication headers

### 2. Company Dashboard

The company dashboard provides a comprehensive overview for employers:

- Key statistics (total resumes, shortlisted candidates, pending reviews)
- Candidate management with filtering and sorting
- Interactive UI for reviewing candidate profiles
- Ability to shortlist/reject candidates
- Advanced search functionality

### 3. AI-Powered Shortlisting

A standout feature that leverages AI for resume analysis:

- Automated candidate ranking based on job requirements
- Skill matching with percentage scores
- Experience evaluation
- Education qualification assessment
- Interactive UI for reviewing AI recommendations

### 4. Resume Upload System

Multiple options for resume submission:

- **Individual Upload**: For candidates to upload their own resumes
- **Bulk Upload**: For companies to upload multiple resumes at once
- Supports various file formats (PDF, DOC, DOCX, TXT)
- Automatic parsing and data extraction

### 5. Profile Management

Comprehensive profile management for both user types:

- **Candidate Profiles**: 
  - Personal information
  - Education history
  - Skills with proficiency levels
  - Experience details
  - Resume management

- **Company Profiles**:
  - Company information
  - Job details (role, type, location)
  - Required qualifications
  - Compensation information
  - Application deadlines

### 6. Responsive Design

The application is fully responsive, providing optimal user experience across different devices:

- Desktop/laptop displays
- Tablets
- Mobile devices

## Component Documentation

### Core Components

#### CandidateCard
Displays comprehensive candidate information including skills, education, and experience. Allows companies to shortlist candidates.

#### NavBar
Navigation component with dynamic menu options based on user role. Handles authentication state and provides navigation links.

#### ResumeUpload
Handles file selection, validation, and uploading to the server. Displays upload progress and results.

#### AIShortlistModal
Presents AI-generated shortlisting results with detailed matching scores and skill compatibility.

### Key Pages

#### Login Page
Authentication interface with form validation and error handling.

#### Company Dashboard
Central hub for companies to review candidates, access statistics, and manage the hiring process.

#### Candidate Dashboard
Personalized dashboard for candidates to manage their profile and applications.

#### Profile Pages
Separate interfaces for candidates and companies to manage their profile information.

#### Resume Upload Pages
Individual and bulk upload interfaces with drag-and-drop functionality.

## Service Layer

### authService
Handles authentication operations including login, logout, token management, and session persistence.

### companyService
Manages company-specific API requests including profile management, candidate retrieval, and AI shortlisting.

### profileService
Handles profile-related operations for candidates including profile data retrieval, updates, and resume management.

## Styling and UI

The application uses a combination of:

- Ant Design components for a cohesive UI
- Custom CSS for specialized styling
- Responsive design principles for multi-device support
- Consistent color schemes and typography

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Access the application at http://localhost:5173

## Environment Configuration

The application uses environment variables for configuration:
- `VITE_API_URL`: Backend API URL

## Backend Overview

SenAI's backend is built with Python Flask and leverages modern AI technologies to provide intelligent resume parsing and candidate evaluation capabilities.

### Tech Stack

- **Flask**: Lightweight WSGI web application framework
- **SQLAlchemy**: ORM for database operations
- **Flask-JWT-Extended**: Authentication with JSON Web Tokens
- **PostgreSQL**: Relational database for data storage
- **Google Gemini 2.0 Flash**: AI model for resume parsing and text processing
- **SentenceTransformers**: For semantic similarity and experience evaluation
- **Flask-Migrate**: Database migration and schema versioning
- **Flask-CORS**: Cross-Origin Resource Sharing support
- **Flask-Bcrypt**: Password hashing and verification

### Project Structure

```
backend/
├── app.py                      # Application entry point
├── database.py                 # Database configuration
├── auth.py                     # Authentication routes
├── utils.py                    # Utility functions
├── Models/                     # Database models
│   ├── candidate.py            # Candidate and related models
│   └── company.py              # Company model
├── CompanyRoutes/              # Company API endpoints
│   ├── company_routes.py       # Company route definitions
├── CandidateRoutes/            # Candidate API endpoints
│   ├── candidate_routes.py     # Candidate route definitions
│   └── utils.py                # Candidate-specific utilities
├── ResumeParser/               # Resume parsing functionality
│   ├── main.py                 # Main parser entry point
│   ├── LLMParser.py            # AI-based resume extraction with Gemini
│   ├── readResume.py           # File reading and text extraction
│   └── validateResult.py       # Data validation and cleaning
└── ResumeShortlister/          # AI-powered candidate ranking
    ├── main.py                 # Shortlisting orchestration
    ├── getData.py              # Data retrieval functions
    ├── skillShortlister.py     # Skill matching algorithms
    ├── experienceShortlister.py# Experience evaluation
    └── educationShortlister.py # Education matching
```

### Key Features

#### 1. Authentication System

The backend implements a dual authentication system for two user types:

- **JWT-based Authentication**: Secure token generation with claims containing user type
- **Role-Based Access Control**: Different endpoints for candidates and companies
- **Password Security**: Bcrypt hashing for password storage and verification
- **Protected Routes**: JWT verification middleware for secure API access

```python
# Example of token generation
access_token = create_access_token(
    identity=str(candidate.candidate_id),
    additional_claims={'email': candidate.email, 'type': 'candidate'}
)
```

#### 2. Database Schema

The application uses PostgreSQL with SQLAlchemy ORM featuring:

- **Relational Structure**: Properly linked models with foreign keys
- **Enumerated Types**: Custom SQL enums for skill categories and proficiency levels
- **Data Integrity**: Cascading deletes and unique constraints
- **Rich Relationships**: One-to-many and many-to-many relationships between entities

#### 3. AI-Powered Resume Parsing

Resume parsing is handled through a multi-stage process:

1. **Document Text Extraction**:
   - Supports PDF, DOCX, DOC, and TXT file formats
   - Uses PyMuPDF for PDF extraction and python-docx for DOCX files
   - Handles different encoding types for text files

2. **AI-Based Information Extraction**:
   - Utilizes Google Gemini 2.0 Flash for natural language understanding
   - Extracts structured information from unstructured resume text
   - Identifies candidate details, education history, skills with proficiency levels

3. **Data Validation and Normalization**:
   - Validates extracted data fields (email, phone, dates, etc.)
   - Normalizes data to match database schema requirements
   - Handles missing or incomplete information gracefully

#### 4. Intelligent Candidate Shortlisting

The resume shortlisting system employs multiple evaluation dimensions:

- **Skills Matching**:
  - Advanced similarity matching with text preprocessing and lemmatization
  - Weighted scoring based on skill matches and proficiency levels
  - Identification of missing critical skills

- **Experience Evaluation**:
  - Semantic text similarity using SentenceTransformer embeddings
  - Years of experience matching against job requirements
  - Context-aware evaluation of relevant experience

- **Education Assessment**:
  - Degree level comparison (Bachelor's, Master's, PhD)
  - Field of study relevance evaluation
  - Institution quality consideration when available

- **Aggregate Scoring**:
  - Weighted combination of skills, experience, and education scores
  - Configurable thresholds for automatic shortlisting
  - Detailed feedback on match quality for each dimension

#### 5. Bulk Resume Processing

The system supports efficient processing of multiple resumes:

- **ZIP File Handling**: Extraction and processing of compressed resume collections
- **Parallel Processing**: Efficient handling of multiple files
- **Automatic Candidate Creation**: Creates accounts for new applicants
- **Duplicate Detection**: Prevents creating duplicate candidates or applications

#### 6. API Architecture

The backend follows a RESTful API architecture with:

- **Route Organization**: Logically grouped by entity type (auth, company, candidate)
- **Response Standardization**: Consistent JSON responses with appropriate status codes
- **Error Handling**: Comprehensive error catching and informative messages
- **Input Validation**: Request data validation with clear error feedback

### API Endpoints Overview

#### Authentication
- `/api/register/company`: Register a new company
- `/api/register/candidate`: Register a new candidate 
- `/api/login/company`: Company login
- `/api/login/candidate`: Candidate login
- `/api/me`: Get current authenticated user

#### Company Routes
- `/api/company/profile`: Get or update company profile
- `/api/company/dashboard/stats`: Get dashboard statistics
- `/api/company/candidates`: Get applied candidates
- `/api/company/bulkUpload`: Upload multiple resumes
- `/api/company/resumeShortlister`: Rank candidates using AI
- `/api/company/candidates/{id}/shortlist`: Update shortlist status

#### Candidate Routes
- `/api/candidate/profile`: Get or update candidate profile
- `/api/candidate/resume`: Upload resume
- `/api/candidate/education`: Manage education records
- `/api/candidate/skills`: Manage skills

### Security Considerations

The backend implements several security best practices:

- **Password Hashing**: Secure storage of passwords using bcrypt
- **JWT Token Management**: Short-lived tokens with proper claims
- **Input Sanitization**: Preventing SQL injection and XSS attacks
- **CORS Configuration**: Controlled access from frontend
- **File Upload Validation**: Secure handling of uploaded files

---


