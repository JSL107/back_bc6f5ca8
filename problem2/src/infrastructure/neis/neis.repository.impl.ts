import { Inject, Injectable } from '@nestjs/common';
import { NeisMealRow, NeisQuery } from '../../types/neis';
import { CacheService } from '../cache/cache.service';
import { NeisClient } from './neis.client';
import { NeisRepository } from './neis.repository';

@Injectable()
export class NeisRepositoryImpl extends NeisRepository {
  constructor(
    private readonly neisClient: NeisClient,
    @Inject(CacheService) private readonly cacheService: CacheService,
  ) {
    super();
  }

  async fetchMeals(query: NeisQuery): Promise<NeisMealRow[]> {
    const { officeCode, schoolCode, fromDate, toDate, mealType } = query;
    const cacheKey = `${officeCode}_${schoolCode}_${fromDate}_${toDate}_${mealType ?? ''}`;
    const cached = await this.cacheService.get<NeisMealRow[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const rows = await this.neisClient.fetchMeals(query);
    await this.cacheService.set(cacheKey, rows);
    return rows;
  }
}
