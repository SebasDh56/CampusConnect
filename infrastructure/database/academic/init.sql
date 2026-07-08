CREATE TABLE IF NOT EXISTS students (
    student_id VARCHAR(36) PRIMARY KEY,
    school_id VARCHAR(36),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    document_number VARCHAR(50) NOT NULL UNIQUE,
    grade VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20),
    enrollment_status VARCHAR(30) NOT NULL DEFAULT 'ENROLLED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_students_document_number ON students (document_number);
