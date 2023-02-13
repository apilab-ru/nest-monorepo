import { GenreKind } from './const';

export interface GenreBase {
  name: string;
  kind: GenreKind;
  id?: number;
  imdbId?: number;
  smotretId?: number;
}
