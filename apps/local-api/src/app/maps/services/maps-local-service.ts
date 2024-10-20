import {
  MapCache,
  MapCacheDetail,
  MapDifficultDetail,
  MapRav,
} from '../models/map';
import { environment } from '../../../environments/environment';
import { DIFFICULTY_MAP } from '@bsab/api/map/difficulty';
import {
  LocalMap,
  MAP_MODE_CONVERT,
  MapCinema,
  MapDifficultList,
  MapDiffiDetail,
} from '@bsab/api/map/map';
import * as JSZip from 'jszip';
import { readMapDifficultDetail } from '../models/map-parser';
import { Injectable } from '@nestjs/common';
import { MapsIdsResponse, MapsResponse } from '@bsab/api/map/response';
import { DEFAULT_MAP_CINEMA } from '../models/cinema';
import { RequestFile } from '../models/request-file';

const fs = require('fs');
const crypto = require('crypto');

const CACHE_FILE = 'local-cache.json';
const INFO_FILE = 'Info.dat';
const CINEMA_FILE = 'cinema-video.json';

@Injectable()
export class MapsLocalService {
  private version = 8;

  async loadMapById(id: string): Promise<LocalMap | null> {
    const files = await fs.promises.readdir(environment.levelsPath);

    const file = files.find((name) => name.indexOf(id + ' ') === 0);

    if (!file) {
      return null;
    }

    return this.loadMap(file);
  }

  async loadMaps(offset = 0, limit = 10000): Promise<MapsResponse> {
    const { mtime } = await fs.promises.stat(environment.levelsPath);

    const files = await fs.promises.readdir(environment.levelsPath);

    const maps = await Promise.all(
      files.splice(offset, limit).map((file) =>
        this.loadMap(file).catch((error) => {
          console.error(error);

          return null;
        }),
      ),
    );

    const fullOffset = (+offset || 0) + maps.length;

    return {
      maps,
      offset: fullOffset,
      hasMore: fullOffset < files.length,
    };
  }

  getBeatSaverIds(list: LocalMap[]): MapsIdsResponse {
    const notFound = [];

    const ids = list
      .map((item) => {
        const res = item.id.split(' (');

        if (
          res.length > 1 &&
          !item.id.includes('Beat Sage') &&
          res[0].length < 8
        ) {
          return res[0];
        }

        notFound.push(item.id);
        return null;
      })
      .filter((it) => !!it);

    return {
      ids,
      notFound,
    };
  }

  async installPreparedMaps(withDelete = false): Promise<number> {
    const list = await fs.promises.readdir(environment.installPath);

    if (!list) {
      return 0;
    }

    return Promise.all(
      list.map((file) =>
        fs.promises
          .readFile(environment.installPath + '/' + file)
          .then((data) => JSZip.loadAsync(data))
          .then(async (zip) => {
            const name = file.replace('.zip', '');
            const dir = environment.levelsPath + '/' + name;
            await fs.promises.mkdir(dir, {
              recursive: true,
            });

            return Promise.all(
              Object.entries(zip.files).map(([fileName, fileData]) => {
                // @ts-ignore
                return fileData!
                  .async('nodebuffer')
                  .then((content) =>
                    fs.promises.writeFile(dir + '/' + fileName, content),
                  );
              }),
            ).then(() => file);
          })
          .then((file) => {
            console.log('xxx file complete', file);

            if (withDelete) {
              return fs.promises.unlink(environment.installPath + '/' + file);
            }
          })
          .catch((error) => {
            console.error('error with', error);
          }),
      ),
    ).then(() => list.length);
  }

  async uploadCinemaVideo(
    id: string,
    file: RequestFile,
    cinema?: MapCinema,
  ): Promise<MapCinema> {
    const oldData = (await this.readMapCinema(id)) || DEFAULT_MAP_CINEMA;
    const cinemaData = cinema || (await this.readMapCinema(id));

    const videoFile = oldData.videoFile || file.originalname;

    await fs.promises.unlink(this.getDirById(id) + videoFile).catch(() => {});

    await fs.promises.appendFile(this.getDirById(id) + videoFile, file.buffer);

    const newData: MapCinema = {
      ...oldData,
      ...(cinemaData || {}),
      videoFile,
    };

    await this.saveMapCinema(id, newData);

    return newData;
  }

  private readMapFiles(
    path: string,
    fileNames: string[],
  ): Promise<{ name: string; data: string }[]> {
    return Promise.all(
      fileNames.map((name) => fs.promises.readFile(path + name) as string),
    ).then((contents) => {
      return fileNames.map((name, index) => ({
        name,
        data: contents[index],
      }));
    });
  }

  private async checkCache(id: string): Promise<MapCache | null> {
    const { mtime: dirModTime } = await fs.promises.stat(
      environment.levelsPath + id,
    );

    const { mtime: cacheModTime } = await fs.promises
      .stat(environment.levelsPath + id + '/' + CACHE_FILE)
      .catch(() => ({ mtime: 0 }));

    if (!cacheModTime || dirModTime > cacheModTime) {
      return null;
    }

    const cacheFile = await fs.promises.readFile(
      environment.levelsPath + id + '/' + CACHE_FILE,
    );
    const cache = JSON.parse(cacheFile) as MapCacheDetail;

    if (cache.version !== this.version || this.version === 0) {
      return null;
    }

    return cache.map;
  }

  private saveCache(id: string, map: MapCache): void {
    fs.promises.writeFile(
      environment.levelsPath + id + '/' + CACHE_FILE,
      JSON.stringify({
        version: this.version,
        map,
      }),
    );
  }

  private async loadMapFiles(id: string): Promise<{
    createdAt: string;
    rav: MapRav;
    file: string;
    filesMap: { name: string; data: string }[];
  }> {
    const file = await fs.promises.readFile(
      environment.levelsPath + id + '/' + INFO_FILE,
    );
    const { ctime } = await fs.promises.stat(
      environment.levelsPath + id + '/' + INFO_FILE,
    );
    const rav: MapRav = JSON.parse(file);

    const files = rav._difficultyBeatmapSets.flatMap((group) => {
      return group._difficultyBeatmaps.map((item) => item._beatmapFilename);
    });

    const filesMap = await this.readMapFiles(
      environment.levelsPath + id + '/',
      files,
    ).catch((error) => {
      console.error('error read', error);
      return [];
    });

    return {
      createdAt: ctime,
      rav,
      file,
      filesMap,
    };
  }

  private async loadMap(id: string): Promise<MapCache> {
    const cache = await this.checkCache(id);

    if (cache) {
      return cache;
    }

    const [{ file, rav, filesMap, createdAt }, cinema] = await Promise.all([
      this.loadMapFiles(id),
      this.readMapCinema(id),
    ]);

    const hash = this.makeHash(
      file,
      filesMap.map(({ data }) => data),
    );

    const mapDifficultData: Record<string, MapDifficultDetail> = {};
    filesMap.forEach((item) => {
      if (item) {
        try {
          mapDifficultData[item.name] = readMapDifficultDetail(item.data);
        } catch (e) {
          console.error('cant read', id, e);
        }
      }
    });

    const difficultMap = this.convertDifficultMap(rav._difficultyBeatmapSets);
    const mods = difficultMap.map((item) => item.mode);
    const diffDetails = {};

    let duration = 0;

    difficultMap.forEach((group) => {
      group.list.forEach((item) => {
        const data = mapDifficultData[item.file];
        if (data) {
          if (!duration) {
            duration = Math.ceil((data.times / rav._beatsPerMinute) * 60);
          }

          const nps = data.notesTotal / duration;

          if (
            !diffDetails[item.difficulty] ||
            diffDetails[item.difficulty] < nps
          ) {
            diffDetails[item.difficulty] = nps;
          }
        } else {
          console.error(
            'not found',
            item.file,
            // mapDifficultData,
            id,
          );
        }
      });
    });

    const difsDetails = Object.entries(diffDetails).map(
      ([difficulty, nps]) => ({ difficulty, nps } as MapDiffiDetail),
    );

    const map = {
      id: this.encodeId(id),
      songName: rav._songName,
      songSubName: rav._songSubName,
      bpm: rav._beatsPerMinute,
      songFilename: this.getFile(id, rav._songFilename),
      coverURL: this.getFile(id, rav._coverImageFilename),
      sourceUrl: environment.host + `proxy/source/?file=` + this.encodeId(id),
      author: rav._levelAuthorName,
      songAuthorName: rav._songAuthorName,
      difficultMap: this.convertDifficultMap(rav._difficultyBeatmapSets),
      createdAt,
      difsDetails,
      mods,
      duration,
      hash,
      cinema,
    };

    this.saveCache(id, map);

    return map;
  }

  decodeId(id: string): string {
    return decodeURIComponent(id);
  }

  private encodeId(path: string): string {
    return encodeURIComponent(path);
  }

  private getDirById(id: string): string {
    return environment.levelsPath + id + '/';
  }

  async saveMapCinema(id: string, cinema: MapCinema): Promise<void> {
    await fs.promises.writeFile(
      this.getDirById(id) + CINEMA_FILE,
      JSON.stringify(cinema),
    );
  }

  private async readMapCinema(id: string): Promise<null | MapCinema> {
    const file = await fs.promises
      .readFile(this.getDirById(id) + CINEMA_FILE)
      .catch(() => null);

    if (!file) {
      return null;
    }

    const data = JSON.parse(file) as MapCinema;

    if (data.videoFile) {
      const fileExist = await fs.promises
        .stat(this.getDirById(id) + data.videoFile)
        .then(() => true)
        .catch(() => false);

      if (!fileExist) {
        data.videoFile = undefined;
      }
    }

    return data;
  }

  private makeHash(file: string, files: string[]): string {
    return crypto
      .createHash('sha1')
      .update(file + files.join(''), 'utf8')
      .digest('hex')
      .toUpperCase();
  }

  private getFile(id: string, file: string): string {
    return environment.host + 'map/' + id + '/' + file;
  }

  private convertDifficultMap(
    list: MapRav['_difficultyBeatmapSets'],
  ): MapDifficultList[] {
    return list.map((item) => {
      return {
        mode: MAP_MODE_CONVERT[item._beatmapCharacteristicName],
        list: item._difficultyBeatmaps.map((it) => ({
          difficulty: DIFFICULTY_MAP[it._difficulty],
          noteJumpMovementSpeed: it._noteJumpMovementSpeed,
          noteJumpStartBeatOffset: it._noteJumpStartBeatOffset,
          obstacleColor: it._customData?._obstacleColor,
          file: it._beatmapFilename,
        })),
      };
    });
  }
}
