export interface DiscSongsPagination {
  page: number;
  pages: number;
  per_page: number;
  items: number;
  urls: {
    last: string;
    next: string;
  };
}

export interface DiscSongsPage {
  pagination: DiscSongsPagination;
  results: DiscSongItem[];
}

export interface DiscSongItem {
  id: number;
  title: string;
  style: string[];
  genre: string[];
  label: string[];
}
