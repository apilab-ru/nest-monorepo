import { MediaItem } from '@filecab/models';

export const CHIPS = {
  year: 'yearseason',
};

export const CUSTOM_FIELDS = {
  shikimoriId: 'myAnimeListId',
  smotretId: 'id',
};

export const SAVE_FIELDS: Partial<keyof MediaItem>[] = [
  'shikimoriId',
  'imdbId',
  'smotretId',
];

export const FILTER_GENRES = [
  46, // удостоенно наград
  50, // взрослые сею
];

export const GENRES_CONVERT = {
  54: 17, // Боевые искусства
  74: 30, // Романтический подтекст,
  77: 30, // Командный спорт
  79: 11, // Игры
};
