import { z } from 'zod';

// Season validators
export const createSeasonSchema = z.object({
    name: z.string().min(1, 'Tên mùa vụ không được để trống'),
    startDate: z.string().datetime('Ngày bắt đầu không hợp lệ'),
    endDate: z.string().datetime('Ngày kết thúc không hợp lệ').optional(),
    description: z.string().optional(),
    status: z.enum(['active', 'completed', 'cancelled']).default('active'),
});

export const updateSeasonSchema = createSeasonSchema.partial();

export type CreateSeasonInput = z.infer<typeof createSeasonSchema>;
export type UpdateSeasonInput = z.infer<typeof updateSeasonSchema>;
