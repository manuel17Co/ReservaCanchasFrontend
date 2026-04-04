import * as SecureStore from 'expo-secure-store';

class SecureStoreService {
    async set<T>(key: string, value: T): Promise<void> {
        await SecureStore.setItemAsync(key, JSON.stringify(value));
    }
    async get<T>(key: string): Promise<T | null> {
        const raw = await SecureStore.getItemAsync(key);
        if (raw === null) return null;
        return JSON.parse(raw) as T;
    }

    async remove(key: string): Promise<void> {
        await SecureStore.deleteItemAsync(key);
    }
}

export const secureStoreService = new SecureStoreService();