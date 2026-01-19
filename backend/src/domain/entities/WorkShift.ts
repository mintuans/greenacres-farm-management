export interface WorkShift {
    id: string;
    shift_name: string;
    start_time: string;
    end_time: string;
    description?: string;
    created_at?: Date;
}

export interface CreateWorkShiftDTO {
    shift_name: string;
    start_time: string;
    end_time: string;
    description?: string;
}

export interface UpdateWorkShiftDTO {
    shift_name?: string;
    start_time?: string;
    end_time?: string;
    description?: string;
}
