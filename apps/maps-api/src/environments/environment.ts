export const environment = {
   production: false,
   fileDir: 'F:/beat-saber-files/',
   host: 'https://localhost:3000/',
   ssl: {
      key: __dirname + '/assets/cert/localhost-key.pem',
      cert: __dirname + '/assets/cert/localhost.pem'
   },
   autoAuthUser: 1,
};
