import { Injectable } from '@nestjs/common';
import { ErrorsService } from '@utils/exceptions/errors-service';

@Injectable()
export class UtilsService {
  constructor(private errorsService: ErrorsService) {}

  loadGenresErrors() {
    return this.errorsService.loadErrors().then((entity) => {
      const list = entity.map((item) => JSON.parse(item.data));

      return list;
    });
  }
}
