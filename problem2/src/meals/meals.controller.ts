import { Controller, Get, Query } from '@nestjs/common';
import { MealsService } from './meals.service';
import { MealQueryDto } from './dto/meal-query.dto';
import { MealQuery } from '../types/meal';

@Controller({ path: 'meals', version: '1' })
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Get()
  async getMealSummary(@Query() dto: MealQueryDto) {
    const query: MealQuery = {
      officeCode: dto.officeCode,
      schoolCode: dto.schoolCode,
      fromDate: dto.fromDate,
      toDate: dto.toDate,
      mealType: dto.mealType,
      childAllergies: dto.childAllergies,
    };
    const summary = await this.mealsService.getMealSummary(query);
    return { data: summary };
  }
}
