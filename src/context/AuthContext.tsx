import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";

const TOKEN_KEY = "auth_token";

type AuthContextType = {
    token: string | null;
    isLoading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // Cargar el token al iniciar la app
        const loadToken = async () => {
            try {
                const stored = await SecureStore.getItemAsync(TOKEN_KEY);
                setToken(stored);
            } catch (e) {
                console.error("Error cargando el token", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadToken();
    }, []);

    const login = async (newToken: string) => {
        await SecureStore.setItemAsync(TOKEN_KEY, newToken);
        setToken(newToken);
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);