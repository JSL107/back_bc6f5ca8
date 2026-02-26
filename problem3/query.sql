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
WHERE s.approver_id = :user_id
  AND s.status      = 'PENDING'
  AND pr.status     = 'IN_APPROVAL'
  AND NOT EXISTS (
    SELECT 1
    FROM approval_steps prev
    WHERE prev.request_id = s.request_id
      AND prev.step_order < s.step_order
      AND prev.status    <> 'APPROVED'
  )
ORDER BY pr.requested_at ASC;