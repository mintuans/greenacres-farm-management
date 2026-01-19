import { IRepository } from '../../core/interfaces/IRepository';
import { Season } from '../entities/Season';

export interface ISeasonRepository extends IRepository<Season> {
    findByStatus(status: string): Promise<Season[]>;
    findActive(): Promise<Season | null>;
    getStats(): Promise<any>;
    getNextCode(): Promise<string>;
    closeSeason(id: string): Promise<Season | null>;
}
