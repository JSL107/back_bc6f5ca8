const boundsCache = new Map<string, { fromDate: string; toDate: string }>();

export const toYMD = (date: Date): string =>
  [
    String(date.getFullYear()),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('');

export const getTodayDate = (): string => toYMD(new Date());

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'] as const;

export const toDayOfWeek = (ymd: string): string =>
  DAY_NAMES[
    new Date(
      parseInt(ymd.slice(0, 4), 10),
      parseInt(ymd.slice(4, 6), 10) - 1,
      parseInt(ymd.slice(6, 8), 10),
    ).getDay()
  ];

export const getThisWeekBounds = (): { fromDate: string; toDate: string } => {
  const today = toYMD(new Date());
  const cached = boundsCache.get(today);

  if (cached) {
    return cached;
  }

  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  const bounds = { fromDate: toYMD(monday), toDate: toYMD(friday) };
  boundsCache.set(today, bounds);
  return bounds;
};
