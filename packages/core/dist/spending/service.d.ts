import { SpendingLotRepository } from './lot-ports.js';
import { SpendingRepository } from './ports.js';
import { SpendingLot } from './lot-types.js';
import { SpendingEntry } from './types.js';
import { SummaryRepository } from '../summary/ports.js';
export interface SpendingImportEntryInput {
    description: string;
    amount: number;
    entryDate?: string;
    bank?: string;
    paid?: boolean;
    debtPaid?: boolean;
    lotId?: number | null;
    lotName?: string;
}
export interface SpendingService {
    list(projectId: number): Promise<{
        visible: boolean;
        entries: SpendingEntry[];
        lots: SpendingLot[];
        totalAmount: number;
    }>;
    setVisible(projectId: number, visible: boolean): Promise<boolean>;
    createEntry(projectId: number, description: string, amount: number, entryDate?: string, bank?: string, paid?: boolean, lotId?: number | null): Promise<SpendingEntry>;
    updateEntry(id: number, description?: string, amount?: number, entryDate?: string, bank?: string, paid?: boolean, debtPaid?: boolean, lotId?: number | null): Promise<SpendingEntry | null>;
    deleteEntry(id: number): Promise<boolean>;
    importEntries(projectId: number, entries: SpendingImportEntryInput[], replace?: boolean): Promise<{
        entries: SpendingEntry[];
        lots: SpendingLot[];
        totalAmount: number;
    }>;
    createLot(projectId: number, name: string, description?: string, estimateAmount?: number): Promise<SpendingLot>;
    updateLot(id: number, name?: string, description?: string, estimateAmount?: number): Promise<SpendingLot | null>;
    deleteLot(id: number): Promise<boolean>;
}
export interface SpendingServiceDependencies {
    spending: SpendingRepository;
    lots: SpendingLotRepository;
    summary: SummaryRepository;
}
export declare function createSpendingService(deps: SpendingServiceDependencies): SpendingService;
