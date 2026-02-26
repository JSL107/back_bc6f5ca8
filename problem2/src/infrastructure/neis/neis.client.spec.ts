import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { NeisClient } from './neis.client';

const mockHttpService = { get: jest.fn() };
const mockConfigService = { getOrThrow: jest.fn().mockReturnValue('test-key') };

const axiosRes = <T>(data: T): AxiosResponse<T> =>
  ({ data, status: 200, statusText: 'OK', headers: {}, config: {} }) as AxiosResponse<T>;

const baseQuery = {
  officeCode: 'B10',
  schoolCode: '7010536',
  fromDate: '20250224',
  toDate: '20250228',
};

describe('NeisClient', () => {
  let client: NeisClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NeisClient,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    client = module.get<NeisClient>(NeisClient);
    jest.clearAllMocks();
  });

  it('급식 row 목록을 반환한다', async () => {
    mockHttpService.get.mockReturnValue(
      of(
        axiosRes({
          mealServiceDietInfo: [
            {},
            {
              row: [
                {
                  ATPT_OFCDC_SC_CODE: 'B10',
                  SD_SCHUL_CODE: '7010536',
                  MLSV_YMD: '20250224',
                  MMEAL_SC_CODE: '2',
                  MMEAL_SC_NM: '중식',
                  DDISH_NM: '현미밥',
                  CAL_INFO: '850 Kcal',
                  NTR_INFO: '',
                },
              ],
            },
          ],
        }),
      ),
    );

    const rows = await client.fetchMeals(baseQuery);
    expect(rows).toHaveLength(1);
    expect(rows[0].MMEAL_SC_NM).toBe('중식');
  });

  it('INFO-200이면 빈 배열을 반환한다', async () => {
    mockHttpService.get.mockReturnValue(
      of(axiosRes({ RESULT: { CODE: 'INFO-200', MESSAGE: '해당하는 데이터가 없습니다.' } })),
    );

    const rows = await client.fetchMeals(baseQuery);
    expect(rows).toEqual([]);
  });

  it('mealServiceDietInfo가 없으면 에러를 던진다', async () => {
    mockHttpService.get.mockReturnValue(
      of(axiosRes({ RESULT: { CODE: 'ERROR-001', MESSAGE: 'API Error' } })),
    );

    await expect(client.fetchMeals(baseQuery)).rejects.toThrow('API Error');
  });

  it('RESULT.MESSAGE가 없으면 기본 메시지로 에러를 던진다', async () => {
    mockHttpService.get.mockReturnValue(of(axiosRes({})));

    await expect(client.fetchMeals(baseQuery)).rejects.toThrow('Unknown NEIS API Error');
  });
});
