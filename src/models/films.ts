import { GenreOld, Item } from './base';

export enum Lang {
  en = 'en',
  ru = 'ru'
}

export enum Country {
  US = 'US'
}

export interface GenresResult {
  genres: GenreOld[];
}

export interface Film extends Item {
  date: string;
}

export interface FilmsItem {
  "adult": boolean;
  "backdrop_path": string;
  "genre_ids": number[];
  "id": number;
  "original_language": Lang;
  "original_title": string;
  "overview": string;
  "popularity": number;
  "poster_path": string;
  "release_date": string; // 2016-02-19
  "title": string;
  "video": boolean;
  "vote_average": number;
  "vote_count": number;
}

export interface TvItem {
  "backdrop_path": string;
  "first_air_date": string;
  "genre_ids": number[];
  "id": number;
  "name": string;
  "origin_country": Country[];
  "original_language": Lang;
  "original_name": string;
  "overview": string;
  "popularity": number;
  "poster_path": string;
  "vote_average": number;
  "vote_count": number;
}
