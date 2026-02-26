# 문제 3: 다단계 결재 시스템

여러 단계의 승인 및 반려가 가능한 결재 시스템을 구축하기 위한 데이터베이스 스키마와 특정 결재권자가 처리해야 할 문서 목록을 조회하는 쿼리입니다.

## 1. 데이터베이스 스키마 (`schema.sql`)

결재 대상 문서(`payment_requests`)와 각 문서의 단계별 결재선(`approval_steps`)을 조인하여 다단계 결재 프로세스를 구현합니다.

### 1-1. `users` (사용자 테이블)
- `id`: 사용자 고유 식별자 (기안자 및 결재자)
- `name`, `email`: 사용자 기본 정보

### 1-2. `payment_requests` (결재 문서 테이블)
결재가 상신된 문서의 기본 정보와 전체 진행 상태를 관리합니다.
- `status`: **문서의 전체 상태**
  - `DRAFT`: 임시 저장 (결재 상신 전)
  - `IN_APPROVAL`: 결재 진행 중
  - `APPROVED`: 최종 승인 완료
  - `REJECTED`: 반려됨

### 1-3. `approval_steps` (단계별 결재선 테이블)
하나의 문서에 대해 다수의 결재자가 순서대로 결재해야 함을 관리합니다.
- `step_order`: **결재 순서** (1부터 시작하며, 작은 숫자일수록 먼저 결재해야 함)
  - 같은 문서(`request_id`)에서 동일한 결재 순서(`step_order`)는 존재할 수 없도록 **UNIQUE 옵션**을 통해 데이터 무결성을 보장합니다.
- `status`: **개별 결재자의 처리 상태** (`PENDING`, `APPROVED`, `REJECTED`)
  - 각 결재자가 결재/반려 액션을 취하면, 이 개별 상태와 함께 부모 테이블인 `payment_requests`의 상태를 연동 업데이트하게 됩니다.

### 성능 최적화 (인덱스)
자주 실행될 목록 조회 쿼리의 성능을 위해 다음 3개의 인덱스를 구성했습니다.
1. `(approver_id, status)`: "수신함"이나 "내 결재 대기함" 조회용 필터
2. `(request_id, step_order)`: "자신보다 앞선 순서의 결재 내역 검사 (NOT EXISTS)" 성능 개선
3. `(status, requested_at)`: 문서 전체 상태 변경 최신순 정렬

---

## 2. 결재 대기 조회 쿼리 (`query.sql`)

특정 사용자가 **"현재 시점에 실질적으로 결재 버튼을 눌러야 하는 문서"** 목록을 나열합니다. 결재 차례가 아직 도래하지 않은 문서는 조회되지 않습니다.

### 조회 조건 (필터 로직)
1. 문서 전체 상태가 진행 중(`IN_APPROVAL`)이어야 함
2. 자신이 포함된 `approval_steps` 단계 상태가 아직 미결(`PENDING`)이어야 함
3. **가장 중요한 조건**: 자신과 동일 문서이면서 `step_order`가 더 작은(**선결재자**) 스텝 중에 **승인(`APPROVED`)되지 않은 것이 단 한 건도 없어야 함** (`NOT EXISTS` 구문 활용)

### 쿼리
```sql
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
WHERE s.approver_id = :user_id          /* 1. 내가 결재자인 단계 */
  AND s.status      = 'PENDING'         /* 2. 내 단계가 아직 미처리 상태임 */
  AND pr.status     = 'IN_APPROVAL'     /* 3. 문서 전체가 진행 중상태임 */
  AND NOT EXISTS (                      /* 4. 내 앞 단계 중 APPROVED가 아닌 것이 하나라도 있으면(결재 안함/반려) 안됨 */
    SELECT 1
    FROM approval_steps prev
    WHERE prev.request_id = s.request_id
      AND prev.step_order < s.step_order
      AND prev.status    <> 'APPROVED'
  )
ORDER BY pr.requested_at ASC;
```

---

## 3. 테스트 데이터 검증 (`seed.sql`)

`user_id = 2 (김팀장)` 기준으로 테스트 데이터를 Insert하여 다음 5가지 시나리오를 검증할 수 있습니다. 정상 조회되어야 하는 시나리오는 1, 2번입니다.

1. **정상**: 내 앞사람(step 1)이 승인했고, 내 차례가 됨 `결과: 포함`
2. **정상**: 애초에 내가 첫 번째 결재자임 `결과: 포함`
3. **차례 대기 중**: 내 앞사람이 아직 미결 상태임 `결과: 제외 (나보다 앞선 승인되지 않은 단계 존재)`
4. **이미 승인 완료**: 내가 예전에 승인하여 문서 상태가 이미 `APPROVED`로 변경됨 `결과: 제외`
5. **이미 반려 됨**: 이전 단계에서 다른 사람이 반려하여 문서가 `REJECTED`됨 `결과: 제외`
