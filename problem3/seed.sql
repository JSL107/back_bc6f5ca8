INSERT INTO users (id, name, email) VALUES
  (1, '이직원',  'staff@example.com'),
  (2, '김팀장',  'manager@example.com'),
  (3, '박부장',  'director@example.com'),
  (4, '최사원',  'junior@example.com');

INSERT INTO payment_requests (id, title, amount, requested_by, status, requested_at) VALUES
  (1, '팀 워크숍 비용', 500000.00, 1, 'IN_APPROVAL', '2025-02-20 09:00:00');

INSERT INTO approval_steps (request_id, approver_id, step_order, status, processed_at) VALUES
  (1, 3, 1, 'APPROVED', '2025-02-20 10:00:00'),
  (1, 2, 2, 'PENDING',  NULL);

INSERT INTO payment_requests (id, title, amount, requested_by, status, requested_at) VALUES
  (2, '소모품 구매', 150000.00, 4, 'IN_APPROVAL', '2025-02-21 10:00:00');

INSERT INTO approval_steps (request_id, approver_id, step_order, status, processed_at) VALUES
  (2, 2, 1, 'PENDING', NULL),
  (2, 3, 2, 'PENDING', NULL);

INSERT INTO payment_requests (id, title, amount, requested_by, status, requested_at) VALUES
  (3, '출장 경비', 300000.00, 1, 'IN_APPROVAL', '2025-02-22 11:00:00');

INSERT INTO approval_steps (request_id, approver_id, step_order, status, processed_at) VALUES
  (3, 3, 1, 'PENDING', NULL),
  (3, 2, 2, 'PENDING', NULL);

INSERT INTO payment_requests (id, title, amount, requested_by, status, requested_at) VALUES
  (4, '이미 완료된 결재', 100000.00, 1, 'APPROVED', '2025-02-18 09:00:00');

INSERT INTO approval_steps (request_id, approver_id, step_order, status, processed_at) VALUES
  (4, 2, 1, 'APPROVED', '2025-02-18 14:00:00');

INSERT INTO payment_requests (id, title, amount, requested_by, status, requested_at) VALUES
  (5, '반려된 결재', 200000.00, 1, 'REJECTED', '2025-02-19 09:00:00');

INSERT INTO approval_steps (request_id, approver_id, step_order, status, processed_at) VALUES
  (5, 3, 1, 'REJECTED', '2025-02-19 15:00:00'),
  (5, 2, 2, 'PENDING',  NULL);
