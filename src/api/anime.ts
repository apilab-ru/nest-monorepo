import { Item } from './base';

export interface Anime extends Item {
  genre_ids: number[];
  original_title: string;
  type: AnimeType;
  year: number;
  popularity: number;
}

export interface AnimeRequestResponse {
  data: AnimeResponseItem[];
}

export interface AnimeResponseItem {
  id: number;
  titles: {
    ru: string;
    en: string;
    ja: string;
    romaji: string;
    short: string;
  },
  posterUrl: string;
  descriptions: AnimeDescription[];
  genres: AnimeGenre[];
  worldArtScore: number;
  type: AnimeType;
  year: number;
}

export interface AnimeDescription {
  source: AnimeDescriptionSource;
  value: string;
  updatedDateTime: string; //2017-12-17 21:22:27
}

export enum AnimeDescriptionSource {
  shikimori = 'shikimori.org',
  word_art = 'world-art.ru',
  anime_365 = 'Anime 365',
  word_of_anime = 'Word of anime'
}

export enum AnimeType {
  tv = 'tv',
  movie = 'movie',
  special = 'special',
  ova = 'ova'
}

export interface AnimeGenre {
  id: number;
  title: string;
  url: string;
}
