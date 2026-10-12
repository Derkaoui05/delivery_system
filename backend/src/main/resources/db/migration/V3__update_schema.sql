-- V3: Add missing fields and audit_logs table

-- Users: password reset support
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME NULL;

-- Livraisons: additional fields
ALTER TABLE livraisons ADD COLUMN instructions_livraison VARCHAR(500) NULL;
ALTER TABLE livraisons ADD COLUMN commentaire VARCHAR(500) NULL;

-- Audit Logs (Section 18)
CREATE TABLE audit_logs (
    id CHAR(36) NOT NULL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NULL,
    entity_id VARCHAR(36) NULL,
    user_id CHAR(36) NULL,
    details VARCHAR(500) NULL,
    ip_address VARCHAR(45) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
