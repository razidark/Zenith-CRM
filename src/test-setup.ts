import '@testing-library/jest-dom/vitest';

// Node 26 exposes its own experimental `localStorage` global that is only
// populated when `--localstorage-file` is passed. Under vitest's jsdom
// environment that global shadows jsdom's Storage, so `localStorage` resolves
// to `undefined` and every storage-backed test throws
// "Cannot read properties of undefined (reading 'clear')".
//
// Restore a working Storage implementation for the test run. The app itself is
// unaffected — in a browser/Electron runtime `localStorage` is provided by the
// environment.
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();

  const memoryStorage = {
    get length() {
      return store.size;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(String(key), String(value));
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };

  Object.defineProperty(globalThis, 'localStorage', {
    value: memoryStorage,
    configurable: true,
    writable: true,
  });

  if (typeof globalThis.window !== 'undefined') {
    Object.defineProperty(globalThis.window, 'localStorage', {
      value: memoryStorage,
      configurable: true,
      writable: true,
    });
  }
}
