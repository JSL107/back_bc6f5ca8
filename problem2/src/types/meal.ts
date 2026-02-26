export type MenuItem = {
  name: string;
  allergies: string[];
};

export type MealItem = MenuItem & { warning: boolean };

export type MealType = 1 | 2 | 3;

export type Nutrition = {
  kcal?: number;
  carbohydrate?: number;
  protein?: number;
  fat?: number;
  calcium?: number;
  iron?: number;
};

export type MealResponse = {
  date: string;
  mealType: MealType;
  menu: MenuItem[];
  nutrition: Nutrition;
  warnings: string[];
};

export type MealQuery = {
  officeCode: string;
  schoolCode: string;
  fromDate: string;
  toDate: string;
  mealType?: MealType;
  childAllergies: string[];
};
