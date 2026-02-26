import { Controller, Get, Query } from '@nestjs/common';
import { AiService } from '../ai.service';
import { MealQueryDto } from '../../meals/query/meal-query.dto';
import { toMealQuery } from '../../meals/query/meal-query.builder';

@Controller({ path: 'meals/ai-comment', version: '1' })
export class AiMealsController {
  constructor(private readonly aiService: AiService) {}

  @Get()
  async getAiComment(@Query() dto: MealQueryDto) {
    const comment = await this.aiService.generateNutritionComment(toMealQuery(dto));
    return { nutritionistComment: comment };
  }
}
