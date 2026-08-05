export interface SpendingLot {
  id: number;
  projectId: number;
  summaryEntryId: number | null;
  name: string;
  description: string;
  estimateAmount: number;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSpendingLotInput {
  projectId: number;
  summaryEntryId?: number | null;
  name: string;
  description: string;
  estimateAmount: number;
  position: number;
}

export interface UpdateSpendingLotInput {
  id: number;
  summaryEntryId?: number | null;
  name?: string;
  description?: string;
  estimateAmount?: number;
  position?: number;
}

export function spendingLotPaidTotal(
  entries: Array<{ lotId: number | null; amount: number; paid: boolean }>,
  lotId: number
): number {
  return entries
    .filter((e) => e.lotId === lotId && e.paid)
    .reduce((sum, e) => sum + e.amount, 0);
}
