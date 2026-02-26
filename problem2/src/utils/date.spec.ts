import { toYMD, toDayOfWeek, getThisWeekBounds } from './date';

describe('toYMD', () => {
  it('날짜를 YYYYMMDD 형식으로 변환한다', () => {
    expect(toYMD(new Date(2025, 1, 24))).toBe('20250224');
  });

  it('월과 일이 한 자리면 0으로 패딩한다', () => {
    expect(toYMD(new Date(2025, 0, 5))).toBe('20250105');
  });
});

describe('toDayOfWeek', () => {
  it.each([
    ['20250224', '월'],
    ['20250225', '화'],
    ['20250226', '수'],
    ['20250227', '목'],
    ['20250228', '금'],
    ['20250301', '토'],
    ['20250302', '일'],
  ])('%s → %s', (ymd, expected) => {
    expect(toDayOfWeek(ymd)).toBe(expected);
  });
});

describe('getThisWeekBounds', () => {
  it('fromDate가 월요일이고 toDate가 금요일이다', () => {
    const { fromDate, toDate } = getThisWeekBounds();
    const fromDay = new Date(
      parseInt(fromDate.slice(0, 4), 10),
      parseInt(fromDate.slice(4, 6), 10) - 1,
      parseInt(fromDate.slice(6, 8), 10),
    ).getDay();
    const toDay = new Date(
      parseInt(toDate.slice(0, 4), 10),
      parseInt(toDate.slice(4, 6), 10) - 1,
      parseInt(toDate.slice(6, 8), 10),
    ).getDay();
    expect(fromDay).toBe(1);
    expect(toDay).toBe(5);
  });

  it('같은 날 두 번 호출하면 동일한 결과를 반환한다', () => {
    expect(getThisWeekBounds()).toEqual(getThisWeekBounds());
  });
});
