import { Test, TestingModule } from '@nestjs/testing';
import { MealsService } from './meals.service';
import { NeisRepository } from '../infrastructure/neis/neis.repository';
import { MealQuery } from '../types/meal';

const mockRows = [
  {
    ATPT_OFCDC_SC_CODE: 'B10',
    SD_SCHUL_CODE: '7010536',
    MLSV_YMD: '20250224',
    MMEAL_SC_CODE: '2',
    MMEAL_SC_NM: '중식',
    DDISH_NM: '현미밥<br/>김치찌개(5.6.9)<br/>계란후라이(1)',
    CAL_INFO: '850 Kcal',
    NTR_INFO:
      '탄수화물(g) : 80.5 / 단백질(g) : 25.0 / 지방(g) : 10.3 / 칼슘(mg) : 200.0 / 철분(mg) : 3.5',
  },
];

const baseQuery: MealQuery = {
  officeCode: 'B10',
  schoolCode: '7010536',
  fromDate: '20250224',
  toDate: '20250228',
  childAllergies: ['1', '5'],
};

const mockNeisRepository = {
  fetchMeals: jest.fn().mockResolvedValue(mockRows),
};

describe('MealsService', () => {
  let service: MealsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MealsService, { provide: NeisRepository, useValue: mockNeisRepository }],
    }).compile();

    service = module.get<MealsService>(MealsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getMealSummary', () => {
    it('식단 목록을 반환한다', async () => {
      const result = await service.getMealSummary(baseQuery);
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('20250224');
      expect(result[0].mealType).toBe(2);
      expect(result[0].menu).toHaveLength(3);
    });

    it('childAllergies와 일치하면 warning이 추가되고 해당 날짜가 반환된다', async () => {
      const result = await service.getMealSummary({ ...baseQuery, childAllergies: ['1'] });
      expect(result).toHaveLength(1);
      expect(result[0].warnings).toContain('계란후라이(1)');
    });

    it('childAllergies를 주었는데 일치하는 알레르기가 없으면 빈 배열이 반환된다', async () => {
      const result = await service.getMealSummary({ ...baseQuery, childAllergies: ['99'] });
      expect(result).toEqual([]);
    });

    it('childAllergies를 빈 배열로 주면 필터링 없이 모두 반환된다', async () => {
      const result = await service.getMealSummary({ ...baseQuery, childAllergies: [] });
      expect(result).toHaveLength(1);
      expect(result[0].warnings).toEqual([]);
    });

    it('rows가 비어있으면 빈 배열을 반환한다', async () => {
      mockNeisRepository.fetchMeals.mockResolvedValueOnce([]);
      const result = await service.getMealSummary(baseQuery);
      expect(result).toEqual([]);
    });
  });
});
