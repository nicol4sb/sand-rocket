import type { Epic, SpendingEntry, SpendingLot, SummaryEntry, Task } from '@sandrocket/core';
/** Matches SpendingTable export / import format (grouped by lot) */
export declare function buildSpendingExcelBuffer(entries: SpendingEntry[], lots?: Pick<SpendingLot, 'id' | 'name' | 'description' | 'estimateAmount' | 'position'>[]): Buffer;
/** Matches SummaryTable (Devis) export / import format */
export declare function buildDevisExcelBuffer(entries: SummaryEntry[]): Buffer;
/** Task list + epic backlog notes (matches board layout: tasks by position, then backlog) */
export declare function buildTasksExcelBuffer(epicTasks: Array<{
    epic: Epic;
    tasks: Task[];
}>): Buffer;
