import { SearchRequest } from '@filecab/models';
import { Types } from "@filecab/models/types";

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
