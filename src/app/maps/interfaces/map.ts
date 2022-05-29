export enum Difficulty {
    expertPlus = 'ExpertPlus',
    expert = 'Expert',
    hard = 'Hard',
    normal = 'Normal',
    easy = 'Easy',
}

export enum OrderField {
    createdAt = 'maps.createdAt',
    minNps = 'maps.minNps',
    maxNps = 'maps.maxNps',
    bpm = 'maps.bpm',
    score = 'JSON_EXTRACT(maps.stats, "$.score")',
}

export interface DifficultyDetail {
    difficulty: Difficulty;
    notes: number;
    bombs: number;
    obstacles: number;
    nps: number; // float
    length: number;
    cinema: boolean;
    seconds: number;
}

export interface MapStat {
    plays: number;
    downloads: number;
    upvotes: number;
    downvotes: number;
    score: number;
}

export interface Map {
    id: string;
    name: string;
    description: string;
    author: number;
    bpm: number;
    duration: number;
    songName: string;
    songSubName: string;
    songAuthorName: string;
    difs: Difficulty[];
    difsDetails: DifficultyDetail[];
    tags: number[];
    stats: MapStat;
    uploaded: Date;
    automapper: boolean;
    ranked: boolean;
    qualified: boolean;
    createdAt: string;
    updatedAt: string;
    lastPublishedAt: string;
    showed: boolean;
    downloadURL: string;
    coverURL: string;
    soundURL: string;
}
