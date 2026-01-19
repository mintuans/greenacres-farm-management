export interface Season {
    id: string;
    season_name: string;
    start_date: string;
    end_date?: string;
    status: 'ACTIVE' | 'COMPLETED' | 'PLANNED';
    description?: string;
    created_at?: Date;
}

export interface CreateSeasonDTO {
    season_name: string;
    start_date: string;
    end_date?: string;
    status: 'ACTIVE' | 'COMPLETED' | 'PLANNED';
    description?: string;
}

export interface UpdateSeasonDTO {
    season_name?: string;
    start_date?: string;
    end_date?: string;
    status?: 'ACTIVE' | 'COMPLETED' | 'PLANNED';
    description?: string;
}
