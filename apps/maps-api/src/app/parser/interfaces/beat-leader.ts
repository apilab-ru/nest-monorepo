export interface BeatLeaderItem {
  id: string;
  rankedDate: string;
  stars: number;
}

export interface BeatLeaderResponseItem {
  song: {
    id: string;
  };
  difficulty: {
    rankedTime: number;
    stars: number;
  };
}

export interface BeatLeaderResponse {
  metadata: {
    itemsPerPage: number;
    page: number;
    total: number;
  };
  data: BeatLeaderResponseItem[];
}
