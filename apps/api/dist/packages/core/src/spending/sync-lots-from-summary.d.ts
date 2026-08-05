import { SummaryRepository } from '../summary/ports.js';
import { SpendingLotRepository } from './lot-ports.js';
/**
 * Keeps spending lots in 1:1 sync with devis (summary) lines.
 * Each summary entry gets exactly one spending lot; orphan lots are removed.
 */
export declare function syncSpendingLotsFromSummary(projectId: number, summary: SummaryRepository, lots: SpendingLotRepository): Promise<void>;
