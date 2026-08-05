export function spendingLotPaidTotal(entries, lotId) {
    return entries
        .filter((e) => e.lotId === lotId && e.paid)
        .reduce((sum, e) => sum + e.amount, 0);
}
