export interface Config {
  db: {
    host: string;
    username: string;
    password: string;
    database: string;
  };
  discsongs: {
    url: string;
    token: string;
  };
}
