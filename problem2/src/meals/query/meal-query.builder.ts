import { MealQuery } from '../../types/meal';
import { resolveDateRange } from '../../utils/date';
import { MealQueryDto } from './meal-query.dto';

export const toMealQuery = (dto: MealQueryDto): MealQuery => {
  const { fromDate, toDate } = resolveDateRange(dto.fromDate, dto.toDate, dto.period);
  return {
    officeCode: dto.officeCode,
    schoolCode: dto.schoolCode,
    fromDate,
    toDate,
    mealType: dto.mealType,
    childAllergies: dto.childAllergies,
  };
};
