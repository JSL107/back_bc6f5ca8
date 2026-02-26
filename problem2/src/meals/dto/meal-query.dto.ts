import { IsString, IsNotEmpty, IsOptional, Matches, IsIn, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { MealType } from '../../types/meal';
import { getTodayDate } from '../../utils/date';
import { parseCommaSeparated } from '../../utils/transform';

const DATE_REGEX = /^\d{8}$/;
const VALID_MEAL_TYPES = [1, 2, 3] as const;

export class MealQueryDto {
  @IsString()
  @IsNotEmpty({ message: 'officeCode must be a required string.' })
  @Matches(/^[a-zA-Z0-9]+$/, { message: 'officeCode must be alphanumeric.' })
  officeCode!: string;

  @IsString()
  @IsNotEmpty({ message: 'schoolCode must be a required string.' })
  @Matches(/^[0-9]+$/, { message: 'schoolCode must contain only numbers.' })
  schoolCode!: string;

  @IsOptional()
  @IsString()
  @Matches(DATE_REGEX, { message: 'Date must be in YYYYMMDD format.' })
  @Transform(({ value }) => (!value ? getTodayDate() : value))
  fromDate: string = '';

  @IsOptional()
  @IsString()
  @Matches(DATE_REGEX, { message: 'Date must be in YYYYMMDD format.' })
  @Transform(({ value }) => (!value ? getTodayDate() : value))
  toDate: string = '';

  @IsOptional()
  @IsIn(VALID_MEAL_TYPES, { message: 'mealType must be 1 (breakfast), 2 (lunch), or 3 (dinner).' })
  @Transform(({ value }) => (value ? parseInt(String(value), 10) : undefined))
  mealType?: MealType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => parseCommaSeparated(value))
  childAllergies: string[] = [];
}
