import { MapStat } from "../../../../../../libs/bsab-shared/src/maps/interfaces/map";
import { Difficulty } from "@bsab/api/map/difficulty";

export enum UploaderType {
    DISCORD = 'DISCORD',
    SIMPLE = 'SIMPLE',
}

export interface MapDifficult {
    njs: number;
    offset: number; // float
    notes: number;
    bombs: number;
    obstacles: number;
    nps: number; // float
    length: number;
    characteristic: 'Standard';
    difficulty: Difficulty;
    events: number;
    chroma: false;
    me: boolean;
    ne: boolean;
    cinema: boolean;
    seconds: number;
    paritySummary: {
        errors: number;
        warns: number;
        resets: number
    };
}

export interface MapVersion {
    hash: string;
    state: 'Published';
    createdAt: string;
    sageScore: number;
    diffs: MapDifficult[];
    downloadURL: string;
    coverURL: string;
    previewURL: string;
}

export interface Author {
    id: number;
    name: string;
    hash: string;
    avatar: string;
    type: UploaderType;
    curator: boolean;
}

export interface BeatSaverItem {
    id: string;
    name: string;
    description: string;
    uploader: Author;
    metadata: {
        bpm: number;
        duration: number;
        songName: string;
        songSubName: string;
        songAuthorName: string;
        levelAuthorName: string;
    };
    stats: MapStat;
    uploaded: string; // 2022-03-19T18:25:18.127047Z;
    automapper: boolean;
    ranked: boolean;
    qualified: boolean;
    versions: MapVersion[];
    createdAt: string;
    updatedAt: string;
    lastPublishedAt: string;
    tags: string[];
}
