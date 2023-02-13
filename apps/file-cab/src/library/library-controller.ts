import { ApiTags } from '@nestjs/swagger';
import { Controller } from '@nestjs/common';

@ApiTags('library')
@Controller('library')
export class LibraryController {
  // TODO research infinity update with last item (846)
  //@Cron('*/10 * * * * *')
  /*async loadLibraryItems(): Promise<void> {
    from(this.libraryService.loadNeedUpdateItem()).pipe(
      switchMap(entity => !entity ? of(null) : (
          entity.smotretId
            ? this.animeService.foundItem(entity)
            : this.filmsService.foundItem(entity)
        ).pipe(
        map(response => ({ entity, response }))),
      ),
      take(1),
    ).subscribe((res) => {
      if (!res) {
        return this.userLibraryService.emitUpdateToAllUsers();
      }

      this.userLibraryService.isNotified = false;
      this.libraryService.updateItem(res.entity, res.response || {});
    });
  }*/
}

