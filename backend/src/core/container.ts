import { Container } from 'inversify';
import 'reflect-metadata';
import { TYPES } from './types';

// ========== INTERFACES ==========
import { IDatabase } from './interfaces/IDatabase';
import { IPartnerRepository } from '../domain/repositories/IPartnerRepository';
import { IWorkScheduleRepository } from '../domain/repositories/IWorkScheduleRepository';
import { IInventoryRepository } from '../domain/repositories/IInventoryRepository';
import { ITransactionRepository } from '../domain/repositories/ITransactionRepository';
import { ISeasonRepository } from '../domain/repositories/ISeasonRepository';
import { IPayrollRepository } from '../domain/repositories/IPayrollRepository';
import { IJobTypeRepository } from '../domain/repositories/IJobTypeRepository';
import { IWorkShiftRepository } from '../domain/repositories/IWorkShiftRepository';
import { IWarehouseTypeRepository } from '../domain/repositories/IWarehouseTypeRepository';

// ========== IMPLEMENTATIONS ==========
// Database
import { PostgresDatabase } from '../infrastructure/database/PostgresDatabase';

// Repositories
import { PartnerRepository } from '../infrastructure/database/repositories/PartnerRepository';
import { WorkScheduleRepository } from '../infrastructure/database/repositories/WorkScheduleRepository';
import { InventoryRepository } from '../infrastructure/database/repositories/InventoryRepository';
import { TransactionRepository } from '../infrastructure/database/repositories/TransactionRepository';
import { SeasonRepository } from '../infrastructure/database/repositories/SeasonRepository';
import { PayrollRepository } from '../infrastructure/database/repositories/PayrollRepository';
import { JobTypeRepository } from '../infrastructure/database/repositories/JobTypeRepository';
import { WorkShiftRepository } from '../infrastructure/database/repositories/WorkShiftRepository';
import { WarehouseTypeRepository } from '../infrastructure/database/repositories/WarehouseTypeRepository';

// Services
import { PartnerService } from '../domain/services/PartnerService';
import { WorkScheduleService } from '../domain/services/WorkScheduleService';
import { InventoryService } from '../domain/services/InventoryService';
import { TransactionService } from '../domain/services/TransactionService';
import { SeasonService } from '../domain/services/SeasonService';
import { PayrollService } from '../domain/services/PayrollService';
import { JobTypeService } from '../domain/services/JobTypeService';
import { WorkShiftService } from '../domain/services/WorkShiftService';
import { WarehouseTypeService } from '../domain/services/WarehouseTypeService';

// Controllers
import { PartnerController } from '../presentation/controllers/PartnerController';
import { WorkScheduleController } from '../presentation/controllers/WorkScheduleController';
import { InventoryController } from '../presentation/controllers/InventoryController';
import { TransactionController } from '../presentation/controllers/TransactionController';
import { SeasonController } from '../presentation/controllers/SeasonController';
import { PayrollController } from '../presentation/controllers/PayrollController';
import { JobTypeController } from '../presentation/controllers/JobTypeController';
import { WorkShiftController } from '../presentation/controllers/WorkShiftController';
import { WarehouseTypeController } from '../presentation/controllers/WarehouseTypeController';

/**
 * Dependency Injection Container
 * Quản lý tất cả dependencies trong ứng dụng
 */
const container = new Container();

/**
 * Configure DI Container với tất cả bindings
 */
export function configureContainer(): void {
    console.log('🔧 Configuring DI Container...');

    // ========== DATABASE ==========
    container.bind<IDatabase>(TYPES.IDatabase)
        .to(PostgresDatabase)
        .inSingletonScope();

    // ========== REPOSITORIES ==========
    container.bind<IPartnerRepository>(TYPES.IPartnerRepository).to(PartnerRepository);
    container.bind<IWorkScheduleRepository>(TYPES.IWorkScheduleRepository).to(WorkScheduleRepository);
    container.bind<IInventoryRepository>(TYPES.IInventoryRepository).to(InventoryRepository);
    container.bind<ITransactionRepository>(TYPES.ITransactionRepository).to(TransactionRepository);
    container.bind<ISeasonRepository>(TYPES.ISeasonRepository).to(SeasonRepository);
    container.bind<IPayrollRepository>(TYPES.IPayrollRepository).to(PayrollRepository);
    container.bind<IJobTypeRepository>(TYPES.IJobTypeRepository).to(JobTypeRepository);
    container.bind<IWorkShiftRepository>(TYPES.IWorkShiftRepository).to(WorkShiftRepository);
    container.bind<IWarehouseTypeRepository>(TYPES.IWarehouseTypeRepository).to(WarehouseTypeRepository);

    // ========== SERVICES ==========
    container.bind<PartnerService>(TYPES.PartnerService).to(PartnerService);
    container.bind<WorkScheduleService>(TYPES.WorkScheduleService).to(WorkScheduleService);
    container.bind<InventoryService>(TYPES.InventoryService).to(InventoryService);
    container.bind<TransactionService>(TYPES.TransactionService).to(TransactionService);
    container.bind<SeasonService>(TYPES.SeasonService).to(SeasonService);
    container.bind<PayrollService>(TYPES.PayrollService).to(PayrollService);
    container.bind<JobTypeService>(TYPES.JobTypeService).to(JobTypeService);
    container.bind<WorkShiftService>(TYPES.WorkShiftService).to(WorkShiftService);
    container.bind<WarehouseTypeService>(TYPES.WarehouseTypeService).to(WarehouseTypeService);

    // ========== CONTROLLERS ==========
    container.bind<PartnerController>(TYPES.PartnerController).to(PartnerController);
    container.bind<WorkScheduleController>(TYPES.WorkScheduleController).to(WorkScheduleController);
    container.bind<InventoryController>(TYPES.InventoryController).to(InventoryController);
    container.bind<TransactionController>(TYPES.TransactionController).to(TransactionController);
    container.bind<SeasonController>(TYPES.SeasonController).to(SeasonController);
    container.bind<PayrollController>(TYPES.PayrollController).to(PayrollController);
    container.bind<JobTypeController>(TYPES.JobTypeController).to(JobTypeController);
    container.bind<WorkShiftController>(TYPES.WorkShiftController).to(WorkShiftController);
    container.bind<WarehouseTypeController>(TYPES.WarehouseTypeController).to(WarehouseTypeController);

    console.log('✅ DI Container configured successfully');
    console.log('📦 Registered:');
    console.log('   - 1 Database');
    console.log('   - 9 Repositories');
    console.log('   - 9 Services');
    console.log('   - 9 Controllers');
    console.log('   - Total: 28 bindings');
}

export { container };
