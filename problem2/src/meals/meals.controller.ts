import { Controller, Get, Query } from '@nestjs/common';
import { MealsService } from './meals.service';
import { MealQueryDto } from './query/meal-query.dto';
import { toMealQuery } from './query/meal-query.builder';

@Controller({ path: 'meals', version: '1' })
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Get()
  async getMealSummary(@Query() dto: MealQueryDto) {
    const summary = await this.mealsService.getMealSummary(toMealQuery(dto));
    return { data: summary };
  }
}
