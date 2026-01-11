// import prisma from '../config/database';
// import { CreateDebtInput, UpdateDebtInput } from '../validators/debt.validator';

// export const createDebt = async (userId: string, data: CreateDebtInput) => {
//     return prisma.debt.create({
//         data: {
//             ...data,
//             dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
//             userId,
//         },
//     });
// };

// export const getDebts = async (userId: string) => {
//     return prisma.debt.findMany({
//         where: { userId },
//         orderBy: { createdAt: 'desc' },
//     });
// };

// export const getDebtById = async (id: string, userId: string) => {
//     return prisma.debt.findFirst({
//         where: { id, userId },
//     });
// };

// export const updateDebt = async (id: string, userId: string, data: UpdateDebtInput) => {
//     return prisma.debt.update({
//         where: { id, userId },
//         data: {
//             ...data,
//             dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
//         },
//     });
// };

// export const deleteDebt = async (id: string, userId: string) => {
//     return prisma.debt.delete({
//         where: { id, userId },
//     });
// };

// // Calculate total debt
// export const getTotalDebt = async (userId: string) => {
//     const debts = await prisma.debt.findMany({
//         where: {
//             userId,
//             status: { not: 'paid' },
//         },
//     });

//     return debts.reduce((total: number, debt: { amount: number }) => total + debt.amount, 0);
// };
