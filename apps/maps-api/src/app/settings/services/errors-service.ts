import { Injectable } from "@nestjs/common";
import { filter, from, map, mapTo, Observable, of, shareReplay, startWith, Subject, switchMap, take, tap } from "rxjs";
import { Connection, Repository } from "typeorm/index";
import { SettingsEntity } from "../entites/settings.entity";
import { ErrorEntity } from "../entites/error.entity";

@Injectable()
export class ErrorsService {
    private repository: Repository<ErrorEntity>;

    constructor(
        connection: Connection,
    ) {
        this.repository = connection.getRepository(ErrorEntity);
    }

    addError(error: Error, data: any): void {
        this.repository.save({
            error: error.toString(),
            data: JSON.stringify(data),
        });
    }
}
