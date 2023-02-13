import { GenreKind } from '../genres/const';

export { GenreKind };
export interface Genre {
  id: number;
  name: string;
  key: string;
  kind: GenreKind[];
  imdbId?: number | null;
  smotretId?: number | null;
  kinopoiskId?: number | null;
}
