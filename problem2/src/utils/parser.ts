import { match } from 'ts-pattern';
import { MenuItem, Nutrition } from '../types/meal';

const ALLERGY_MAP: Record<string, string> = {
  '1': '난류',
  '2': '우유',
  '3': '메밀',
  '4': '땅콩',
  '5': '대두',
  '6': '밀',
  '7': '고등어',
  '8': '게',
  '9': '새우',
  '10': '돼지고기',
  '11': '복숭아',
  '12': '토마토',
  '13': '아황산류',
  '14': '호두',
  '15': '닭고기',
  '16': '쇠고기',
  '17': '오징어',
  '18': '조개류(굴, 전복, 홍합 포함)',
  '19': '잣',
};

export const parseMenuString = (menuStr: string): MenuItem & { allergenNames: string[] } =>
  match(menuStr.match(/^(.+?)\(([\d.]+)\)$/))
    .with(null, () => ({ name: menuStr.trim(), allergies: [], allergenNames: [] }))
    .otherwise((matched) => {
      const allergies = matched[2].split('.').filter((code) => code !== '');
      return {
        name: matched[1].trim(),
        allergies,
        allergenNames: allergies.map((code) => ALLERGY_MAP[code] ?? '알 수 없음'),
      };
    });

export const checkAllergyWarning = (menuAllergens: string[], childAllergies: string[]): boolean =>
  menuAllergens.some((code) => childAllergies.includes(code));

const extractNutrient = (ntrInfo: string, regex: RegExp): number | undefined => {
  const matched = ntrInfo.match(regex);
  if (!matched) {
    return undefined;
  }
  const parsed = parseFloat(matched[1]);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const parseNutrition = (ntrInfo: string): Nutrition => ({
  carbohydrate: extractNutrient(ntrInfo, /탄수화물\([^)]+\)\s*:\s*([\d.]+)/),
  protein: extractNutrient(ntrInfo, /단백질\([^)]+\)\s*:\s*([\d.]+)/),
  fat: extractNutrient(ntrInfo, /지방\([^)]+\)\s*:\s*([\d.]+)/),
  calcium: extractNutrient(ntrInfo, /칼슘\([^)]+\)\s*:\s*([\d.]+)/),
  iron: extractNutrient(ntrInfo, /철분\([^)]+\)\s*:\s*([\d.]+)/),
});
