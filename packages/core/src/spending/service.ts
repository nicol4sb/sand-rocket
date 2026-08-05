import { SpendingLotRepository } from './lot-ports.js';
import { SpendingRepository } from './ports.js';
import { SpendingLot } from './lot-types.js';
import { SpendingEntry, spendingPaidTotal } from './types.js';
import { SummaryRepository } from '../summary/ports.js';
import { syncSpendingLotsFromSummary } from './sync-lots-from-summary.js';

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function resolveEntryDate(entryDate?: string): string {
  const trimmed = entryDate?.trim();
  return trimmed && /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : todayIsoDate();
}

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
  createEntry(
    projectId: number,
    description: string,
    amount: number,
    entryDate?: string,
    bank?: string,
    paid?: boolean,
    lotId?: number | null
  ): Promise<SpendingEntry>;
  updateEntry(
    id: number,
    description?: string,
    amount?: number,
    entryDate?: string,
    bank?: string,
    paid?: boolean,
    debtPaid?: boolean,
    lotId?: number | null
  ): Promise<SpendingEntry | null>;
  deleteEntry(id: number): Promise<boolean>;
  importEntries(
    projectId: number,
    entries: SpendingImportEntryInput[],
    replace?: boolean
  ): Promise<{ entries: SpendingEntry[]; lots: SpendingLot[]; totalAmount: number }>;
  createLot(
    projectId: number,
    name: string,
    description?: string,
    estimateAmount?: number
  ): Promise<SpendingLot>;
  updateLot(
    id: number,
    name?: string,
    description?: string,
    estimateAmount?: number
  ): Promise<SpendingLot | null>;
  deleteLot(id: number): Promise<boolean>;
}

export interface SpendingServiceDependencies {
  spending: SpendingRepository;
  lots: SpendingLotRepository;
  summary: SummaryRepository;
}

class SpendingServiceImpl implements SpendingService {
  constructor(private readonly deps: SpendingServiceDependencies) {}

  async list(projectId: number) {
    await syncSpendingLotsFromSummary(projectId, this.deps.summary, this.deps.lots);
    const [visible, entries, lots] = await Promise.all([
      this.deps.spending.isVisible(projectId),
      this.deps.spending.listByProject(projectId),
      this.deps.lots.listByProject(projectId)
    ]);
    const totalAmount = spendingPaidTotal(entries);
    return { visible, entries, lots, totalAmount };
  }

  async setVisible(projectId: number, visible: boolean): Promise<boolean> {
    await this.deps.spending.setVisible(projectId, visible);
    return visible;
  }

  async createEntry(
    projectId: number,
    description: string,
    amount: number,
    entryDate?: string,
    bank?: string,
    paid = false,
    lotId?: number | null
  ): Promise<SpendingEntry> {
    const maxPos = await this.deps.spending.getMaxPosition(projectId);
    const created = await this.deps.spending.create({
      projectId,
      lotId: lotId ?? null,
      description: description.trim(),
      amount,
      entryDate: resolveEntryDate(entryDate),
      bank: (bank ?? '').trim(),
      paid,
      debtPaid: false,
      position: maxPos + 1
    });
    await this.deps.spending.reorderPositionsByDate(projectId);
    return (await this.deps.spending.findById(created.id)) ?? created;
  }

  async updateEntry(
    id: number,
    description?: string,
    amount?: number,
    entryDate?: string,
    bank?: string,
    paid?: boolean,
    debtPaid?: boolean,
    lotId?: number | null
  ): Promise<SpendingEntry | null> {
    const updated = await this.deps.spending.update({
      id,
      lotId,
      description,
      amount,
      entryDate: entryDate === undefined ? undefined : resolveEntryDate(entryDate),
      bank: bank === undefined ? undefined : bank.trim(),
      paid,
      debtPaid
    });
    if (!updated) return null;
    await this.deps.spending.reorderPositionsByDate(updated.projectId);
    return this.deps.spending.findById(updated.id);
  }

  async deleteEntry(id: number): Promise<boolean> {
    const existing = await this.deps.spending.findById(id);
    if (!existing) return false;
    const deleted = await this.deps.spending.delete(id);
    if (deleted) {
      await this.deps.spending.reorderPositionsByDate(existing.projectId);
    }
    return deleted;
  }

  async importEntries(
    projectId: number,
    entries: SpendingImportEntryInput[],
    replace = true
  ): Promise<{ entries: SpendingEntry[]; lots: SpendingLot[]; totalAmount: number }> {
    await syncSpendingLotsFromSummary(projectId, this.deps.summary, this.deps.lots);
    const existingLots = await this.deps.lots.listByProject(projectId);
    const lotIdByName = new Map(
      existingLots.map((lot) => [lot.name.trim().toLowerCase(), lot.id])
    );

    const normalized = entries
      .map((entry, sourceIndex) => {
        let lotId = entry.lotId ?? null;
        const lotName = entry.lotName?.trim();
        if (lotName) {
          const key = lotName.toLowerCase();
          lotId = lotIdByName.get(key) ?? lotId;
        }
        return {
          lotId,
          description: entry.description.trim(),
          bank: (entry.bank ?? '').trim(),
          amount: entry.amount,
          entryDate: resolveEntryDate(entry.entryDate),
          paid: entry.paid ?? true,
          debtPaid: entry.debtPaid ?? false,
          sourceIndex
        };
      })
      .sort((a, b) => {
        const dateCmp = a.entryDate.localeCompare(b.entryDate);
        return dateCmp !== 0 ? dateCmp : a.sourceIndex - b.sourceIndex;
      })
      .map((entry, index) => ({
        lotId: entry.lotId,
        description: entry.description,
        bank: entry.bank,
        amount: entry.amount,
        entryDate: entry.entryDate,
        paid: entry.paid,
        debtPaid: entry.debtPaid,
        position: index + 1
      }));

    if (replace) {
      await this.deps.spending.replaceAll(projectId, normalized);
    } else {
      const maxPos = await this.deps.spending.getMaxPosition(projectId);
      for (let i = 0; i < normalized.length; i++) {
        await this.deps.spending.create({
          projectId,
          ...normalized[i],
          position: maxPos + i + 1
        });
      }
      await this.deps.spending.reorderPositionsByDate(projectId);
    }

    const listed = await this.deps.spending.listByProject(projectId);
    await syncSpendingLotsFromSummary(projectId, this.deps.summary, this.deps.lots);
    const lots = await this.deps.lots.listByProject(projectId);
    const totalAmount = spendingPaidTotal(listed);
    return { entries: listed, lots, totalAmount };
  }

  async createLot(
    projectId: number,
    name: string,
    description = '',
    estimateAmount = 0
  ): Promise<SpendingLot> {
    const trimmedName = name.trim() || 'New lot';
    const maxPos = await this.deps.lots.getMaxPosition(projectId);
    return this.deps.lots.create({
      projectId,
      name: trimmedName,
      description: description.trim(),
      estimateAmount,
      position: maxPos + 1
    });
  }

  async updateLot(
    id: number,
    name?: string,
    description?: string,
    estimateAmount?: number
  ): Promise<SpendingLot | null> {
    return this.deps.lots.update({
      id,
      name: name?.trim(),
      description: description?.trim(),
      estimateAmount
    });
  }

  async deleteLot(id: number): Promise<boolean> {
    return this.deps.lots.delete(id);
  }
}

export function createSpendingService(deps: SpendingServiceDependencies): SpendingService {
  return new SpendingServiceImpl(deps);
}
