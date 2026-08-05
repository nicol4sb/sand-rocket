export declare const SPENDING_EXCEL_HEADERS: readonly ["Lot", "Payment date", "Description", "Bank", "Paid", "Debt", "Amount"];
export interface SpendingExcelExportLot {
    id: number;
    name: string;
    description: string;
    estimateAmount: number;
    position: number;
}
export interface SpendingExcelExportEntry {
    lotId: number | null;
    entryDate: string;
    description: string;
    bank: string;
    paid: boolean;
    debtPaid: boolean;
    amount: number;
}
export interface BuildSpendingExcelRowsOptions {
    formatDate?: (iso: string) => string;
}
export declare function buildSpendingExcelRows(entries: SpendingExcelExportEntry[], lots: SpendingExcelExportLot[], options?: BuildSpendingExcelRowsOptions): (string | number)[][];
export declare function isSpendingExcelMetaRow(lotName: string, description: string, bank: string, dateRaw: unknown, amountRaw: unknown): boolean;
