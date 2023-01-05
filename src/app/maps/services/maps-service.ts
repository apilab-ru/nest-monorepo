import { Injectable } from '@nestjs/common';
import { catchError, combineLatest, from, mapTo, Observable, of } from 'rxjs';
import { Connection, In, Repository } from 'typeorm';
import { MapEntity } from '../entites/mapEntity';
import { ErrorsService } from '../../settings/services/errors-service';
import { MapsSearch, OrderDirection } from '../interfaces/maps-search';
import { OrderField } from '../interfaces/map';
import { environment } from '../../../environments/environment';
import { MapDetail } from '@bsab/api/map/map-detail';

@Injectable()
export class MapsService {
   private repository: Repository<MapEntity>;

   constructor(
      connection: Connection,
      private errorsService: ErrorsService
   ) {
      this.repository = connection.getRepository(MapEntity);
   }

   getByIds(ids: string[]): Observable<MapEntity[]> {
      return from(this.repository.findByIds(ids));
   }

   saveList(list: MapEntity[]): Observable<MapEntity[]> {
      return combineLatest(
         list.map(item => from(this.repository.save(item)).pipe(
            catchError(error => {
               this.errorsService.addError(error, item);

               return of(null);
            })
         ))
      ).pipe(
         mapTo(list)
      );
   }

   loadListDetails(query: MapsSearch, maxLimit = 100): Promise<MapDetail[]> {
      return this.loadList(query, maxLimit).then(list => list.map(item => this.mapConvert(item)));
   }

   loadById(id: string): Promise<MapDetail> {
      return this.repository.findOneBy({
         id
      }).then(res => {
         if (!res) {
            throw new Error('notFound');
         }

         return this.mapConvert(res);
      })
   }

   loadList(query: MapsSearch, maxLimit = 100): Promise<MapEntity[]> {
      const queryRunner = this.repository.createQueryBuilder('maps');
      const limit = Math.min(query.limit, maxLimit);
      queryRunner.limit(limit);
      queryRunner.offset(query.offset || 0);
      queryRunner.orderBy('id');

      if (query.search) {
         queryRunner.andWhere('(maps.name like :search ' +
            'or maps.description like :search ' +
            'or maps.songName like :search' +
            ')', {
            search: '%' + query.search + '%'
         });
      }

      if (query.tagsPositive) {
         const ids = JSON.parse(query.tagsPositive).map(it => +it);
         if (ids.length) {
            queryRunner.andWhere(
               '('
               + ids.map(tag => `JSON_CONTAINS(maps.tags, "${tag}")`).join(' AND ')
               + ')'
            );
         }
      }

      if (query.tagsNegative) {
         const ids = JSON.parse(query.tagsNegative).map(it => +it);
         if (ids.length) {
            queryRunner.andWhere(
               '('
               + ids.map(tag => `not JSON_CONTAINS(maps.tags, "${tag}")`).join(' AND ')
               + ')'
            );
         }
      }

      if (query.npsFrom) {
         queryRunner.andWhere('maps.maxNps >= :npsFrom', {
            npsFrom: query.npsFrom
         });
      }

      if (query.npsTo) {
         queryRunner.andWhere('maps.minNps <= :npsTo', {
            npsTo: query.npsTo
         });
      }

      if (query.dateFrom) {
         queryRunner.andWhere('DATE(maps.createdAt) >= :dateFrom', {
            dateFrom: query.dateFrom
         });
      }

      if (query.showed !== undefined) {
         queryRunner.andWhere('showed = :showed', {
            showed: query.showed === 'true' ? 1 : 0,
         });
      }

      if (query.bpmFrom) {
         queryRunner.andWhere('bpm >= :bpmFrom', {
            bpmFrom: query.bpmFrom
         });
      }

      if (query.bpmTo) {
         queryRunner.andWhere('bpm <= :bpmTo', {
            bpmTo: query.bpmTo
         });
      }

      if (query.recommended) {
         queryRunner.distinctOn(['maps.id'])

         queryRunner.leftJoin(
            'user_songs',
            'us',
            '(us.song = maps.songName or us.song = maps.songSubName) and us.user_id = :userId',
            { userId: 1 }
         );

         queryRunner.leftJoin(
            'user_artists',
            'ua',
            'ua.artist = maps.songAuthorName and ua.user_id = :userId',
            { userId: 1 }
         );

         queryRunner.andWhere('((us.id is not NULL) or (ua.id is not NULL))')
      }

      const orderFiled = OrderField[query.orderField] || OrderField.createdAt;
      const orderDirection = OrderDirection[query.orderDirection] || OrderDirection.desc;

      queryRunner.orderBy(orderFiled, orderDirection);

      return queryRunner.getMany();
   }

   private mapConvert(item: MapEntity): MapDetail {
      return {
         ...item,
         sourceUrl: environment.host + 'parser/proxy-file?file=' + item.downloadURL,
         author: '',
         createdAt: item.createdAt as undefined as string,
         updatedAt: item.updatedAt as undefined as string
      };
   }

   markAsShowed(id: string): Promise<void> {
      return this.repository
         .findOne({ where: { id } })
         .then(entity => {
            if (!entity) {
               throw new Error('notFound');
            }

            entity.showed = true;

            return this.repository.save(entity);
         })
         .then(() => {
         });
   }

   markAsShowedList(list: string[]): Promise<void> {
      return this.repository
         .findBy({ id: In(list) })
         .then(res => {
            res.map(item => item.showed = true);

            return this.repository.save(res);
         })
         .then(() => {
         });
   }
}
