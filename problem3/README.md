# 문제 3 - 설계 의도

다단계 결재 시스템 요구사항 구현 구성을 간략히 요약합니다.

## 1. 정규화 (3개 테이블 분리)
- **확장성:** 1단부터 다단 결재까지 동적인 결재선 길이에 대응
- **추적성:** 결재자 개별 지연/처리 상태(`processed_at`, `status`) 추적 및 관리

## 2. 상태 관리의 이중화
- **조회 성능:** `payment_requests.status = 'IN_APPROVAL'` 조건만으로 수많은 과거/종료 문서와의 조인을 1차단하여 응답 속도 극대화

## 3. `step_order` 기반 순서 제어
- **단순성:** Linked List를 쓰지 않아 복잡한 재귀 순회(Recursive Query) 불필요. `step_order < 내 순서` 구문만으로 선행 단계 검증 가능.

## 4. `NOT EXISTS` 구문 활용
- **Short-Circuit 최적화:** 선행자 중 `PENDING`이나 `REJECTED`가 하나라도 있으면 집계(COUNT) 없이 즉시 해당 문서 조회를 포기하여 대량 데이터 스캔 비용 절감

## 5. 인덱스 최적화 대상
- **`idx_steps_approver_status`**: "나에게 할당된" & "미결재된" 대기 문서를 가장 먼저 확보하기 위한 시작 조건
- **`idx_steps_request_order`**: `NOT EXISTS` 서브쿼리 내부의 고속 검증용
- **`idx_pr_status_requested_at`**: 조인 이후 파일 정렬(Filesort)을 방지하고 시간순으로 정렬하기 위해 활용
