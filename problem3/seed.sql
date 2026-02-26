-- ============================================================
-- 테스트 데이터
-- :user_id = 2 (김팀장) 기준으로 검증
-- ============================================================

INSERT INTO users (id, name, email) VALUES
  (1, '이직원',  'staff@example.com'),
  (2, '김팀장',  'manager@example.com'),
  (3, '박부장',  'director@example.com'),
  (4, '최사원',  'junior@example.com');

-- ============================================================
-- 시나리오 1: 정상 — 내 차례 (step 1 APPROVED, step 2 PENDING)
-- 기대 결과: 조회에 포함
-- ============================================================
INSERT INTO payment_requests (id, title, amount, requested_by, status, requested_at) VALUES
  (1, '팀 워크숍 비용', 500000.00, 1, 'IN_APPROVAL', '2025-02-20 09:00:00');

INSERT INTO approval_steps (request_id, approver_id, step_order, status, processed_at) VALUES
  (1, 3, 1, 'APPROVED', '2025-02-20 10:00:00'),  -- 박부장 승인 완료
  (1, 2, 2, 'PENDING',  NULL);                    -- 김팀장 대기 중 ✓

-- ============================================================
-- 시나리오 2: 정상 — 내가 첫 번째 결재자 (이전 단계 없음)
-- 기대 결과: 조회에 포함
-- ============================================================
INSERT INTO payment_requests (id, title, amount, requested_by, status, requested_at) VALUES
  (2, '소모품 구매', 150000.00, 4, 'IN_APPROVAL', '2025-02-21 10:00:00');

INSERT INTO approval_steps (request_id, approver_id, step_order, status, processed_at) VALUES
  (2, 2, 1, 'PENDING', NULL),  -- 김팀장이 첫 번째 결재자 ✓
  (2, 3, 2, 'PENDING', NULL);  -- 박부장은 아직 차례 아님

-- ============================================================
-- 시나리오 3: 제외 — 이전 단계(step 1)가 아직 PENDING
-- 기대 결과: 조회에서 제외
-- ============================================================
INSERT INTO payment_requests (id, title, amount, requested_by, status, requested_at) VALUES
  (3, '출장 경비', 300000.00, 1, 'IN_APPROVAL', '2025-02-22 11:00:00');

INSERT INTO approval_steps (request_id, approver_id, step_order, status, processed_at) VALUES
  (3, 3, 1, 'PENDING', NULL),  -- 박부장 아직 미처리
  (3, 2, 2, 'PENDING', NULL);  -- 김팀장은 아직 차례 아님 (제외)

-- ============================================================
-- 시나리오 4: 제외 — 문서 상태가 APPROVED (결재 완료)
-- 기대 결과: 조회에서 제외
-- ============================================================
INSERT INTO payment_requests (id, title, amount, requested_by, status, requested_at) VALUES
  (4, '이미 완료된 결재', 100000.00, 1, 'APPROVED', '2025-02-18 09:00:00');

INSERT INTO approval_steps (request_id, approver_id, step_order, status, processed_at) VALUES
  (4, 2, 1, 'APPROVED', '2025-02-18 14:00:00');  -- 김팀장이 이미 처리함 (제외)

-- ============================================================
-- 시나리오 5: 제외 — 이전 단계가 REJECTED
-- 기대 결과: 조회에서 제외 (반려된 문서는 IN_APPROVAL 상태 아님)
-- ============================================================
INSERT INTO payment_requests (id, title, amount, requested_by, status, requested_at) VALUES
  (5, '반려된 결재', 200000.00, 1, 'REJECTED', '2025-02-19 09:00:00');

INSERT INTO approval_steps (request_id, approver_id, step_order, status, processed_at) VALUES
  (5, 3, 1, 'REJECTED', '2025-02-19 15:00:00'),
  (5, 2, 2, 'PENDING',  NULL);  -- 도달 불가 (제외)
