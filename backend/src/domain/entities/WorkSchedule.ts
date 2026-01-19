/**
 * WorkSchedule Domain Entity
 */
export interface WorkSchedule {
    id: string;
    partner_id: string;
    shift_id: string;
    job_type_id: string;
    work_date: string;
    status: string;
    note?: string;
    season_id?: string;
    created_at?: Date;
    updated_at?: Date;
    // Joined fields from relations
    partner_name?: string;
    shift_name?: string;
    job_name?: string;
    season_name?: string;
}

/**
 * DTO for creating WorkSchedule
 */
export interface CreateWorkScheduleDTO {
    partner_id: string;
    shift_id: string;
    job_type_id: string;
    work_date: string;
    status: string;
    note?: string;
    season_id?: string;
}

/**
 * DTO for updating WorkSchedule
 */
export interface UpdateWorkScheduleDTO {
    partner_id?: string;
    shift_id?: string;
    job_type_id?: string;
    work_date?: string;
    status?: string;
    note?: string;
    season_id?: string;
}
