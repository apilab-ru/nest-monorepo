const gamePath = 'G:\\Steam\\steamapps\\common\\Beat Saber\\';
const port = 3333;

export const environment = {
  version: '1.0.0',
  port,
  fileDir: 'F:/beat-saber-files/',
  host: 'https://localhost:' + port + '/',
  levelsPath: gamePath + 'Beat Saber_Data/CustomLevels/',
  playlistsPath: gamePath + 'Playlists/',
  installPath: 'D:\\YandexDisk\\Загрузки\\map-install',
  apiEndpoint: 'https://api2.apilab.ru/bsab',
  ssl: {
    key: __dirname + '/assets/cert/localhost-key.pem',
    cert: __dirname + '/assets/cert/localhost.pem',
  },
};
