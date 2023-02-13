import { SearchRequest } from '../models';

export enum EFilmsSortBy {
  voteAverage = 'vote_average',
  popularity = 'popularity'
}

export enum EOrderType {
  asc = 'asc',
  desc = 'desc'
}

export interface FilmsChips {
  primary_release_year: string;
  with_genres: string;
  with_people: string;
}

export interface FilmsSearchQuery {
  name: string;
}

export interface FilmSearchParams extends SearchRequest {
  kinopoiskId?: number;
  imdbId?: number;
}
