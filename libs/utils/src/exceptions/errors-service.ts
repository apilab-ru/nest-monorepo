import { Injectable } from "@nestjs/common";
import { Connection, Repository } from "typeorm";
import { ErrorEntity } from "./entities/error.entity";
import { StringableObject } from "./stringable-object";
import { FindManyOptions } from "typeorm/find-options/FindManyOptions";

@Injectable()
export class ErrorsService {
  private repository: Repository<ErrorEntity>;

  constructor(
    connection: Connection,
  ) {
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
}
