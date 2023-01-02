const merge = require('deepmerge');
import { configCustom } from './config-custom';

const baseConfig = {
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
