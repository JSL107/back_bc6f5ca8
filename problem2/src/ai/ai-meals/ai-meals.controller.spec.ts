import { Test, TestingModule } from '@nestjs/testing';
import { AiMealsController } from './ai-meals.controller';
import { AiService } from '../ai.service';

describe('AiMealsController', () => {
  let controller: AiMealsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiMealsController],
      providers: [
        {
          provide: AiService,
          useValue: { generateNutritionComment: jest.fn().mockResolvedValue(null) },
        },
      ],
    }).compile();

    controller = module.get<AiMealsController>(AiMealsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
