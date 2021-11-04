export enum EAnimeSearchTypes {
  tv = 'tv',
  ova = 'ova',
  ona = 'ona',
  movie = 'movie',
  special = 'special',
  music = 'music'
}

export interface AnimeSearchChips {
  type?: string;
  genre?: string;
  studio?: string;
  yearseason?: string;
}

export interface AnimeSearchQuery extends AnimeSearchChips {
  name: string;
}
