function isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function setItem(key: string, value: string) {
    if (!isBrowser()) return;
    localStorage.setItem(key, value);
}

function getItem(key: string): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(key);
}

function removeItem(key: string) {
    if (!isBrowser()) return;
    localStorage.removeItem(key);
}

const storage = {
    setItem,
    getItem,
    removeItem,
};

export default storage;