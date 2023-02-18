import { KinopoiskDevFileds, KinopoiskDevTypes } from "./const";

export interface KinopoiskDevShortItem {
  externalId: {
    kpHD: string | null,
    imdb: string | null, // tt0942385
    tmdb: number | null,
    _id: string
  },
  logo: { url: null | string },
  poster: {
    url: string,
    previewUrl: string
  },
  rating: {
    kp: number,
    imdb: number,
    filmCritics: number,
    russianFilmCritics: number,
    await: number,
  },
  votes: {
    kp: number,
    imdb: number,
    filmCritics: number,
    russianFilmCritics: number,
    await: number,
  },
  id: number,
  type: KinopoiskDevTypes,
  name: string,
  description: string,
  year: number,
  alternativeName: string,
  enName: string | null,
  names: { _id: string, name: string }[],
  movieLength: number,
  shortDescription: null,
  releaseYears: []
}

export interface KinopoiskDevDetails extends KinopoiskDevShortItem {
  "backdrop": {
    "url": string,
    "previewUrl": string,
  },
  "videos": {
    "trailers": {
      "_id": string,
      "url": string,
      "name": string,
      "site": string, // "kinopoisk_widget" | "youtube"
    }[],
    "teasers": []
  },
  "budget": {
    "value": number,
    "currency": string
  },
  "fees": {
    "world": {
      "value": number,
      "currency": string
    },
    "russia": {
      "value": number,
      "currency": string
    },
  },
  "distributors": {
    "distributor": string,
    "distributorRelease": string
  },
  "premiere": {
    "country": string,
    "world": string,
    "russia": string,
    "cinema": string,
    "digital": string,
    "dvd": string,
    "bluray": string
  },
  "watchability": {
    "items": {
      "logo": {
        "url": string,
      },
      "name": string,
      "url": string,
    }[],
  },
  "collections": [],
  "updateDates": string[],
  "slogan": string,
  "facts": {
    "value": string,
    "type": string,
    "spoiler": boolean
  }[],
  "genres": { name: string }[],
  "countries": { name: string }[],
  "persons": {
    "id": number,
    "photo": string,
    "name": string,
    "enName": string,
    "enProfession": string
  }[],
  "lists": [],
  "spokenLanguages": [],
  "productionCompanies": [],
  "ageRating": number,
  "ratingMpaa": "r",
  "technology": {
    "hasImax": boolean,
    "has3D": boolean
  },
  "ticketsOnSale": boolean,
  "updatedAt": string,
  "similarMovies": {
    "id": number,
    "name": string,
    "enName": string,
    "alternativeName": string,
    "type": KinopoiskDevTypes,
    "poster": {
      "url": string,
      "previewUrl": string,
    },
  }[],
  "sequelsAndPrequels": [],
  "top10": null,
  "top250": null,
  "status": null,
  "createDate": string,
  "releaseYears": [],
  seasonsInfo: {
    number: number;
    episodesCount: number;
  }[]
}

export interface KinopoiskDevResponse {
  docs: KinopoiskDevShortItem[];
  total: 1;
  limit: 10
  page: 1
  pages: 1;
}

export interface KinopoiskDevRequestSearch {
  field: KinopoiskDevFileds | keyof typeof KinopoiskDevFileds;
  search: string | number;
}

export interface KinopoiskDevPagination {
  page: number;
  limit: number;
  sortField: string;
  sortType: KinopoiskDevPaginationOrder;
}

export enum KinopoiskDevPaginationOrder {
  asc = 1,
  desc = -1,
}
