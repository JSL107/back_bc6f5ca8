import { NeisMealRow } from '../types/neis';
import { DailyMealInfo, MealItem, MealResponse, MealType, MenuItem } from '../types/meal';
import { checkAllergyWarning, parseMenuString, parseNutrition } from '../utils/parser';

export const toDishItems = (rawDishes: string, childAllergies: string[]): MealItem[] =>
  rawDishes.split('<br/>').map((dish) => {
    const parsed = parseMenuString(dish);
    return {
      name: parsed.name,
      allergies: parsed.allergies,
      warning: checkAllergyWarning(parsed.allergies, childAllergies),
    };
  });

const extractWarnings = (items: MealItem[]): string[] =>
  items.filter((item) => item.warning).map((item) => `${item.name}(${item.allergies.join(',')})`);

const extractMenu = (items: MealItem[]): MenuItem[] =>
  items.map((item) => ({ name: item.name, allergies: item.allergies }));

const extractKcal = (calInfo: string): number | undefined => {
  const matched = calInfo.match(/([\d.]+)/);
  if (!matched) {
    return undefined;
  }
  const parsed = parseFloat(matched[1]);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const toMealResponse = (row: NeisMealRow, childAllergies: string[]): MealResponse => {
  const items = toDishItems(row.DDISH_NM, childAllergies);
  return {
    date: row.MLSV_YMD,
    mealType: parseInt(row.MMEAL_SC_CODE, 10) as MealType,
    menu: extractMenu(items),
    nutrition: { ...parseNutrition(row.NTR_INFO), kcal: extractKcal(row.CAL_INFO) },
    warnings: extractWarnings(items),
  };
};

export const toDailyMealInfo = (row: NeisMealRow, childAllergies: string[]): DailyMealInfo => {
  const items = toDishItems(row.DDISH_NM, childAllergies);
  return {
    mealType: parseInt(row.MMEAL_SC_CODE, 10) as MealType,
    menu: extractMenu(items),
    warnings: extractWarnings(items),
  };
};
