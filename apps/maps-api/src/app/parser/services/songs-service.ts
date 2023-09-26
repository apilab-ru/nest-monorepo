import { Injectable } from "@nestjs/common";
import { MapsService } from "@bsab/shared/maps";
import { combineLatest, from, map, Observable, of, switchMap, tap } from "rxjs";
import { SongsMetaApiService } from "./songs-meta-api.service";
import { And, Connection, IsNull, LessThan, MoreThan, Not, Repository } from "typeorm";
import { SongEntity } from "../entites/song.entity";
import { BandEntity } from "../entites/band.entity";
import { MapEntity } from "@bsab/shared/maps/entites/mapEntity";
import { SettingsService } from "@bsab/shared/settings/services/settings-service";

interface SongMinimal extends Omit<SongEntity, 'id' | 'discId'> {
}

interface MapWithSong extends SongMinimal {
  mapItem: MapEntity;
}

@Injectable()
export class SongsService {
  private songRepo: Repository<SongEntity>;
  private bandsRepo: Repository<BandEntity>;

  constructor(
    private mapsService: MapsService,
    private songsApiService: SongsMetaApiService,
    private settingsService: SettingsService,
    connection: Connection,
  ) {
    this.songRepo = connection.getRepository(SongEntity);
    this.bandsRepo = connection.getRepository(BandEntity);
  }

  private prepareName(name?: string): string | null {
    if (!name || !name.trim()) {
      return null;
    }

    return name.trim().toLocaleLowerCase();
  }

  loadSongs(): Observable<any> {
    return from(this.songRepo.find({
      take: 20,
      where: {
        discId: IsNull()
      }
    })).pipe(
      switchMap(list => combineLatest(list.map(item => this.songsApiService.loadSongMeta(item.name, item.band))).pipe(
        map(results => {
          return list.map((item, index) => {
            const meta = results[index];

            return {
              ...item,
              discId: !meta ? 0 : meta.id,
              newTags: !meta ? undefined : this.newTags(item.tags, meta.tags),
            }
          })
        }),
        switchMap(results => {
          this.settingsService.updateSettings('parseSongs', results);

          const updatedSongsWithTags = results.filter(item => item.newTags?.length).map(song => ({
            ...song,
            tags: [...song.tags, ...song.newTags]
          }));

          const skippedSongs = results.filter(item => !item.newTags?.length);

          return combineLatest([
            this.songRepo.save(skippedSongs),
            ...updatedSongsWithTags.map(song => this.updateSongWithTag(song))
          ]).pipe(
            map(() => ({
              updatedSongsWithTags
            }))
          )
        }),
      ))
    )
  }

  private updateSongWithTag(song: SongEntity): Observable<void> {
    return combineLatest([
      from(this.songRepo.save(song)).pipe(
        map(() => {})
      ),
      from(
        this.mapsService.loadSource({
          where: {
            songId: song.id
          }
        })
      ).pipe(
        map(maps => maps.map(item => ({
          ...item,
          tags: [
            ...item.tags,
            ...this.newTags(item.tags, song.tags)
          ]
        }))),
        switchMap(maps => this.mapsService.saveList(maps)),
      )
    ]).pipe(
      map(() => {})
    )
  }

  parseSongsFromMaps(): Observable<void> {
    return from(this.mapsService.loadSource({
      take: 1000,
      where: {
        songId: IsNull(),
        songName: Not(''),
        duration: And(MoreThan(90), LessThan(360))
      }
    })).pipe(
      switchMap(entities => {
        const list: MapWithSong[] = entities.map(item => ({
          mapItem: item,
          name: this.prepareName(item.songName),
          subName: this.prepareName(item.songSubName),
          band: this.prepareName(item.songAuthorName),
          duration: item.duration,
          tags: item.tags
        }));

        const recordBySong: Record<string, MapWithSong[]> = {};

        list.forEach(item => {
          const key = item.band + item.name;

          if (!recordBySong[key]) {
            recordBySong[key] = [];
          }

          recordBySong[key].push(item)
        })

        return combineLatest([
          ...Object.values(recordBySong).map(items => from(this.addSong(items[0])).pipe(
            tap(song => items.forEach(item => {
              const mapItem = item.mapItem;

              mapItem.songId = song.id;
              mapItem.tags.push(
                ...this.newTags(mapItem.tags, song.tags)
              )

              this.mapsService.updateItem(mapItem);
            }))
          ))
        ]).pipe(
          map(() => {})
        )
      })
    )
  }

  private newTags(sourceTags: number[], newTags: number[]): number[] {
    return newTags.filter(tag => !sourceTags.includes(tag))
  }

  private async addSong(item: SongMinimal): Promise<{ id: number, tags: number[] }> {
    const existSongList = await this.songRepo.find({
      where: {
        name: item.name,
        band: item.band
      },
      take: 1
    })

    if (existSongList.length) {
      const existSong = existSongList[0];
      const newTags = this.newTags(existSong.tags, item.tags);

      if (newTags.length) {
        existSong.tags.push(...newTags);
        this.songRepo.save(existSong);
      }

      return existSong;
    }

    return this.songRepo.save(item);
  }
}
