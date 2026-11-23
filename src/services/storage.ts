// src/services/storage.ts
/**
 * Centralized, safe browser localStorage manager for Veylo.
 * All keys are strictly prefixed with "veylo:".
 * Includes schema versioning, corrupt data recovery, and safe JSON serialization.
 */

export const STORAGE_PREFIX = 'veylo:';
export const CURRENT_SCHEMA_VERSION = 1;

export const KEYS = {
  SCHEMA_VERSION: `${STORAGE_PREFIX}schema_version`,
  AUTH: `${STORAGE_PREFIX}auth`,
  CUSTOMERS: `${STORAGE_PREFIX}customers`,
  TEAM: `${STORAGE_PREFIX}team`,
  PLANS: `${STORAGE_PREFIX}plans`,
  ACTIVITY: `${STORAGE_PREFIX}activity`,
  SETTINGS: `${STORAGE_PREFIX}settings`,
  THEME: `${STORAGE_PREFIX}theme`,
} as const;

/**
 * Checks if localStorage is accessible in the current browser environment.
 */
export function isStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const testKey = `${STORAGE_PREFIX}__test__`;
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely retrieve and parse a JSON item from localStorage.
 * If corrupt or missing, returns fallback or null without throwing.
 */
export function getItem<T>(key: string, fallback: T | null = null): T | null {
  if (!isStorageAvailable()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[Veylo Storage] Corrupt data detected for key "${key}". Returning fallback.`, error);
    return fallback;
  }
}

/**
 * Safely serialize and write an item to localStorage.
 */
export function setItem<T>(key: string, value: T): boolean {
  if (!isStorageAvailable()) return false;
  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`[Veylo Storage] Failed to write key "${key}".`, error);
    return false;
  }
}

/**
 * Safely remove an item by key.
 */
export function removeItem(key: string): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`[Veylo Storage] Failed to remove key "${key}".`, error);
  }
}

/**
 * Removes ONLY Veylo-prefixed keys from localStorage.
 * Prevents accidental clearing of unrelated applications on the same origin.
 */
export function clearVeyloStorage(): void {
  if (!isStorageAvailable()) return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && (key.startsWith(STORAGE_PREFIX) || key.startsWith('controlly:'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => window.localStorage.removeItem(k));
  } catch (error) {
    console.error('[Veylo Storage] Failed to clear Veylo storage.', error);
  }
}

/**
 * Export all Veylo data as a single JSON object for backup / debugging.
 */
export function exportVeyloState(): Record<string, unknown> {
  const state: Record<string, unknown> = {};
  if (!isStorageAvailable()) return state;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        state[key] = getItem(key);
      }
    }
  } catch (error) {
    console.error('[Veylo Storage] Error exporting state.', error);
  }
  return state;
}

/**
 * Import a previously exported Veylo JSON state.
 */
export function importVeyloState(state: Record<string, unknown>): boolean {
  if (!isStorageAvailable()) return false;
  try {
    Object.entries(state).forEach(([key, value]) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        setItem(key, value);
      }
    });
    return true;
  } catch (error) {
    console.error('[Veylo Storage] Error importing state.', error);
    return false;
  }
}
