import { Injectable } from '@nestjs/common';
import { Connection, Repository } from 'typeorm';
import { ErrorEntity } from './entities/error.entity';
import { StringableObject } from './stringable-object';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { ObjectID } from 'typeorm/driver/mongodb/typings';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';

@Injectable()
export class ErrorsService {
  private repository: Repository<ErrorEntity>;

  constructor(connection: Connection) {
    this.repository = connection.getRepository(ErrorEntity);
  }

  addError(error: Error | object, data: any): void {
    if (!(error instanceof Error)) {
      error = new StringableObject(error);
    }

    this.repository.save({
      error: error.toString(),
      data: JSON.stringify(data),
    });
  }

  loadErrors(options?: FindManyOptions<ErrorEntity>): Promise<ErrorEntity[]> {
    return this.repository.find(options);
  }

  deleteErrors(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectID
      | ObjectID[]
      | FindOptionsWhere<ErrorEntity>,
  ): Promise<DeleteResult> {
    return this.repository.delete(criteria);
  }
}
