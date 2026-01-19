import { injectable, inject } from 'inversify';
import { ISeasonRepository } from '../repositories/ISeasonRepository';
import { Season, CreateSeasonDTO, UpdateSeasonDTO } from '../entities/Season';
import { TYPES } from '../../core/types';

@injectable()
export class SeasonService {
    constructor(
        @inject(TYPES.ISeasonRepository) private seasonRepo: ISeasonRepository
    ) { }

    async getSeason(id: string): Promise<Season | null> {
        if (!id || id.trim() === '') {
            throw new Error('Season ID is required');
        }
        return this.seasonRepo.findById(id);
    }

    async getAllSeasons(): Promise<Season[]> {
        return this.seasonRepo.findAll();
    }

    async getActiveSeason(): Promise<Season | null> {
        return this.seasonRepo.findActive();
    }

    async getSeasonsByStatus(status: string): Promise<Season[]> {
        if (!status || status.trim() === '') {
            throw new Error('Status is required');
        }
        return this.seasonRepo.findByStatus(status);
    }

    async createSeason(data: CreateSeasonDTO): Promise<Season> {
        if (!data.season_name || data.season_name.trim() === '') {
            throw new Error('Season name is required');
        }
        if (!data.start_date) {
            throw new Error('Start date is required');
        }
        if (!data.status) {
            throw new Error('Status is required');
        }
        return this.seasonRepo.create(data);
    }

    async updateSeason(id: string, data: UpdateSeasonDTO): Promise<Season | null> {
        if (!id || id.trim() === '') {
            throw new Error('Season ID is required');
        }
        const existing = await this.seasonRepo.findById(id);
        if (!existing) {
            throw new Error(`Season with ID '${id}' not found`);
        }
        return this.seasonRepo.update(id, data);
    }

    async deleteSeason(id: string): Promise<boolean> {
        if (!id || id.trim() === '') {
            throw new Error('Season ID is required');
        }
        const existing = await this.seasonRepo.findById(id);
        if (!existing) {
            throw new Error(`Season with ID '${id}' not found`);
        }
        return this.seasonRepo.delete(id);
    }

    async getSeasonStats(): Promise<any> {
        return this.seasonRepo.getStats();
    }

    async getNextSeasonCode(): Promise<string> {
        return this.seasonRepo.getNextCode();
    }

    async closeSeason(id: string): Promise<Season | null> {
        if (!id || id.trim() === '') {
            throw new Error('Season ID is required');
        }
        const existing = await this.seasonRepo.findById(id);
        if (!existing) {
            throw new Error(`Season with ID '${id}' not found`);
        }
        return this.seasonRepo.closeSeason(id);
    }
}
