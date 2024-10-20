export interface Trade {
  resource: number;
  price: number;
  package: number;
}

export interface City {
  key: string;
  export: Trade[];
  import: Trade[];
  relations: number;
  currency: string;
}