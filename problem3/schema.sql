-- ============================================================
-- 문제 3: 다단계 결재 시스템 스키마
-- ============================================================

CREATE TABLE users (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
);

-- ----------------------------------------------------------------

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

-- ----------------------------------------------------------------
-- step_order: 결재 순서 (1부터 시작)
-- status:     PENDING(미처리) / APPROVED(승인) / REJECTED(반려)
-- processed_at: 미처리 시 NULL
-- ----------------------------------------------------------------

CREATE TABLE approval_steps (
  id           BIGINT    NOT NULL AUTO_INCREMENT,
  request_id   BIGINT    NOT NULL,
  approver_id  BIGINT    NOT NULL,
  step_order   INT       NOT NULL,
  status       ENUM('PENDING', 'APPROVED', 'REJECTED')
                         NOT NULL DEFAULT 'PENDING',
  processed_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  -- 같은 문서에서 동일 순서는 하나만 존재
  UNIQUE KEY uq_steps_request_order (request_id, step_order),
  CONSTRAINT fk_steps_request
    FOREIGN KEY (request_id)  REFERENCES payment_requests (id),
  CONSTRAINT fk_steps_approver
    FOREIGN KEY (approver_id) REFERENCES users (id)
);

-- ============================================================
-- 인덱스
-- ============================================================

-- 결재 대기 건 조회: approver + status 필터
CREATE INDEX idx_steps_approver_status
  ON approval_steps (approver_id, status);

-- NOT EXISTS 서브쿼리: 이전 단계 조회
CREATE INDEX idx_steps_request_order
  ON approval_steps (request_id, step_order);

-- 문서 상태 + 시간순 정렬
CREATE INDEX idx_pr_status_requested_at
  ON payment_requests (status, requested_at);
