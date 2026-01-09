import prisma from '../config/database';
import { CreateSeasonInput, UpdateSeasonInput } from '../validators/season.validator';

export const createSeason = async (userId: string, data: CreateSeasonInput) => {
    return prisma.season.create({
        data: {
            ...data,
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : undefined,
            userId,
        },
    });
};

export const getSeasons = async (userId: string) => {
    return prisma.season.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
};

export const getSeasonById = async (id: string, userId: string) => {
    return prisma.season.findFirst({
        where: { id, userId },
    });
};

export const updateSeason = async (id: string, userId: string, data: UpdateSeasonInput) => {
    return prisma.season.update({
        where: { id, userId },
        data: {
            ...data,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate ? new Date(data.endDate) : undefined,
        },
    });
};

export const deleteSeason = async (id: string, userId: string) => {
    return prisma.season.delete({
        where: { id, userId },
    });
};
