# 학교종이 백엔드 과제 - 제출용 분석 정리

## 문제 1 - 알고리즘 (TypeScript)

### 문제 요약
숫자 `1, 3, 5, 7, 9`를 각각 한 번씩만 사용해 두 개의 숫자를 만들고, 두 수의 곱이 최대인 조합을 찾는다.

### 가능한 자리수 분할

5개 숫자를 두 그룹으로 나누는 경우는 아래 두 가지뿐이다.
`(3,2)`, `(4,1)` 은 `(2,3)`, `(1,4)` 와 순서만 다른 동일한 경우이므로 중복이다.

| 분할 | 예시 |
|---|---|
| (1, 4) | `9` × `7531` |
| (2, 3) | `93` × `751` |

### 전체 경우의 수

| 분할 | 계산 | 경우의 수 |
|---|---|---|
| (2, 3) | C(5,2) × 2! × 3! | 10 × 2 × 6 = **120** |
| (1, 4) | C(5,1) × 1! × 4! | 5 × 1 × 24 = **120** |
| 합계 | | **240** |

총 240가지로 완전탐색(Brute Force)으로 충분하다.

### 풀이 전략
1. `[1,3,5,7,9]`의 모든 순열을 생성한다.
2. 각 순열에 대해 `(1,4)`와 `(2,3)`로 잘라 두 숫자를 만든다.
3. 곱을 계산해 최댓값을 갱신한다.

### 정답 검증

**(2,3) 분할 상위 후보:**

| 조합 | 곱 |
|---|---|
| `93` × `751` | **69,843** |
| `75` × `931` | 69,825 |
| `95` × `731` | 69,445 |
| `91` × `753` | 68,523 |
| `97` × `531` | 51,507 |

**(1,4) 분할 최대 후보:**

| 조합 | 곱 |
|---|---|
| `9` × `7531` | 67,779 |
| `7` × `9531` | 66,717 |

**(1,4) 최대값 67,779 < (2,3) 최대값 69,843** → 정답은 `93 × 751 = 69,843`

### 핵심 인사이트: 왜 `97 × 531`이 아니라 `93 × 751`인가?

직관적으로 큰 숫자(9,7)를 2자리 수에 몰아넣으면 더 클 것 같지만 실제로는 반대다.

- `97 → 93` 으로 바꾸면 2자리 수가 `-4` 감소
- 대신 3자리 수가 `531 → 751` 로 `+220` 증가
- 손익: `-4 × 531 = -2,124` vs `+220 × 93 = +20,460` → **압도적으로 이득**

> 자릿값이 높은 위치에 큰 숫자를 배치할수록 유리하고,
> 그 효과는 곱해지는 상대방 숫자의 크기에 비례한다.

### 예시 출력
```
result: 93, 751 (maxProduct: 69843)
```

---

## 문제 2 - API 설계/구현 (Node.js + TypeScript)

### 문제 요약
NEIS 급식식단 OpenAPI를 이용해 학교 가정통신문 서비스에서 실제로 활용 가능한 GET API를 1개 설계하고 구현한다.

### 추천 엔드포인트
`GET /api/v1/meals/letter`

### Query Parameters
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `officeCode` | string | Y | 시도교육청 코드 (`ATPT_OFCDC_SC_CODE`) |
| `schoolCode` | string | Y | 학교 코드 (`SD_SCHUL_CODE`) |
| `from` | string | N | 조회 시작일 `YYYYMMDD` (기본: 이번 주 월요일) |
| `to` | string | N | 조회 종료일 `YYYYMMDD` (기본: 이번 주 금요일) |
| `mealType` | number | N | 식사 타입 (1 조식, 2 중식, 3 석식) |
| `childAllergies` | string | N | 자녀 알레르기 코드 CSV (예: `1,2,5`) |

### 응답 가공 포인트
- 날짜별로 묶어서 가정통신문에 바로 쓸 수 있는 구조를 제공한다.
- 메뉴 문자열 `음식명(1.2.5.)`를 파싱해 `name`, `allergens` 배열로 분리한다.
- 알레르기 코드 숫자를 사람이 읽을 수 있는 한글명으로 매핑한다.
- `childAllergies`와 교집합이 있으면 `warning: true`로 표시한다.

### 에러/예외 처리
- 필수 파라미터 누락: `400`
- 날짜 포맷 오류(`YYYYMMDD` 아님): `400`
- NEIS 데이터 없음(`INFO-200`): `200` + 빈 배열
- 외부 API 실패: `502` 또는 `500`

### 구현 체크리스트
- 서버에서만 NEIS 호출 (`serviceKey`는 환경변수 사용)
- 입력 검증 (필수값, 날짜 범위, mealType 값)
- 외부 API 호출 타임아웃과 간단 캐시(예: 5~10분) 적용
- 응답 스키마 고정 (프론트에서 파싱하기 쉽게)

---

## 문제 3 - DB 설계 / SQL (MySQL or PostgreSQL)

### 문제 요약
여러 단계 승인/반려가 가능한 결재(지출 승인) 시스템에서,
1) 최소 테이블 설계
2) 특정 사용자가 지금 처리해야 할 결재 건 조회 쿼리 작성

### 최소 테이블 설계 (3개)

#### 1) `users`
| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | BIGINT PK | 사용자 ID |
| `name` | VARCHAR | 이름 |
| `email` | VARCHAR | 이메일 |

#### 2) `payment_requests`
| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | BIGINT PK | 결재 문서 ID |
| `title` | VARCHAR | 결재 제목 |
| `amount` | DECIMAL | 금액 |
| `requested_by` | BIGINT FK → users.id | 기안자 |
| `status` | ENUM | `DRAFT` / `IN_APPROVAL` / `APPROVED` / `REJECTED` |
| `requested_at` | TIMESTAMP | 상신 일시 |

#### 3) `approval_steps`
| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | BIGINT PK | 결재 단계 ID |
| `request_id` | BIGINT FK → payment_requests.id | 대상 문서 |
| `approver_id` | BIGINT FK → users.id | 결재자 |
| `step_order` | INT | 결재 순서 (1부터 시작) |
| `status` | ENUM | `PENDING` / `APPROVED` / `REJECTED` |
| `processed_at` | TIMESTAMP NULL | 처리 일시 (미처리시 NULL) |

### 조회 쿼리 핵심 조건
- 내가 결재자인 단계
- 내 단계 상태가 `PENDING`
- 문서 상태가 결재 진행중(`IN_APPROVAL`)
- 내 이전 단계가 모두 `APPROVED` (즉, 지금 내 차례)

### 예시 SQL
```sql
SELECT
  pr.id,
  pr.title,
  pr.amount,
  pr.requested_by,
  s.step_order,
  pr.requested_at
FROM approval_steps s
JOIN payment_requests pr
  ON pr.id = s.request_id
WHERE s.approver_id = :user_id
  AND s.status = 'PENDING'
  AND pr.status = 'IN_APPROVAL'
  AND NOT EXISTS (
    SELECT 1
    FROM approval_steps prev
    WHERE prev.request_id = s.request_id
      AND prev.step_order < s.step_order
      AND prev.status <> 'APPROVED'
  )
ORDER BY pr.requested_at ASC;
```

### 인덱스 권장
- `approval_steps(request_id, step_order)`
- `approval_steps(approver_id, status)`
- `payment_requests(status, requested_at)`
