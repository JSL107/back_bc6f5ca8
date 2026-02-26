import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { MealQuery, MealResponse } from '../types/meal';
import { CacheService } from '../infrastructure/cache/cache.service';
import { MealsService } from '../meals/meals.service';

const EMPTY_MEALS_COMMENT = '해당 기간에 제공된 식단 정보가 없어서 코멘트를 작성할 수 없네요! 😅';
const FALLBACK_COMMENT =
  '현재 영양사 선생님 코멘트를 불러올 수 없어요. 나중에 다시 확인해주세요! 😥';
const AI_CACHE_PREFIX = 'ai-comment:';

@Injectable()
export class AiService {
  private readonly openai: OpenAI;
  private readonly logger = new Logger(AiService.name);
  private readonly model: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly mealsService: MealsService,
  ) {
    this.openai = new OpenAI({ apiKey: this.configService.get<string>('OPENAI_API_KEY') });
    this.model = this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini';
  }

  async generateNutritionComment(query: MealQuery): Promise<string | null> {
    const cacheKey = `${AI_CACHE_PREFIX}${JSON.stringify(query)}`;
    const cached = await this.cacheService.get<string>(cacheKey);
    if (cached) {
      return cached;
    }

    const meals = await this.mealsService.getMealSummary(query);
    if (!meals.length) {
      return EMPTY_MEALS_COMMENT;
    }

    const comment = await this.callOpenAI(meals);
    if (comment) {
      await this.cacheService.set(cacheKey, comment);
    }
    return comment;
  }

  private readonly buildPrompt = (meals: MealResponse[]): string => {
    const simplifiedMeals = meals.map((meal) => ({
      date: meal.date,
      menus: meal.menu.map((m) => m.name),
      nutritionAvg: meal.nutrition,
      warnings: meal.warnings,
    }));
    return `다음은 학교 급식 식단 요약 데이터입니다.
이 데이터를 보고 학부모와 학생을 위해 1~2문장으로 영양 균형에 대한 따뜻한 조언이나 코멘트를 작성해 주세요. 친근한 말투와 이모지를 사용하세요.

[급식 데이터]
${JSON.stringify(simplifiedMeals, null, 2)}`;
  };

  private readonly callOpenAI = async (meals: MealResponse[]): Promise<string | null> => {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              '당신은 10년 차 학교 전담 초등/중등 영양사입니다. 학부모와 학생들에게 친절하고 따뜻한 말투로 식단에 대해 설명해줍니다.',
          },
          { role: 'user', content: this.buildPrompt(meals) },
        ],
        temperature: 0.7,
        max_tokens: 150,
      });
      return response.choices[0]?.message?.content?.trim() ?? null;
    } catch (error) {
      this.logger.error('OpenAI API 호출 중 오류 발생', error);
      return FALLBACK_COMMENT;
    }
  };
}
