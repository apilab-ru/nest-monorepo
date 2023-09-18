export const environment = {
   production: false,
   prefix: '',
   timeout: 0,
   ssl: {
      key: __dirname + '/assets/cert/localhost-key.pem',
      cert: __dirname + '/assets/cert/localhost.pem'
   },
};
