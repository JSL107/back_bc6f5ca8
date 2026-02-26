import { Inject, Injectable } from '@nestjs/common';
import { NeisRepository } from '../infrastructure/neis/neis.repository';
import { WeeklySummary, Nutrition, NUTRITION_KEYS, MealQuery, MealResponse, DailyMeal, DailyMealInfo } from '../types/meal';
import { toDailyMealInfo, toMealResponse } from './meals.mapper';
import { parseNutrition } from '../utils/parser';
import { toDayOfWeek } from '../utils/date';

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

    if (!mealRows || mealRows.length === 0) {
      return [];
    }

    const responses = mealRows.map((row) => toMealResponse(row, childAllergies));

    if (childAllergies && childAllergies.length > 0) {
      return responses.filter((res) => res.warnings.length > 0);
    }

    return responses;
  }


}
