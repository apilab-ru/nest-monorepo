import { CityRaw, Currency, RawMessage, ResourceRaw, TradeRaw } from './models';
import { City, Trade } from './city.model';

const file =
  'S:\\projects\\nest-monorepo\\apps\\ratopia-api\\src\\app\\last-result.json';
const fileParsed =
  'S:\\projects\\nest-monorepo\\apps\\ratopia-api\\src\\app\\parsed.json';

type WsHandler = (message: string) => void;

export class ProxyData {
  private wsHandler: WsHandler | undefined;

  sendData(data: RawMessage): void {
    if (data.Event === 'trades') {
      const list = this.parserList(data.Payload);

      this.send(
        JSON.stringify({
          event: 'trades',
          payload: list,
        }),
      );
    }

    if (data.Event === 'currency') {
      this.send(
        JSON.stringify({
          event: 'currency',
          payload: data.Payload,
        }),
      );
    }
  }

  send(message: string): void {
    this.wsHandler?.(message);
  }

  connect(callback: WsHandler): void {
    this.wsHandler = callback;
  }

  disconnect(): void {
    this.wsHandler = undefined;
  }

  private parserList(list: CityRaw[]): City[] {
    return list
      .filter((item) => item.Key !== 'Hometown')
      .map((item) => this.parserCity(item));
  }

  private parserCity(city: CityRaw): City {
    const importRes = JSON.parse(city.Import) as TradeRaw[];
    const exportRes = JSON.parse(city.Export) as TradeRaw[];

    const resources = JSON.parse(city.Resources) as ResourceRaw[];
    const resourcesMap = new Map(
      resources.map((item) => [item.Resource, item]),
    );

    return {
      key: city.Key,
      relations: city.Relations,
      import: importRes.map((item) =>
        this.convertTrade(resourcesMap.get(item.Value)),
      ),
      export: exportRes.map((item) =>
        this.convertTrade(resourcesMap.get(item.Value)),
      ),
      currency: city.Currency === '0' ? 'gold' : 'dar',
    };
  }

  private convertTrade(res?: ResourceRaw): Trade | null {
    if (!res) {
      return null;
    }

    return {
      resource: res.Resource,
      package: res.CountPerPackage,
      price: res.NowValue,
    };
  }
}
