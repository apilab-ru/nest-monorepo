import { GenreKind } from '../genres/const';

export interface Genre {
  id: number;
  name: string;
  kind: GenreKind[];
  imdbId?: number | null;
  smotretId?: number | null;
}
