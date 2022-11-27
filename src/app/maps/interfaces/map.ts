export enum OrderField {
    createdAt = 'maps.createdAt',
    minNps = 'maps.minNps',
    maxNps = 'maps.maxNps',
    bpm = 'maps.bpm',
    score = 'JSON_EXTRACT(maps.stats, "$.score")',
}
