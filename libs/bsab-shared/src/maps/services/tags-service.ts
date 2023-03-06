import { Injectable } from "@nestjs/common";
import { filter, from, map, mapTo, Observable, of, shareReplay, startWith, Subject, switchMap, take, tap } from "rxjs";
import { Connection, Repository } from "typeorm";
import { TagEntity } from "../entites/tag.entity";
const camelCase = require("lodash/camelCase");

@Injectable()
export class TagsService {
    list$: Observable<Record<string, number>>;

    private refresh = new Subject<void>();
    private repository: Repository<TagEntity>;

    constructor(
        connection: Connection,
    ) {
        this.repository = connection.getRepository(TagEntity);
        this.list$ = this.refresh.pipe(
            startWith(undefined),
            switchMap(() => from(this.loadMap())),
            shareReplay(1),
        );
    }

    idsByTags(tags: string[], tagsMap: Record<string, number>): number[] {
        if (!tags) {
            return [];
        }

        return tags.map(tag => tagsMap[camelCase(tag)]);
    }

    findTags(tagsInput: string[]): Observable<Record<string, number>> {
        if (!tagsInput || !tagsInput.length) {
            return of({});
        }

        const tags = tagsInput.map(it => camelCase(it));

        return this.list$.pipe(
            take(1),
            map((tagMap) => {
                return tags.filter(tag => !tagMap[tag]);
            }),
            switchMap(list => !list.length ?
                of(undefined)
                : this.addTags(list).pipe(tap(() => this.refresh.next()))
            ),
            switchMap(() => this.list$),
            filter(tagsMap => tags.every(tag => tagsMap[tag])),
            take(1),
        );
    }

    loadTags(): Promise<TagEntity[]> {
        return this.repository.find();
    }

    private addTags(tags: string[]): Observable<void> {
        const list = tags.map(name => ({ name }));

        return from(this.repository.save(list)).pipe(mapTo(undefined));
    }

    private loadMap(): Promise<Record<string, number>> {
        return this.loadTags().then(list => {
            const mapTags = {};
            list.forEach(item => {
                mapTags[item.name] = item.id;
            });
            return mapTags;
        });
    }
}
