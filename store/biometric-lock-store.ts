import { useSyncExternalStore } from "react";

type Listener = () => void;

let isLocked = false;
const listeners = new Set<Listener>();

function emitChange() {
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return isLocked;
}

export function lock() {
  if (!isLocked) {
    isLocked = true;
    emitChange();
  }
}

export function unlock() {
  if (isLocked) {
    isLocked = false;
    emitChange();
  }
}

export function useBiometricLockStore() {
  const locked = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { isLocked: locked, lock, unlock };
}
