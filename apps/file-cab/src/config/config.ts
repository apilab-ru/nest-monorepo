const merge = require('deepmerge');
import { configCustom } from './config-custom';

const baseConfig = {
  port: 3030,
  domain: 'http://file-cab.local:3000',
  sentry: {
    dns: '',
  },
  db: {
    host: 'localhost',
    username: 'root',
    password: '',
    database: 'filecab',
  },
  email: {
    service: 'Yandex',
    auth: {
      user: '',
      pass: '',
    },
  },
  films: {
    key: '',
    kinopoiskKey: '',
    kinopoiskDev: [],
  },
  firebase: {
    url: ``,
    config: {
      type: '',
      projectId: '',
      privateKeyId: '',
      privateKey: '',
      clientEmail: '',
      clientId: '',
      authUri: '',
      tokenUri: '',
      authProviderX509CertUrl: '',
      clientX509CertUrl: '',
    },
  },
};

export const config = merge(
  baseConfig,
  configCustom,
);
