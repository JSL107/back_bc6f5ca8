CREATE TABLE users (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
);

CREATE TABLE payment_requests (
  id           BIGINT          NOT NULL AUTO_INCREMENT,
  title        VARCHAR(255)    NOT NULL,
  amount       DECIMAL(15, 2)  NOT NULL,
  requested_by BIGINT          NOT NULL,
  status       ENUM('DRAFT', 'IN_APPROVAL', 'APPROVED', 'REJECTED')
                               NOT NULL DEFAULT 'DRAFT',
  requested_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_pr_requested_by
    FOREIGN KEY (requested_by) REFERENCES users (id)
);

CREATE TABLE approval_steps (
  id           BIGINT    NOT NULL AUTO_INCREMENT,
  request_id   BIGINT    NOT NULL,
  approver_id  BIGINT    NOT NULL,
  step_order   INT       NOT NULL,
  status       ENUM('PENDING', 'APPROVED', 'REJECTED')
                         NOT NULL DEFAULT 'PENDING',
  processed_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),

  UNIQUE KEY uq_steps_request_order (request_id, step_order),
  CONSTRAINT fk_steps_request
    FOREIGN KEY (request_id)  REFERENCES payment_requests (id),
  CONSTRAINT fk_steps_approver
    FOREIGN KEY (approver_id) REFERENCES users (id)
);

CREATE INDEX idx_steps_approver_status
  ON approval_steps (approver_id, status);

CREATE INDEX idx_steps_request_order
  ON approval_steps (request_id, step_order);

CREATE INDEX idx_pr_status_requested_at
  ON payment_requests (status, requested_at);
