import { LibraryItemType } from "@filecab/models";

export enum KinopoiskDevFileds {
  kinopoiskId = 'id',
  imdbId = 'externalId.imdbId',
  tmdb = 'externalId.tmdb',
  name = 'name',
  originalName = 'alternativeName',
  year = 'year',
  type = 'type',
}

export enum KinopoiskDevTypes {
  movie = 'movie',
  tv = 'tv-series',
  carton = 'cartoon',
  anime = 'anime',
  animeTv = 'animated-series',
  tvShow = 'tv-show',
}

export const KINOPOISK_DEV_FILM_TYPE_MAP: Record<KinopoiskDevTypes, LibraryItemType> = {
  [KinopoiskDevTypes.movie]: LibraryItemType.movie,
  [KinopoiskDevTypes.tv]: LibraryItemType.tv,
  [KinopoiskDevTypes.tvShow]: LibraryItemType.tv,
  [KinopoiskDevTypes.carton]: LibraryItemType.movie,
  [KinopoiskDevTypes.anime]: LibraryItemType.movie,
  [KinopoiskDevTypes.animeTv]: LibraryItemType.tv,
};
