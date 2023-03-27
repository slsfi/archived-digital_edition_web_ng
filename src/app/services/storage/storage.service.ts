import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import {isBrowser} from "../../../standalone/utility-functions";

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    if (!isBrowser()) { return; }

    this.init();
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Create and expose methods that users of this service can
  // call, for example:
  public set(key: string, value: any) {
    return this._storage?.set(key, value);
  }

  public get(key: string) {
    if (this._storage) {
      return this._storage.get(key);
    } else {
      return Promise.resolve();
    }
  }

  public remove(key: string) {
    this._storage?.remove(key);
  }

  public keys() {
    if (this._storage) {
      return this._storage?.keys();
    } else {
      return Promise.resolve([]);
    }
  }
}
