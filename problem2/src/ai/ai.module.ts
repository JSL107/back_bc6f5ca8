import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiMealsController } from './ai-meals/ai-meals.controller';
import { MealsModule } from '../meals/meals.module';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

@Module({
  imports: [MealsModule, InfrastructureModule],
  providers: [AiService],
  controllers: [AiMealsController],
})
export class AiModule {}
