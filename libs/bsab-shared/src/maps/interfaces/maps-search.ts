import { OrderDirection } from "@bsab/api/request/request";

export interface BaseSearch {
   limit: number;
   offset: number;
   orderField?: string;
   orderDirection?: OrderDirection;
}

export interface MapsSearch extends BaseSearch {
   tagsPositive?: string;
   tagsNegative?: string;
   search?: string;
   npsFrom?: string;
   npsTo?: string;
   dateFrom?: string;
   showed?: string;
   recommended?: string;
   ranked?: string;
   bpmFrom?: string;
   bpmTo?: string;
   durationFrom?: string;
   durationTo?: string;
   scoreFrom?: string;
   blRanked?: string;
}
