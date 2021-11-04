export interface Item {
  id: number;
  title: string;
  image: string;
  description: string;

  episodes?: number;
  genre_ids: number[];
  original_title: string;
  popularity: number;
  year: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface SearchRequestResult<T> {
  page: number;
  total_results: number;
  total_pages: number;
  results: T[];
}
