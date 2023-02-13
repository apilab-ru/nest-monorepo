import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import { config } from '../../config/config';

@Injectable()
export class FireBaseService {

  private fb = firebase;
  private db: firebase.database.Database;

  constructor() {
    try {
      const app = this.fb.initializeApp({
        credential: firebase.credential.cert(config.firebase.config),
        databaseURL: config.firebase.url,
      });
      this.db = this.fb.database(app);
    } catch (e) {
      console.error('fb error', e.message);
    }
  }

  updateValue<T>(path: string, value: T): Promise<void> {
    return this.db.ref(path).update(value);
  }

  async add(name: string, data): Promise<string> {
    let id: string;
    return this.db.ref(name)
      .push(data)
      .then(post => {
        id = post.key;
        return this.db.ref(name + '/' + id).update({ id });
      })
      .then(() => id);
  }

  async delete(name: string, id: string): Promise<void> {
    return this.db.ref(name + '/' + id).remove();
  }

  async select<T>(name: string): Promise<T[]> {
    return this.db.ref(name)
      .once('value')
      .then(response => response.toJSON() as T[]);
  }
}
