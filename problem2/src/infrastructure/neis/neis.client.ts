import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { firstValueFrom } from 'rxjs';
import { NeisMealRow, NeisMealSection, NeisQuery } from '../../types/neis';

const NEIS_API_URL = 'https://open.neis.go.kr/hub/mealServiceDietInfo';
const AXIOS_TIMEOUT_MS = 5_000;

@Injectable()
export class NeisClient {
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.getOrThrow<string>('NEIS_API_KEY');
  }

  async fetchMeals({
    officeCode,
    schoolCode,
    fromDate,
    toDate,
    mealType,
  }: NeisQuery): Promise<NeisMealRow[]> {
    const { data } = await firstValueFrom(
      this.httpService.get(NEIS_API_URL, {
        timeout: AXIOS_TIMEOUT_MS,
        params: {
          KEY: this.apiKey,
          Type: 'json',
          ATPT_OFCDC_SC_CODE: officeCode,
          SD_SCHUL_CODE: schoolCode,
          MLSV_FROM_YMD: fromDate,
          MLSV_TO_YMD: toDate,
          MMEAL_SC_CODE: mealType,
        },
      }),
    );

    if (data.RESULT && data.RESULT.CODE !== 'INFO-200' && data.RESULT.CODE !== 'INFO-000') {
      throw new Error(`NEIS API Error: ${data.RESULT.MESSAGE} (${data.RESULT.CODE})`);
    }

    if (data.RESULT?.CODE === 'INFO-200') {
      return [];
    }

    if (!Array.isArray(data.mealServiceDietInfo)) {
      throw new Error(data.RESULT?.MESSAGE ?? 'Unknown NEIS API Error');
    }

    const mealData = data.mealServiceDietInfo as NeisMealSection[];
    return mealData[1]?.row ?? [];
  }
}
