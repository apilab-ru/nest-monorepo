import { GenreKind } from '../genres/const';
import { LibraryItemType } from '../models';

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
  year?: string;
}

export interface AnimeSearchQuery extends AnimeSearchChips {
  name?: string;
  limit?: number;
  page?: number;
  id?: number;
}

export interface AnimeSearchV2Query {
  name: string;
  page?: number;
  limit?: number;
}

export interface ShikimoriItem {
  id: 693,
  name: string,
  russian: string,
  image: {
    original: string,
    preview: string,//"/system/animes/preview/693.jpg?1634710483",
    x96: string,
    x48: string,
  },
  url: string, // "/animes/693-burn-up-scramble",
  kind: string, //"tv",
  score: string, // "6.19",
  status: string; // "released",
  episodes: number;
  episodes_aired: number;
  aired_on: string; // "2004-01-12"
  released_on: string; // "2004-03-29"
}

export interface ShikimoriDetailItem {
  id: number,
  name: string,
  russian: string,
  image: {
    original: string, //225x319
    preview: string, //160x227
    x96: string,
    x48: string
  },
  url: string,
  kind: LibraryItemType,
  score: string,
  status: string;//"released",
  episodes: number,
  episodes_aired: number,
  aired_on: string; //"2016-04-09",
  released_on: string;
  rating: string; //"pg_13",
  english: string[],
  japanese: string[],
  synonyms: string[],
  license_name_ru: string | null,
  duration: number,
  description: string | null;
  franchise: string,
  favoured: boolean,
  anons: boolean,
  ongoing: boolean,
  thread_id: number,
  topic_id: number,
  myanimelist_id: number,
  rates_scores_stats: {
    name: number,
    value: number
  }[],
  updated_at: string; //"2021-12-10T20:53:50.897+03:00",
  next_episode_at: string | null,
  fansubbers: string[],
  fandubbers: string[],
  licensors: string[],
  genres: ShikimoriGenre[],
  studios:
    {
      id: number,
      name: string,
      filtered_name: string,
      real: boolean,
      image: string
    }[],
  videos: {
    id: number,
    url: string,
    image_url: string,
    player_url: string,
    name: string,
    kind: string,
    hosting: string
  }[],
  screenshots: {
    original: string,
    preview: string
  }[],
  user_rate: null
}

export interface ShikimoriGenre {
  id: number;
  name: string;
  russian: string;
  kind: GenreKind;
}
