export interface Item {
  id: number;
  title: string;
  image: string;
  description: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface SearchRequestResult<T> {
  "page": number;
  "total_results": number;
  "total_pages": number;
  "results": T[];
}
