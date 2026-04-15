export type PublicStoredItem = {
  slug: string;
  title: string;
};

const storageKeys = {
  favorites: "alakol-favorites",
  compare: "alakol-compare"
} as const;

export type PublicStorageKey = keyof typeof storageKeys;

function getStorageKey(key: PublicStorageKey) {
  return storageKeys[key];
}

export function readPublicList(key: PublicStorageKey) {
  if (typeof window === "undefined") return [] as PublicStoredItem[];
  try {
    return JSON.parse(window.localStorage.getItem(getStorageKey(key)) || "[]") as PublicStoredItem[];
  } catch {
    return [];
  }
}

export function writePublicList(key: PublicStorageKey, items: PublicStoredItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getStorageKey(key), JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("alakol-public-list-updated", { detail: { key } }));
}

export function togglePublicListItem(key: PublicStorageKey, item: PublicStoredItem, limit = 4) {
  const items = readPublicList(key);
  const exists = items.some((current) => current.slug === item.slug);

  if (exists) {
    const next = items.filter((current) => current.slug !== item.slug);
    writePublicList(key, next);
    return false;
  }

  const next = [...items, item].slice(-limit);
  writePublicList(key, next);
  return true;
}
