import { useEffect, useState, useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PersistedStoreOptions<T extends string> {
  storageKey: string;
  defaultValue: T;
  validValues: T[];
}

interface PersistedStoreState<T extends string> {
  current: T;
  isLoaded: boolean;
}

export function createPersistedStore<T extends string>(options: PersistedStoreOptions<T>) {
  const { storageKey, defaultValue, validValues } = options;

  type Listener = () => void;

  let currentValue: T = defaultValue;
  let isLoaded = false;
  const listeners = new Set<Listener>();

  function emitChange() {
    listeners.forEach((l) => l());
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function getSnapshot(): T {
    return currentValue;
  }

  async function load() {
    const stored = await AsyncStorage.getItem(storageKey);
    if (stored && validValues.includes(stored as T)) {
      currentValue = stored as T;
    }
    isLoaded = true;
    emitChange();
  }

  async function set(value: T) {
    currentValue = value;
    await AsyncStorage.setItem(storageKey, value);
    emitChange();
  }

  function useStore(): PersistedStoreState<T> & { set: (value: T) => Promise<void> } {
    const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    const [loaded, setLoaded] = useState(isLoaded);

    useEffect(() => {
      if (!isLoaded) {
        load().then(() => setLoaded(true));
      }
    }, []);

    return { current, isLoaded: loaded, set };
  }

  return { useStore, load, set, getSnapshot };
}
