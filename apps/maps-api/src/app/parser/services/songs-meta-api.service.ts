import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { config } from "../../config/config";
import { delay, map, Observable, of, switchMap } from "rxjs";
import { DiscSongsPage } from "../interfaces/disc-songs";
import { TagsService } from "@bsab/shared/maps";
import { SongMeta } from "../interfaces/song-meta";
import { environment } from "../../../environments/environment";

// DOCS https://www.discogs.com/developers/#page:database,header:database-search

@Injectable()
export class SongsMetaApiService {
  private config = config.discsongs;

  constructor(
    private httpService: HttpService,
    private tagsService: TagsService,
  ) {
  }

  loadSongMeta(title: string, artist?: string): Observable<SongMeta | null> {
    return this.searchSongs(title, artist).pipe(
      delay(environment.timeout),
      switchMap(({ results }) => {
        if (!results.length) {
          return of(null);
        }

        const result = results[0];

        return this.tagsService.getOrAddTags([
          ...result.genre || [],
          ...result.style || []
        ]).pipe(
          map(tags => ({
            id: result.id,
            tags
          }))
        )
      })
    )
  }

  searchSongs(title: string, artist?: string): Observable<DiscSongsPage> {
    return this.httpService.get<DiscSongsPage>(this.config.url + '/database/search', {
      params: {
        title,
        artist,
        per_page: 1,
        token: this.config.token,
      },
      headers: {
        'Accept-Encoding': 'gzip,deflate,compress',
      }
    }).pipe(
      map(res => this.mapResultData(res.data))
    )
  }

  private mapResultData(result: DiscSongsPage): DiscSongsPage {
    return {
      pagination: result.pagination,
      results: result.results.map(item => ({
        id: item.id,
        title: item.title,
        style: item.style,
        genre: item.genre,
        label: item.label
      }))
    }
  }
}
