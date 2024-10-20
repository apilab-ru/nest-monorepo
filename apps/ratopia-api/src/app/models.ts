export type RawMessage = RawMessageCurrency | RawMessageTraders;

export interface RawMessageCurrency {
  Event: 'currency';
  Payload: number;
}

export interface RawMessageTraders {
  Event: 'trades';
  Payload: CityRaw[];
}

export enum Currency {
  gold = '0',
  dar = '1',
}

export interface CityRaw {
  Key: 'Hometown' | string;
  Export: string;
  Import: string;
  Resources: string;
  Relations: number;
  Currency: Currency;
}

export interface ResourceRaw {
  Resource: number;
  OriginValue: number;
  NowValue: number;
  CountPerPackage: number;
  NeedProsperity: number;
}

export interface TradeRaw {
  Key: number;
  Value: number;
}
