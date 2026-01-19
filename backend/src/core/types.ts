/**
 * Dependency Injection Types
 * Định nghĩa các Symbol để inject dependencies
 */
export const TYPES = {
    // ========== DATABASE ==========
    IDatabase: Symbol.for('IDatabase'),

    // ========== REPOSITORIES ==========
    IPartnerRepository: Symbol.for('IPartnerRepository'),
    IWorkScheduleRepository: Symbol.for('IWorkScheduleRepository'),
    IInventoryRepository: Symbol.for('IInventoryRepository'),
    ITransactionRepository: Symbol.for('ITransactionRepository'),
    ISeasonRepository: Symbol.for('ISeasonRepository'),
    IPayrollRepository: Symbol.for('IPayrollRepository'),
    IJobTypeRepository: Symbol.for('IJobTypeRepository'),
    IWorkShiftRepository: Symbol.for('IWorkShiftRepository'),
    IWarehouseTypeRepository: Symbol.for('IWarehouseTypeRepository'),

    // ========== SERVICES ==========
    PartnerService: Symbol.for('PartnerService'),
    WorkScheduleService: Symbol.for('WorkScheduleService'),
    InventoryService: Symbol.for('InventoryService'),
    TransactionService: Symbol.for('TransactionService'),
    SeasonService: Symbol.for('SeasonService'),
    PayrollService: Symbol.for('PayrollService'),
    JobTypeService: Symbol.for('JobTypeService'),
    WorkShiftService: Symbol.for('WorkShiftService'),
    WarehouseTypeService: Symbol.for('WarehouseTypeService'),

    // ========== CONTROLLERS ==========
    PartnerController: Symbol.for('PartnerController'),
    WorkScheduleController: Symbol.for('WorkScheduleController'),
    InventoryController: Symbol.for('InventoryController'),
    TransactionController: Symbol.for('TransactionController'),
    SeasonController: Symbol.for('SeasonController'),
    PayrollController: Symbol.for('PayrollController'),
    JobTypeController: Symbol.for('JobTypeController'),
    WorkShiftController: Symbol.for('WorkShiftController'),
    WarehouseTypeController: Symbol.for('WarehouseTypeController'),

    // ========== STRATEGIES ==========
    IBackupStrategy: Symbol.for('IBackupStrategy'),
};

