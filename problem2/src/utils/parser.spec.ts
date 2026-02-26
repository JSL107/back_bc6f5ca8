import { parseMenuString, checkAllergyWarning, parseNutrition } from './parser';

describe('parseMenuString', () => {
  it('allergen 코드가 있는 메뉴를 파싱한다', () => {
    const result = parseMenuString('김치찌개(5.6.9)');
    expect(result.name).toBe('김치찌개');
    expect(result.allergies).toEqual(['5', '6', '9']);
    expect(result.allergenNames).toEqual(['대두', '밀', '새우']);
  });

  it('allergen이 없는 메뉴를 파싱한다', () => {
    const result = parseMenuString('현미밥');
    expect(result.name).toBe('현미밥');
    expect(result.allergies).toEqual([]);
    expect(result.allergenNames).toEqual([]);
  });

  it('알 수 없는 allergen 코드를 처리한다', () => {
    const result = parseMenuString('테스트(99)');
    expect(result.allergenNames).toEqual(['알 수 없음']);
  });
});

describe('checkAllergyWarning', () => {
  it('childAllergies와 겹치는 allergen이 있으면 true를 반환한다', () => {
    expect(checkAllergyWarning(['1', '5', '9'], ['5'])).toBe(true);
  });

  it('겹치는 allergen이 없으면 false를 반환한다', () => {
    expect(checkAllergyWarning(['1', '2'], ['5', '6'])).toBe(false);
  });

  it('childAllergies가 비어있으면 false를 반환한다', () => {
    expect(checkAllergyWarning(['1', '2'], [])).toBe(false);
  });
});

describe('parseNutrition', () => {
  it('NTR_INFO 문자열에서 영양소를 파싱한다', () => {
    const ntrInfo =
      '탄수화물(g) : 80.5 / 단백질(g) : 25.0 / 지방(g) : 10.3 / 칼슘(mg) : 200.0 / 철분(mg) : 3.5';
    const result = parseNutrition(ntrInfo);
    expect(result.carbohydrate).toBe(80.5);
    expect(result.protein).toBe(25.0);
    expect(result.fat).toBe(10.3);
    expect(result.calcium).toBe(200.0);
    expect(result.iron).toBe(3.5);
  });

  it('빈 문자열이면 모든 값이 undefined다', () => {
    const result = parseNutrition('');
    expect(result.carbohydrate).toBeUndefined();
    expect(result.protein).toBeUndefined();
  });
});
