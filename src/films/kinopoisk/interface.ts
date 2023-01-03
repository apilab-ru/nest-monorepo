import { KinopoiskFilmType } from './const';

export interface KinopoiskGenreItem {
  genre: string;
}

export interface KinopoiskCountry {
  country: string;
}

export interface KinopoiskSearchResponse {
  pagesCount: number;
  searchFilmsCountResult: number;
  films: KinopoiskSearchItemResponse[];
}

export interface KinopoiskSearchItemResponse {
  'filmId': number;
  'nameRu': string;
  'nameEn': string;
  'type': KinopoiskFilmType,
  'year': string;
  'description': string;
  'countries': KinopoiskCountry[],
  'genres': KinopoiskGenreItem[],
  'rating': string | 'null',
  'ratingVoteCount': number,
  'posterUrl': string,
  'posterUrlPreview': string
}

export interface KinopoiskDetailItem {
  'kinopoiskId': number,
  'imdbId': string,
  'nameRu': string,
  'nameEn': string,
  'nameOriginal': string,
  'posterUrl': string,
  'posterUrlPreview': string,
  'coverUrl': string,
  'logoUrl': string,
  'reviewsCount': number,
  'ratingGoodReview': number,
  'ratingGoodReviewVoteCount': number,
  'ratingKinopoisk': number,
  'ratingKinopoiskVoteCount': number,
  'ratingImdb': number,
  'ratingImdbVoteCount': number,
  'ratingFilmCritics': number,
  'ratingFilmCriticsVoteCount': number,
  'ratingAwait': number,
  'ratingAwaitCount': number,
  'ratingRfCritics': number,
  'ratingRfCriticsVoteCount': number,
  'webUrl': string,
  'year': string,
  'filmLength': number,
  'slogan': string,
  'description': string
  'shortDescription': string
  'editorAnnotation': string,
  'isTicketsAvailable': false,
  'productionStatus': 'POST_PRODUCTION',
  'type': KinopoiskFilmType,
  'ratingMpaa': 'r',
  'ratingAgeLimits': 'age16',
  'hasImax': boolean,
  'has3D': boolean,
  'lastSync': string,
  'countries': KinopoiskCountry[],
  'genres': KinopoiskGenreItem[],
  'startYear': number,
  'endYear': number,
  'serial': false,
  'shortFilm': false,
  'completed': false
}

export interface KinopoiskSearchShortResult {
  total: number;
  items: KinopoiskSearchShortItemResult[];
}

export interface KinopoiskSearchShortItemResult {
  'kinopoiskId': number,
  'imdbId': string
  'nameRu': string
  'nameEn': string
  'nameOriginal': string
  'countries': KinopoiskCountry[],
  'genres': KinopoiskGenreItem[];
  'ratingKinopoisk': number | null,
  'ratingImdb': number | null,
  'year': string,
  'type': KinopoiskFilmType,
  'posterUrl': string,
  'posterUrlPreview': string
}

export interface KinopoiskSearchParams {
  genres?: number;
  keyword?: string;
  page?: number;
  imdbId?: string;
  yearFrom?: number;
  yearTo?: number;
  ratingFrom?: number;
  ratingTo?: number;
  type?: KinopoiskFilmType;
}
