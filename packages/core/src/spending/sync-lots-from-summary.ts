import { SummaryRepository } from '../summary/ports.js';
import { SpendingLotRepository } from './lot-ports.js';

/**
 * Keeps spending lots in 1:1 sync with devis (summary) lines.
 * Each summary entry gets exactly one spending lot; orphan lots are removed.
 */
export async function syncSpendingLotsFromSummary(
  projectId: number,
  summary: SummaryRepository,
  lots: SpendingLotRepository
): Promise<void> {
  const summaryEntries = await summary.listByProject(projectId);
  const existingLots = await lots.listByProject(projectId);

  const lotBySummaryId = new Map(
    existingLots
      .filter((lot) => lot.summaryEntryId != null)
      .map((lot) => [lot.summaryEntryId!, lot])
  );
  const unlinkedByName = new Map(
    existingLots
      .filter((lot) => lot.summaryEntryId == null)
      .map((lot) => [lot.name.trim().toLowerCase(), lot])
  );

  const keptLotIds = new Set<number>();

  for (const entry of summaryEntries) {
    let lot = lotBySummaryId.get(entry.id);

    if (!lot) {
      const nameKey = entry.lot.trim().toLowerCase();
      const matched = nameKey ? unlinkedByName.get(nameKey) : undefined;
      if (matched) {
        unlinkedByName.delete(nameKey);
        const linked = await lots.update({
          id: matched.id,
          summaryEntryId: entry.id,
          name: entry.lot.trim(),
          description: entry.fichierRetenu.trim(),
          estimateAmount: entry.amount,
          position: entry.position
        });
        if (!linked) continue;
        lot = linked;
      } else {
        lot = await lots.create({
          projectId,
          summaryEntryId: entry.id,
          name: entry.lot.trim(),
          description: entry.fichierRetenu.trim(),
          estimateAmount: entry.amount,
          position: entry.position
        });
      }
    } else if (
      lot.name !== entry.lot.trim() ||
      lot.description !== entry.fichierRetenu.trim() ||
      lot.estimateAmount !== entry.amount ||
      lot.position !== entry.position
    ) {
      const updated = await lots.update({
        id: lot.id,
        name: entry.lot.trim(),
        description: entry.fichierRetenu.trim(),
        estimateAmount: entry.amount,
        position: entry.position
      });
      if (!updated) continue;
      lot = updated;
    }

    keptLotIds.add(lot.id);
  }

  for (const lot of existingLots) {
    if (!keptLotIds.has(lot.id)) {
      await lots.delete(lot.id);
    }
  }
}
