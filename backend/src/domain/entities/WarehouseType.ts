export interface WarehouseType {
    id: string;
    type_name: string;
    description?: string;
    created_at?: Date;
}

export interface CreateWarehouseTypeDTO {
    type_name: string;
    description?: string;
}

export interface UpdateWarehouseTypeDTO {
    type_name?: string;
    description?: string;
}
