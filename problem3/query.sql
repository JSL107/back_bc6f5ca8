-- ============================================================
-- 특정 사용자가 지금 처리해야 할 결재 건 조회
--
-- 조건:
--   1) 내가 결재자로 지정된 단계
--   2) 내 단계 상태가 PENDING (미처리)
--   3) 문서 상태가 IN_APPROVAL (결재 진행 중)
--   4) 내 단계보다 앞선 모든 단계가 APPROVED (지금이 내 차례)
-- ============================================================

SELECT
  pr.id           AS request_id,
  pr.title,
  pr.amount,
  u.name          AS requested_by,
  s.step_order,
  pr.requested_at
FROM approval_steps s
JOIN payment_requests pr ON pr.id = s.request_id
JOIN users u              ON u.id  = pr.requested_by
WHERE s.approver_id = :user_id          -- 내가 결재자인 단계
  AND s.status      = 'PENDING'         -- 아직 미처리
  AND pr.status     = 'IN_APPROVAL'     -- 문서가 진행 중
  AND NOT EXISTS (                      -- 내 앞 단계 중 APPROVED가 아닌 것이 없어야 함
    SELECT 1
    FROM approval_steps prev
    WHERE prev.request_id = s.request_id
      AND prev.step_order < s.step_order
      AND prev.status    <> 'APPROVED'
  )
ORDER BY pr.requested_at ASC;

-- ============================================================
-- seed.sql 기준 기대 결과 (:user_id = 2, 김팀장)
--
-- | request_id | title          | amount     | requested_by | step_order | requested_at        |
-- |------------|----------------|------------|--------------|------------|---------------------|
-- | 1          | 팀 워크숍 비용  | 500000.00  | 이직원        | 2          | 2025-02-20 09:00:00 |
-- | 2          | 소모품 구매     | 150000.00  | 최사원        | 1          | 2025-02-21 10:00:00 |
--
-- 제외 이유:
--   request 3 — step 1(박부장)이 아직 PENDING → NOT EXISTS 조건 불만족
--   request 4 — pr.status = 'APPROVED' (완료 문서)
--   request 5 — pr.status = 'REJECTED' (반려 문서)
-- ============================================================
