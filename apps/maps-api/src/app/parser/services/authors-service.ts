import { Injectable } from "@nestjs/common";
import { Subject } from "rxjs";
import { Connection, Repository } from "typeorm";
import { AuthorEntity } from "../entites/author.entity";
import { Author } from "../interfaces/beatsaver";
import { ErrorsService } from "@utils/exceptions/errors-service";

@Injectable()
export class AuthorsService {
    private repository: Repository<AuthorEntity>;

    constructor(
        connection: Connection,
        private errorsService: ErrorsService,
    ) {
        this.repository = connection.getRepository(AuthorEntity);
    }

    pushAuthor(author: Author): Promise<void> {
        return this.repository.findOneBy({
            id: author.id
        }).then(res => {
            if (!res) {
                this.repository.save([author])
                    .then(() => undefined)
                    .catch(error => {
                        this.errorsService.addError(error, author);
                    })
                ;
            }
        });
    }
}
