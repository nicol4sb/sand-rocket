import { z } from 'zod';
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');
export const spendingLotResponseSchema = z.object({
    id: z.number().int(),
    projectId: z.number().int(),
    summaryEntryId: z.number().int().nullable(),
    name: z.string(),
    description: z.string(),
    estimateAmount: z.number(),
    position: z.number().int(),
    createdAt: z.string(),
    updatedAt: z.string()
});
export const createSpendingLotRequestSchema = z.object({
    name: z.string().max(200).optional().default(''),
    description: z.string().max(500).optional().default(''),
    estimateAmount: z.number().finite().optional().default(0)
});
export const updateSpendingLotRequestSchema = z.object({
    name: z.string().max(200).optional(),
    description: z.string().max(500).optional(),
    estimateAmount: z.number().finite().optional()
});
export const spendingEntryResponseSchema = z.object({
    id: z.number().int(),
    projectId: z.number().int(),
    lotId: z.number().int().nullable(),
    description: z.string(),
    amount: z.number(),
    entryDate: isoDateSchema,
    bank: z.string(),
    paid: z.boolean(),
    debtPaid: z.boolean(),
    position: z.number().int(),
    createdAt: z.string(),
    updatedAt: z.string()
});
export const updateSpendingVisibilityRequestSchema = z.object({
    visible: z.boolean()
});
export const createSpendingEntryRequestSchema = z.object({
    description: z.string().max(500).default(''),
    amount: z.number().finite(),
    entryDate: isoDateSchema.optional(),
    bank: z.string().max(100).optional().default(''),
    paid: z.boolean().optional().default(false),
    debtPaid: z.boolean().optional().default(false),
    lotId: z.number().int().nullable().optional(),
    lotName: z.string().max(200).optional()
});
export const updateSpendingEntryRequestSchema = z.object({
    description: z.string().max(500).optional(),
    amount: z.number().finite().optional(),
    entryDate: isoDateSchema.optional(),
    bank: z.string().max(100).optional(),
    paid: z.boolean().optional(),
    debtPaid: z.boolean().optional(),
    lotId: z.number().int().nullable().optional()
});
export const importSpendingEntriesRequestSchema = z.object({
    replace: z.boolean().default(true),
    entries: z.array(createSpendingEntryRequestSchema).min(1).max(500)
});
