import * as firebaseConfig from './fb-config.json';

export const config = {
  domain: 'http://file-cab.local:3000',
  sentry: {
    dns: 'https://6f8da66c1cc9498caf54e4bf4f21b9cb@o1087993.ingest.sentry.io/6102391',
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
      user: 'watchlist@apilab.ru',
      pass: 'DqAtwYE6',
    },
  },
  firebase: {
    url: `https://filecab-5454b-default-rtdb.firebaseio.com`,
    config: {
      type: firebaseConfig.type,
      projectId: firebaseConfig.project_id,
      privateKeyId: firebaseConfig.private_key_id,
      privateKey: firebaseConfig.private_key,
      clientEmail: firebaseConfig.client_email,
      clientId: firebaseConfig.client_id,
      authUri: firebaseConfig.auth_uri,
      tokenUri: firebaseConfig.token_uri,
      authProviderX509CertUrl: firebaseConfig.auth_provider_x509_cert_url,
      clientX509CertUrl: firebaseConfig.client_x509_cert_url,
    },
  },
};
