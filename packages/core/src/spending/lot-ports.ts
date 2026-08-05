import { CreateSpendingLotInput, SpendingLot, UpdateSpendingLotInput } from './lot-types.js';

export interface SpendingLotRepository {
  listByProject(projectId: number): Promise<SpendingLot[]>;
  findById(id: number): Promise<SpendingLot | null>;
  create(input: CreateSpendingLotInput): Promise<SpendingLot>;
  update(input: UpdateSpendingLotInput): Promise<SpendingLot | null>;
  delete(id: number): Promise<boolean>;
  getMaxPosition(projectId: number): Promise<number>;
}
