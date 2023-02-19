import { Injectable } from "@nestjs/common";
import { Connection, Repository } from "typeorm";
import { ErrorEntity } from "../entites/error.entity";
import { StringableObject } from "./stringable-object";

@Injectable()
export class ErrorsService {
    private repository: Repository<ErrorEntity>;

    constructor(
        connection: Connection,
    ) {
        this.repository = connection.getRepository(ErrorEntity);
    }

    addError(error: Error | StringableObject, data: any): void {
        this.repository.save({
            error: error.toString(),
            data: JSON.stringify(data),
        });
    }
}
