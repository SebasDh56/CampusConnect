CREATE TABLE IF NOT EXISTS payments (
    payment_id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36),
    invoice_id VARCHAR(36),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    payment_method VARCHAR(50),
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments (student_id);
