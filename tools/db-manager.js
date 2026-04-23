/**
 * Generic IndexedDB Manager for Tools
 * Rule #1 from GEMINI.md has been read and acknowledged.
 */
const dbManager = {
  db: null,
  dbName: '',
  dbVersion: 1,

  /**
   * Initialize Database
   * @param {string} dbName 
   * @param {string[]} stores 
   * @param {number} version 
   */
  init(dbName, stores, version = 1) {
    this.dbName = dbName;
    this.dbVersion = version;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        stores.forEach(store => {
          if (!db.objectStoreNames.contains(store)) db.createObjectStore(store);
        });
      };
      request.onsuccess = (e) => { this.db = e.target.result; resolve(); };
      request.onerror = (e) => reject(e);
    });
  },

  async setItem(storeName, key, value) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e);
    });
  },

  async getItem(storeName, key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e);
    });
  },

  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const dataReq = store.getAll();
      const keysReq = store.getAllKeys();
      
      let dataLoaded = false;
      let keysLoaded = false;

      dataReq.onsuccess = () => {
        dataLoaded = true;
        if (keysLoaded) finalize();
      };
      keysReq.onsuccess = () => {
        keysLoaded = true;
        if (dataLoaded) finalize();
      };

      const finalize = () => {
        const result = {};
        dataReq.result.forEach((val, i) => { result[keysReq.result[i]] = val; });
        resolve(result);
      };

      tx.onerror = (e) => reject(e);
    });
  },

  async clearAll(stores) {
    const tx = this.db.transaction(stores, 'readwrite');
    stores.forEach(s => tx.objectStore(s).clear());
    return new Promise(r => tx.oncomplete = r);
  }
};
