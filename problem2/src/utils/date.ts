import { match, P } from 'ts-pattern';

export type DateRange = { fromDate: string; toDate: string };

const boundsCache = new Map<string, DateRange>();

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

export const getThisWeekBounds = (): DateRange => {
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

  const bounds: DateRange = { fromDate: toYMD(monday), toDate: toYMD(friday) };
  boundsCache.set(today, bounds);
  return bounds;
};

export const resolveDateRange = (fromDate?: string, toDate?: string, period?: string): DateRange =>
  match({ fromDate, toDate, period })
    .with({ fromDate: P.string, toDate: P.string }, ({ fromDate, toDate }) => ({
      fromDate,
      toDate,
    }))
    .with({ period: 'weekly' }, () => getThisWeekBounds())
    .otherwise(() => {
      const today = getTodayDate();
      return { fromDate: today, toDate: today };
    });
