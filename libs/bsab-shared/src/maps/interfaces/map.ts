import { Difficulty } from '@bsab/api/map/difficulty';

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
