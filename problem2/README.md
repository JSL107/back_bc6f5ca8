# 문제 2 - NEIS 급식 API 설계 의도

이 API는 프론트엔드 개발자가 복잡한 공공데이터를 파싱할 필요 없이 **"화면에 즉시 그릴 수 있는 형태"**로 제공하는 것을 최우선 목표로 설계되었습니다.

## 1. 응답 데이터 형태(API 스펙) 결정 이유
- **가공 책임의 백엔드 통합:** 공공 API의 원본 `menu`는 괄호, 특수문자, 알레르기 번호가 뒤섞인 날것의 텍스트입니다. 프론트엔드가 매번 정규식으로 이를 걷어내는 비용을 없애기 위해, 백엔드에서 `이름`과 `알레르기 목록`을 완전히 분리한 JSON 객체 배열로 정제하여 반환합니다.
- **날짜 기간의 유연성(`period` 파라미터):** 프론트엔드에서 달력을 계산해 `YYYYMMDD` 문자열을 넘기는 대신, `period=daily` 또는 `weekly`만 넘기면 백엔드가 알아서 기한을 산출합니다.

## 2. 알레르기 맞춤 필터링 설계
- **개인화된 경고 제공:** 학부모 앱의 핵심은 "내 아이가 오늘 먹어선 안 되는 메뉴가 있는가"입니다. 전체 식단을 주지 않고, 요청받은 `childAllergies`와 대조하여 위험 물질이 포함된 날짜만 `warnings` 배열에 이유를 곁들여 필터링해 반환합니다.

## 3. 계층형 아키텍처 및 In-Memory 캐시 도입
- **Controller - Service - Repository 분리:** 단순히 외부 API를 포워딩하는 수준을 넘어, 추후 데이터베이스 도입이나 캐시 전략 변경에 유연하게 대응하기 위해 인터페이스 기반으로 계층을 분리했습니다.
- **캐싱 전략 (메모리 최적화):** 알레르기(`childAllergies`) 조합은 사용자마다 너무 다양해 캐시 키로 쓰면 메모리(OOM) 문제가 발생합니다. 따라서 공통 데이터인 "학교+기간" 정보까지만 캐싱하고, 알레르기 경고 연산은 캐시에서 꺼낸 직후(요청 시점)에 수행하도록 설계했습니다.

## 4. 예외 포맷의 전역 통일 (Global Filter)
- **프론트엔드 에러 핸들링 일원화:** 값 검증(DTO) 실패, NEIS API 타임아웃, ChatGPT 연동 실패 등 수많은 장애 포인트가 존재합니다. 어떤 에러가 터지더라도 프론트엔드는 무조건 `{ statusCode, error }` 형태만 받도록 Global Exception Filter를 구성하여 클라이언트의 예외 처리 로직을 단순화했습니다.

## 5. 단계별 API 스펙

앱 공통 프리픽스/버전: `/api/v1`

| Method | Path | 설계 의도 및 설명 |
| :----- | :--- | :---------------------------------- |
| GET    | `/api/v1/meals` | 프론트엔드가 즉시 렌더링 가능한 형태의 급식 목록 및 평균 영양소 반환 |
| GET    | `/api/v1/meals/ai-comment` | (신규) 다소 딱딱할 수 있는 급식 데이터를 학부모 친화적인 문장력으로 풀어주기 위한 LLM 응답용 API |

---

## 6. 구현 결과 (요청 예시)

- **식단 및 영양정보 조회:** `GET /api/v1/meals`
    - `fromDate`, `toDate`를 명시적으로 전달하거나, `period=weekly` 또는 `period=daily`를 통해 동적으로 기간 범위를 적용할 수 있습니다. 아무 날짜 파라미터도 주어지지 않으면 자동으로 당일(`daily`) 데이터를 반환합니다.
    - `childAllergies` 파라미터를 제공하면, 해당 알레르기 유발 물질이 포함되어 **WARNING이 추가된 날짜만 필터링**되어 반환됩니다.

- **영양사 AI 코멘트 조회:** `GET /api/v1/meals/ai-comment`
    - 동일한 날짜, 학교 파라미터를 받아서 식단 데이터를 조회한 후 ChatGPT 응답을 받아 이모지와 함께 친근한 피드백을 한 줄로 반환합니다.
    - 동일 조건 요청에 한해 응답 시간을 개선하고 API 비용을 절감하기 위해 인메모리 캐시를 적용했습니다.

**[요청 예시: 특정 기간 식단 조회]**
    ```bash
    curl "http://localhost:3000/api/v1/meals?officeCode=B10&schoolCode=7010536&fromDate=20240415&toDate=20240419&mealType=2&childAllergies=1,5"
    ```
    ```json
    [
      {
        "date": "20240415",
        "mealType": 2,
        "menu": [
          { "name": "현미밥", "allergies": [] },
          { "name": "쇠고기미역국", "allergies": ["16"] },
          { "name": "오징어볶음", "allergies": ["5", "6", "17"] },
          { "name": "배추김치", "allergies": ["9"] },
          { "name": "우유", "allergies": ["2"] }
        ],
        "nutrition": {
          "kcal": 500,
          "carbohydrate": 70,
          "protein": 20,
          "fat": 15,
          "calcium": 250,
          "iron": 4.5
        },
        "warnings": ["오징어볶음(5,6,17)"]
      }
    ]
    ```

**[요청 예시: AI 영양사 코멘트 조회]**
    ```bash
    curl "http://localhost:3000/api/v1/meals/ai-comment?officeCode=B10&schoolCode=7010536&period=weekly"
    ```
    ```json
    {
      "nutritionistComment": "이번 주 식단은 단백질과 칼슘이 풍부해 아이들 성장에 아주 좋겠네요! 🥰 다만 현미밥과 오징어볶음으로 나트륨이 살짝 높을 수 있으니, 금요일 저녁엔 간이 삼삼한 채소 반찬을 챙겨주시면 더욱 완벽합니다! 🥦"
    }
    ```

-   전역 검증/예외 처리, 외부 API 타임아웃, in-memory 캐시(TTL 10분) 적용
-   메뉴 파싱/알레르기 매핑/영양소 파싱/요약 계산 로직 단위 테스트 작성

## 실행 방법

`.env`

```env
NEIS_API_KEY=발급받은_KEY
PORT=3000
OPENAI_API_KEY=발급받은_OPENAI_KEY
OPENAI_MODEL=gpt-3.5-turbo
```

실행

```bash
yarn install
yarn start:dev
```

테스트

```bash
yarn test
```
