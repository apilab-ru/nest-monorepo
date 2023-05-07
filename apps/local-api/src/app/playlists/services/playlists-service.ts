import { environment } from "../../../environments/environment";
import { Playlist } from "@bsab/api/local/playlist";
import { Injectable } from "@nestjs/common";

const fs = require('fs');

const PLAYLIST_EXT = '.bplist';
const IMAGE_PREFIX = 'data:image/png;';

@Injectable()
export class PlaylistsService {
  private lastChange: string;
  private cache: Playlist[];
  private path = environment.playlistsPath;

  async getList(): Promise<Playlist[]> {
    const { mtime } = await fs.promises.stat(this.path);

    if (this.cache && mtime === this.lastChange) {
      return this.cache;
    }

    const files = (await fs.promises.readdir(this.path))
      .filter(it => it.includes(PLAYLIST_EXT));

    this.cache = await Promise.all(files.map(file => this.parserPlaylist(file)));

    return this.cache;
  }

  async updatePlaylist(id: string, playlist: Playlist): Promise<void> {
    const data = JSON.stringify({
      ...playlist,
      image: playlist.image.replace(IMAGE_PREFIX, '')
    });

    await fs.promises.writeFile(this.path + id, data);
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
      image: IMAGE_PREFIX + item.image,
    };
  }
}
