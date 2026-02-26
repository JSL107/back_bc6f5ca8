import { NeisMealRow, NeisQuery } from '../../types/neis';

export abstract class NeisRepository {
  abstract fetchMeals(query: NeisQuery): Promise<NeisMealRow[]>;
}
