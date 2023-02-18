import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';
import { LibraryService } from "./library.service";
import { PreparedItem } from "@filecab/models/library";

@ApiTags('library')
@Controller('library')
export class LibraryController {
  constructor(
    private libraryService: LibraryService,
  ) {
  }

  @Post('migrate/v3')
  @ApiBody({
    schema: {
      properties: {
        list: {
          type: undefined,
        },
      },
    },
  })
  migrateV3(@Body() params: any): void {
    const list: PreparedItem[] = params.list;
    console.log('xxx params', list);
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

