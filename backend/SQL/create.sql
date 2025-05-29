CREATE TABLE Candidates (
    candidate_id SERIAL PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(20),
    location VARCHAR(255),
    years_experience INTEGER,
    resume_file_path VARCHAR(512),
    status VARCHAR(20) CHECK (status IN ('pending', 'shortlisted', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    experiance TEXT,  -- can be JSON or TEXT for flexibility
);

CREATE TYPE skillcategory AS ENUM ('technical', 'soft', 'language', 'other');
CREATE TYPE proficiencylevel AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');


CREATE TABLE Education (
    education_id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL,
    degree VARCHAR(255),
    institution VARCHAR(255),
    graduation_year INTEGER,
    gpa DECIMAL(3, 2),
    FOREIGN KEY (candidate_id) REFERENCES Candidates(candidate_id) ON DELETE CASCADE
);


CREATE TABLE Skills (
    skill_id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL,
    skill_name VARCHAR(255),
    skill_category skillcategory,
    proficiency_level proficiencylevel,
    FOREIGN KEY (candidate_id) REFERENCES Candidates(candidate_id) ON DELETE CASCADE
);


CREATE TABLE Companies (
    job_id SERIAL PRIMARY KEY,
    company_email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    company_name VARCHAR(255) NOT NULL,
    job_role VARCHAR(255),
    job_type VARCHAR(100), -- e.g., 'full-time', 'internship', 'remote'
    stipend VARCHAR(100),  -- can be changed to INTEGER or NUMERIC if strictly numeric
    location VARCHAR(255),
    skills_required TEXT,  -- comma-separated or JSON array (can be normalized later)
    education_qualification TEXT,
    description TEXT,
    posted_date DATE DEFAULT CURRENT_DATE,
    application_deadline DATE,
    profile_completed BOOLEAN DEFAULT FALSE,
);


CREATE TABLE AppliedCandidates (
    application_id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shortlisted BOOLEAN DEFAULT FALSE,
    compatibility_score DECIMAL(5, 2) DEFAULT 0.00, -- score out of 100

    FOREIGN KEY (candidate_id) REFERENCES Candidates(candidate_id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES JobListings(job_id) ON DELETE CASCADE,

    UNIQUE (candidate_id, job_id) -- prevent duplicate applications to the same job
);