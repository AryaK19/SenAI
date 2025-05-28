
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE skill_category AS ENUM ('technical', 'soft', 'language', 'other');
CREATE TYPE proficiency_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');


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
    skill_category skill_category,
    proficiency_level proficiency_level,
    FOREIGN KEY (candidate_id) REFERENCES Candidates(candidate_id) ON DELETE CASCADE
);
