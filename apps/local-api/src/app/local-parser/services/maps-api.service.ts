import { Injectable } from '@nestjs/common';
import { environment } from '../../../environments/environment';
import { OrderDirection, OrderField } from '@bsab/api/request/request';
import { HttpService } from '@nestjs/axios';
import { map, Observable } from 'rxjs';
import { PageResponse } from "@bsab/api/map/page";
import { MapDetail } from "@bsab/api/map/map-detail";
import { MapsSearch } from "@bsab/shared/maps/interfaces/maps-search";

@Injectable()
export class MapsApiService {
   constructor(
      private httpService: HttpService,
   ) {
   }

   loadMaps(query?: MapsSearch): Observable<PageResponse<MapDetail>> {
      return this.httpService.get(environment.apiEndpoint + '/maps/list', {
         params: {
            ...query
         },
         headers: {
            'accept': 'application/json',
            'Accept-Encoding': 'gzip,deflate,compress'
         }
      }).pipe(
         map(res => res.data)
      );
   }
}
