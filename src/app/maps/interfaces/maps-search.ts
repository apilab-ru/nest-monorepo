export enum OrderDirection {
    asc = 'ASC',
    desc = 'DESC',
}

export interface BaseSearch {
    limit: number;
    offset: number;
    orderField?: string;
    orderDirection?: OrderDirection;
}

export interface MapsSearch extends BaseSearch {
    tagsPositive?: string;
    tagsNegative?: string;
    search?: string;
    npsFrom?: string;
    npsTo?: string;
    dateFrom?: string;
    showed: boolean;
}
