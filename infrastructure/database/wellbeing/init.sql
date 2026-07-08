CREATE TABLE IF NOT EXISTS attendance (
    attendance_id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36),
    grade VARCHAR(50),
    record_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL,
    recorded_by VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance (student_id);

CREATE TABLE IF NOT EXISTS incidents (
    incident_id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36),
    incident_type VARCHAR(50) NOT NULL,
    severity VARCHAR(30),
    description TEXT,
    reported_by VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_incidents_student_id ON incidents (student_id);
