import { Observable } from "rxjs";
import { MediaItem } from "@filecab/models";

export abstract class MediaItemsProvider {
  abstract getByFieldId(id: number, field: string): Observable<MediaItem>;
}
