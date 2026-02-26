import { MealType } from './meal';

export interface NeisMealRow {
  ATPT_OFCDC_SC_CODE: string;
  SD_SCHUL_CODE: string;
  MLSV_YMD: string;
  MMEAL_SC_CODE: string;
  MMEAL_SC_NM: string;
  DDISH_NM: string;
  CAL_INFO: string;
  NTR_INFO: string;
}

export type NeisMealSection = {
  row: NeisMealRow[];
};

export type NeisQuery = {
  officeCode: string;
  schoolCode: string;
  fromDate: string;
  toDate: string;
  mealType?: MealType;
};
