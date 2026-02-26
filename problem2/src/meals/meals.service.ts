import { Inject, Injectable } from '@nestjs/common';
import { NeisRepository } from '../infrastructure/neis/neis.repository';
import { MealQuery, MealResponse } from '../types/meal';
import { toMealResponse } from './meals.mapper';

@Injectable()
export class MealsService {
  constructor(@Inject(NeisRepository) private readonly neisRepository: NeisRepository) {}

  async getMealSummary({
    officeCode,
    schoolCode,
    fromDate,
    toDate,
    mealType,
    childAllergies,
  }: MealQuery): Promise<MealResponse[]> {
    const mealRows = await this.neisRepository.fetchMeals({
      officeCode,
      schoolCode,
      fromDate,
      toDate,
      mealType,
    });

    if (!mealRows?.length) {
      return [];
    }

    const responses = mealRows.map((row) => toMealResponse(row, childAllergies));
    return childAllergies.length > 0 ? responses.filter((r) => r.warnings.length > 0) : responses;
  }
}
