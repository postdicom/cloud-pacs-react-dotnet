import { createContext, useContext, useState, useEffect } from 'react';
import type { User } from './interfaces/User';
import type { LoginCredentials } from './interfaces/LoginCredentials';
import type { AuthContextType } from './interfaces/AuthContextType';
import type { AuthProviderProps } from './interfaces/AuthProviderProps';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const login = async (credentials: LoginCredentials): Promise<void> => {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        })

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json()
        localStorage.setItem('token', data.token)
        setUser(data.user);
    };


    const logout = () => {
        setUser(null)
        localStorage.removeItem('token')
    }

    const value: AuthContextType = { user, loading, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}