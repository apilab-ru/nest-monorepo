import { Injectable } from "@nestjs/common";
import { Connection, Repository } from "typeorm";
import { SettingsEntity } from "../entites/settings.entity";

@Injectable()
export class SettingsService {
  private repository: Repository<SettingsEntity>;

  constructor(
    connection: Connection,
  ) {
    this.repository = connection.getRepository(SettingsEntity);
  }

  updateSettings(id: string, data: any): void {
    this.repository.save({
      id, data
    });
  }
}
