import { Item } from './base';

export interface Anime extends Item {
}

export interface AnimeRequestResponse {
  data: SmotretAnimeResponseItem[];
}

export interface SmotretAnimeResponseItem {
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
  myAnimeListScore: number;
  myAnimeListId: number;
  aniDbId: number;
  url: string;
  type: LibraryItemType;
  year: number;
  episodes: {
    countViews: number;
    episodeFull: string;
    episodeInt: string;
    episodeTitle: string;
    episodeType: string;
    firstUploadedDateTime: string; //"2015-02-10 23:33:03"
    id: number;
    isActive: number;
    isFirstUploaded: number;
    seriesId: number;
  }[];
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

export enum LibraryItemType {
  tv = 'tv',
  movie = 'movie',
  special = 'special',
  ova = 'ova',
  ona = 'ona',
}

export interface AnimeGenre {
  id: number;
  title: string;
  url: string;
}
