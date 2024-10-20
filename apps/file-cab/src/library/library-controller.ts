import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';
import { LibraryItemV2, PreparedItem } from '@filecab/models/library';
import { MigrationService } from './migration.service';

@ApiTags('library')
@Controller('library')
export class LibraryController {
  constructor(private migrationService: MigrationService) {}

  @Post('migrate/v3')
  @ApiBody({
    schema: {
      properties: {
        list: {
          allOf: undefined,
        },
      },
    },
  })
  migrateV3(@Body() params: { list: PreparedItem[] }) {
    const list: PreparedItem[] = params.list;

    return this.migrationService.migrateItems(list).toPromise();
  }

  @Post('check/v3')
  @ApiBody({
    schema: {
      properties: {
        list: {
          type: undefined,
        },
      },
    },
  })
  checkV3(@Body() params: { list: LibraryItemV2[] }) {
    const list: LibraryItemV2[] = params.list;

    return this.migrationService.checkItems(list).toPromise();
  }

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
