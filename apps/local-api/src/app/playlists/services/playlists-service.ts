import { environment } from '../../../environments/environment';
import { Playlist } from '@bsab/api/local/playlist';
import { Injectable } from '@nestjs/common';
import { LocalMap } from '@bsab/api/map/map';

const fs = require('fs');

const PLAYLIST_EXT = '.bplist';
const IMAGE_PREFIX_LIST = ['data:image/png;', 'data:image/avif;'];
const DEFAULT_PREFIX = 'data:image/png;';
const kebabCase = require('lodash/kebabCase');

@Injectable()
export class PlaylistsService {
  private lastChange: string;
  private cache: Playlist[];
  private path = environment.playlistsPath;

  async getById(id: string): Promise<Playlist | null> {
    return this.parserPlaylist(id);
  }

  async addSongToPlaylist(
    playlist: Playlist,
    map: LocalMap,
  ): Promise<Playlist> {
    playlist.songs.push({
      songName: map.songName,
      levelAuthorName: map.songAuthorName,
      hash: map.hash,
      levelid: `custom_level_${map.hash}`,
      difficulties: map.difficultMap.flatMap((mode) =>
        mode.list.map((it) => ({
          characteristic: mode.mode,
          name: it.difficulty,
        })),
      ),
    });

    return playlist;
  }

  async getList(): Promise<Playlist[]> {
    const { mtime } = await fs.promises.stat(this.path);

    if (this.cache && mtime === this.lastChange) {
      return this.cache;
    }

    const files = (await fs.promises.readdir(this.path)).filter((it) =>
      it.includes(PLAYLIST_EXT),
    );

    this.cache = await Promise.all(
      files.map((file) => this.parserPlaylist(file)),
    );

    return this.cache;
  }

  private prepareImage(image: string): string {
    IMAGE_PREFIX_LIST.forEach((prefix) => {
      image = image.replace(prefix, '');
    });

    return image;
  }

  async updatePlaylist(id: string, playlist: Playlist): Promise<void> {
    const data = JSON.stringify({
      ...playlist,
      image: this.prepareImage(playlist.image),
    });

    await fs.promises.writeFile(this.path + id, data);
  }

  async createPlaylist(data: Playlist): Promise<Playlist> {
    let id = data.id || kebabCase(data.playlistTitle);

    const exists = (await fs.promises.readdir(this.path)).filter((it) =>
      it.includes(id),
    );

    if (exists.length) {
      id += `(${exists.length + 1})`;
    }

    id += PLAYLIST_EXT;

    const playlist = {
      ...data,
      id,
      image: this.prepareImage(data.image),
    };

    await fs.promises.writeFile(this.path + id, JSON.stringify(playlist));

    return playlist;
  }

  async removePlaylist(id: string): Promise<void> {
    await fs.promises.unlink(this.path + id);
  }

  private async parserPlaylist(path: string): Promise<Playlist> {
    const data = await fs.promises.readFile(this.path + path);
    const item: Playlist = JSON.parse(data);

    return {
      ...item,
      id: path,
      image: DEFAULT_PREFIX + item.image,
    };
  }
}
