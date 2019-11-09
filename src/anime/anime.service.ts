import { HttpService, Injectable } from '@nestjs/common';
import { URLSearchParams } from 'url';
import { map, take, tap } from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';
import {
  Anime,
  AnimeDescriptionSource,
  AnimeRequestResponse,
  AnimeResponseItem,
  Genre,
  SearchRequestResult,
} from '../api';

const fs = require('fs');

@Injectable()
export class AnimeService {

  private readonly endpoint = 'http://smotret-anime.ru/api/series/';

  constructor(
    private readonly httpService: HttpService,
  ){}

  search(name: string): Observable<SearchRequestResult<Anime>> {
    const params = new URLSearchParams();
    params.append('query', name);
    //params.append('fields', 'titles,id,genres,posterUrl,descriptions');
    const url = this.endpoint + '?' + params.toString();

    return this.httpService.get<AnimeRequestResponse>(url)
      .pipe(
        map(response => response.data.data),
        map(list => list ? list.map(this.convertFromAnimeItem.bind(this)) : []),
        map(list => ({
          results: list as Anime[],
          page: 1,
          total_results: list.length,
          total_pages: 1
        }))
      );
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

  loadGenres(): Observable<Genre[]> {
    const params = new URLSearchParams();
    params.append('fields', 'genres,titles,id');
    params.append('limit', '2000');
    const url = this.endpoint + '?' + params.toString();
    return this.httpService.get<AnimeRequestResponse>(url)
      .pipe(
        map(response => response.data),
        map(data => {
          const genres = {};
          data.data.forEach(item => {
            if (item.genres) {
              item.genres.forEach(it => {
                genres[it.id] = {
                  id: it.id,
                  name: it.title
                };
              });
            }
          });
          const list = [];
          for (const i in genres) {
            list.push(genres[i]);
          }
          return list;
        })
      );
  }

  saveGenres(list: Genre[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.writeFile("cache/genres-anime.json", JSON.stringify(list), err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private getGenresFromCache(): Promise<Genre[]> {
    return new Promise((resolve, reject) => {
      fs.readFile("cache/genres-anime.json", null, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(data));
        }
      });
    });
  }

  private convertFromAnimeItem(item: AnimeResponseItem): Anime {
    return {
      title: item.titles.ru,
      image: item.posterUrl,
      description: this.getDescription(item),
      genre_ids: item.genres ? item.genres.map(genre => genre.id) : [],
      original_title: item.titles.en,
      year: item.year,
      type: item.type,
      popularity: item.worldArtScore,
      id: item.id
    };
  }

  private getDescription(item: AnimeResponseItem): string {
    if (!item.descriptions) {
      return null;
    }
    const base = item.descriptions.find(it => it.source === AnimeDescriptionSource.word_art);
    if (base) {
      return base.value;
    }
    return item.descriptions[0].value;
  }

}