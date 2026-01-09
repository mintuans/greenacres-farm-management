import { z } from 'zod';

// Debt validators
export const createDebtSchema = z.object({
    creditor: z.string().min(1, 'Tên người cho vay không được để trống'),
    amount: z.number().positive('Số tiền phải lớn hơn 0'),
    description: z.string().optional(),
    dueDate: z.string().datetime('Ngày đến hạn không hợp lệ').optional(),
    status: z.enum(['pending', 'paid', 'overdue']).default('pending'),
});

export const updateDebtSchema = createDebtSchema.partial();

export type CreateDebtInput = z.infer<typeof createDebtSchema>;
export type UpdateDebtInput = z.infer<typeof updateDebtSchema>;
