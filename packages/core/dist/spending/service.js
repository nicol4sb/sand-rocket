import { spendingPaidTotal } from './types.js';
import { syncSpendingLotsFromSummary } from './sync-lots-from-summary.js';
function todayIsoDate() {
    return new Date().toISOString().slice(0, 10);
}
function resolveEntryDate(entryDate) {
    const trimmed = entryDate?.trim();
    return trimmed && /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : todayIsoDate();
}
class SpendingServiceImpl {
    constructor(deps) {
        this.deps = deps;
    }
    async list(projectId) {
        await syncSpendingLotsFromSummary(projectId, this.deps.summary, this.deps.lots);
        const [visible, entries, lots] = await Promise.all([
            this.deps.spending.isVisible(projectId),
            this.deps.spending.listByProject(projectId),
            this.deps.lots.listByProject(projectId)
        ]);
        const totalAmount = spendingPaidTotal(entries);
        return { visible, entries, lots, totalAmount };
    }
    async setVisible(projectId, visible) {
        await this.deps.spending.setVisible(projectId, visible);
        return visible;
    }
    async createEntry(projectId, description, amount, entryDate, bank, paid = false, lotId) {
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
    async updateEntry(id, description, amount, entryDate, bank, paid, debtPaid, lotId) {
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
        if (!updated)
            return null;
        await this.deps.spending.reorderPositionsByDate(updated.projectId);
        return this.deps.spending.findById(updated.id);
    }
    async deleteEntry(id) {
        const existing = await this.deps.spending.findById(id);
        if (!existing)
            return false;
        const deleted = await this.deps.spending.delete(id);
        if (deleted) {
            await this.deps.spending.reorderPositionsByDate(existing.projectId);
        }
        return deleted;
    }
    async importEntries(projectId, entries, replace = true) {
        await syncSpendingLotsFromSummary(projectId, this.deps.summary, this.deps.lots);
        const existingLots = await this.deps.lots.listByProject(projectId);
        const lotIdByName = new Map(existingLots.map((lot) => [lot.name.trim().toLowerCase(), lot.id]));
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
        }
        else {
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
    async createLot(projectId, name, description = '', estimateAmount = 0) {
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
    async updateLot(id, name, description, estimateAmount) {
        return this.deps.lots.update({
            id,
            name: name?.trim(),
            description: description?.trim(),
            estimateAmount
        });
    }
    async deleteLot(id) {
        return this.deps.lots.delete(id);
    }
}
export function createSpendingService(deps) {
    return new SpendingServiceImpl(deps);
}
