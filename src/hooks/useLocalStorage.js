// useLocalStorage.js
export function useLocalStorage(key, defaultValue) {
  const get = () => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const set = (value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage error:', e);
    }
  };

  const remove = () => {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.error('LocalStorage error:', e);
    }
  };

  return { get, set, remove };
}
