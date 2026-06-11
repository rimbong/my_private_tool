/**
 * Generic IndexedDB Manager for Tools
 * Rule #1 from GEMINI.md has been read and acknowledged.
 */
const dbManager = {
  db: null,
  dbName: '',

  /**
   * Initialize Database with Auto-Versioning
   * @param {string} dbName 
   * @param {string[]} stores 
   */
  async init(dbName, stores) {
    this.dbName = dbName;
    
    // 1. 먼저 현재 상태를 확인하기 위해 버전을 명시하지 않고 엽니다.
    // 최초 생성 시에도 stores를 넘겨주면 v1에서 즉시 생성됩니다.
    let db = await this._openDB(dbName, null, stores);
    
    // 2. 요청한 모든 저장소가 존재하는지 확인합니다.
    const missingStores = stores.filter(s => !db.objectStoreNames.contains(s));
    
    if (missingStores.length > 0) {
      // 3. 누락된 저장소가 있다면 현재 버전 + 1로 다시 열어 업그레이드를 유도합니다.
      const nextVersion = db.version + 1;
      db.close(); // 기존 연결을 닫아야 업그레이드 가능
      db = await this._openDB(dbName, nextVersion, stores);
    }
    
    this.db = db;
    return db;
  },

  _openDB(name, version, allStores = []) {
    return new Promise((resolve, reject) => {
      const request = version ? indexedDB.open(name, version) : indexedDB.open(name);
      
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        // 업그레이드 시 요청된 모든 저장소를 생성 (이미 있는 건 무시)
        allStores.forEach(store => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store);
          }
        });
      };
      
      request.onsuccess = (e) => {
        const db = e.target.result;
        
        // 다른 탭에서 업그레이드가 시작되면 이 연결을 닫아 Blocked 상태를 방지합니다.
        db.onversionchange = () => {
          db.close();
          console.warn("데이터베이스가 다른 탭에서 업데이트되었습니다. 페이지 새로고침이 필요할 수 있습니다.");
        };
        
        resolve(db);
      };
      request.onerror = (e) => reject(e.target.error);
      request.onblocked = () => {
        const msg = '데이터베이스가 이전 탭에 의해 열려있습니다. 모든 탭을 닫고 다시 시도해주세요.';
        if (typeof showToast === 'function') showToast(msg, 'warning', 5000);
        else alert(msg);
        reject(new Error('IDB Blocked'));
      };
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

  async removeItem(storeName, key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e);
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