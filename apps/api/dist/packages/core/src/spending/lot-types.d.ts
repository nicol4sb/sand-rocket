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
export declare function spendingLotPaidTotal(entries: Array<{
    lotId: number | null;
    amount: number;
    paid: boolean;
}>, lotId: number): number;
