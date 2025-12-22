/**
 * Browser API compatibility layer
 * Provides unified API for Chrome, Firefox, and Opera
 */

// Detect browser environment - Firefox uses 'browser', Chrome uses 'chrome'
// In Firefox, both 'browser' and 'chrome' may be available, but 'browser' is preferred
const isFirefox = typeof browser !== 'undefined' && typeof browser.runtime !== 'undefined';
const browserAPI = isFirefox ? browser : (typeof chrome !== 'undefined' ? chrome : null);

if (!browserAPI) {
  console.error('No browser extension API found');
}

/**
 * Get extension runtime
 */
export const runtime = {
  getURL: (path) => browserAPI.runtime.getURL(path),
  getManifest: () => browserAPI.runtime.getManifest(),
  get lastError() {
    return browserAPI.runtime.lastError;
  },
  onMessage: browserAPI?.runtime?.onMessage || {
    addListener: () => { },
    removeListener: () => { }
  },
  sendMessage: (message) => {
    return new Promise((resolve, reject) => {
      if (isFirefox) {
        browserAPI.runtime.sendMessage(message).then(resolve).catch(reject);
      } else {
        browserAPI.runtime.sendMessage(message, (response) => {
          if (browserAPI.runtime.lastError) {
            reject(new Error(browserAPI.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      }
    });
  }
};

/**
 * Storage API wrapper
 */
export const storage = {
  local: {
    get: (keys) => {
      return new Promise((resolve, reject) => {
        try {
          if (isFirefox) {
            browserAPI.storage.local.get(keys).then(resolve).catch(reject);
          } else {
            browserAPI.storage.local.get(keys, (result) => {
              if (browserAPI.runtime.lastError) {
                reject(new Error(browserAPI.runtime.lastError.message));
              } else {
                resolve(result);
              }
            });
          }
        } catch (e) {
          reject(e);
        }
      });
    },
    set: (items) => {
      return new Promise((resolve, reject) => {
        try {
          if (isFirefox) {
            browserAPI.storage.local.set(items).then(resolve).catch(reject);
          } else {
            browserAPI.storage.local.set(items, () => {
              if (browserAPI.runtime.lastError) {
                reject(new Error(browserAPI.runtime.lastError.message));
              } else {
                resolve();
              }
            });
          }
        } catch (e) {
          reject(e);
        }
      });
    },
    remove: (keys) => {
      return new Promise((resolve, reject) => {
        try {
          if (isFirefox) {
            browserAPI.storage.local.remove(keys).then(resolve).catch(reject);
          } else {
            browserAPI.storage.local.remove(keys, () => {
              if (browserAPI.runtime.lastError) {
                reject(new Error(browserAPI.runtime.lastError.message));
              } else {
                resolve();
              }
            });
          }
        } catch (e) {
          reject(e);
        }
      });
    }
  }
};

export default { runtime, storage };

