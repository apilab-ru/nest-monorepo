import { HttpService, Injectable } from '@nestjs/common';
import { URLSearchParams } from 'url';
import { map, take } from 'rxjs/operators';
import { Film, FilmsItem, SearchRequestResult, Genre, GenresResult, TvItem } from '../api';
import { forkJoin, Observable, Subject } from 'rxjs';
import { EFilmsSortBy, EOrderType, FilmsChips } from './interface';
const fs = require('fs');

@Injectable()
export class FilmsService {

  private readonly endpoint = 'https://api.themoviedb.org/3/';
  private readonly key = '22158161569e7320363684f9683f4953';

  private readonly imageHost = 'https://image.tmdb.org/t/p/w500';
  private readonly baseFilterFilms = {
    include_adult: false,
    page: 1
  };

  constructor(
    private readonly httpService: HttpService,
  ){}

  searchMovie(
    query: string, chips?: FilmsChips, orderField?: EFilmsSortBy, orderType: EOrderType = EOrderType.desc
  ): Observable<SearchRequestResult<Film>> {
    const params = {
      ...this.baseFilterFilms,
      query,
      ...chips
    };
    if (orderField) {
      params['sort_by'] = orderField + '.' + orderType;
    }
    const url = query ? 'search/movie' : 'discover/movie';
    return this.requestToApi<SearchRequestResult<FilmsItem>>(url, params)
      .pipe(
        map(result => {
          return {
            ...result,
            results: result.results.map(item => this.convertFilm(item))
          };
        }),
        map(result => {
          if (result.total_results > 1) {
            //result.results.sort(this.sortByPopularity);
            result.results.sort(this.sortFilmByRelation(query))
          }
          return result;
        })
      );
  }

  searchTv(
    query: string, chips?: FilmsChips, orderField?: EFilmsSortBy, orderType: EOrderType = EOrderType.desc
  ): Observable<SearchRequestResult<Film>> {
    const params = {
      ...this.baseFilterFilms,
      query,
      ...chips
    };
    if (orderField) {
      params['sort_by'] = orderField + '.' + orderType;
    }
    const url = query ? 'search/tv' : 'discover/tv';
    return this.requestToApi<SearchRequestResult<TvItem>>(url, params)
      .pipe(
        map(result => {
          return {
            ...result,
            results: result.results.map(item => this.convertTv(item))
          };
        }),
        map(result => {
          if (result.total_results > 1) {
            //result.results.sort(this.sortByPopularity);
            result.results.sort(this.sortFilmByRelation(query));
          }
          return result;
        })
      );
  }

  loadGenres(): Observable<Genre[]> {
    return forkJoin(
      this.requestToApi<GenresResult>('genre/movie/list'),
      this.requestToApi<GenresResult>('genre/tv/list')
    ).pipe(
      map(([movie, tv]) => {
        return [
          ...movie.genres,
          ...tv.genres
        ]
        .map(item => ({
          id: item.id,
          name: this.upperName(item.name)
        }))
        .filter((value, index, list) => list.findIndex(it => it.id === value.id) === index)
        .sort((a, b) => a.name.localeCompare(b.name));
      }),
    )
  }

  saveGenres(list: Genre[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.writeFile("cache/genres-film.json", JSON.stringify(list), err => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  getGenres(): Observable<Genre[]> {
    const list$ = new Subject<Genre[]>();
    this.getGenresFromCache()
      .then(list => list$.next(list))
      .catch(() => this.loadGenres().subscribe(list => {
        list$.next(list);
        this.saveGenres(list);
      }));
    return list$.asObservable().pipe(take(1));
  }

  requestToApi<T>(path: string, args = {}): Observable<T> {
    const params = new URLSearchParams();
    params.append('api_key', this.key);
    params.append('language', 'ru-Ru');

    for (const key in args) {
      params.append(key, args[key]);
    }
    const url = this.endpoint + path + '?' + params.toString();

    return this.httpService.get<T>(url)
      .pipe(
        map(response => response.data),
      );
  }

  private getGenresFromCache(): Promise<Genre[]> {
    return new Promise((resolve, reject) => {
      fs.readFile("cache/genres-film.json", null, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(data));
        }
      });
    });
  }

  private upperName(name: string): string {
    return name.substr(0, 1).toUpperCase() + name.substr(1);
  }

  private sortFilmByRelation(query: string) {
    return (a: Film, b: Film): number => {
      if (a.title === query) {
        return 1;
      }
      if (b.title === query) {
        return 1;
      }
      return 0;
    }
  }

  private convertFilm(item: FilmsItem): Film {
    return {
      title: item.title,
      genre_ids: item.genre_ids,
      original_title: item.original_title,
      date: item.release_date,
      year: this.getYear(item.release_date),
      popularity: item.popularity,
      description: item.overview,
      image: item.poster_path ? this.imageHost + item.poster_path : null,
      id: item.id
    };
  }

  private convertTv(item: TvItem): Film {
    return {
      title: item.name,
      genre_ids: item.genre_ids,
      original_title: item.original_name,
      date: item.first_air_date,
      year: this.getYear(item.first_air_date),
      popularity: item.popularity,
      description: item.overview,
      image: item.poster_path ? this.imageHost + item.poster_path : null,
      id: item.id
    };
  }

  private getYear(date: string): number {
    if (!date) {
      return null;
    }
    return +date.split('-')[0];
  }

  // TODO research what the fuck not working
  private sortByPopularity(a: Film, b: Film): number {
    return a.popularity === b.popularity ? 0
      : (a.popularity > b.popularity ? -1 : 1);
  }

}
