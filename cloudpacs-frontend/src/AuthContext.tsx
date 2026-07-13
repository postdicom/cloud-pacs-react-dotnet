import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
    accountId: string;
    name: string;
    email: string;
    userRole: string;
    password: string;
}

interface LoginCredentials {
    email: string;
    password: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        checkAuth()
            .then((u: User | null) => setUser(u))
            .finally(() => setLoading(false));
    }, []);

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

async function checkAuth(): Promise<User | null> {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const response = await fetch('/api/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
        if (!response.ok) throw new Error();
        const user = await response.json();
        return user;

    } catch (e) {
        localStorage.removeItem('token');
        return null;
    }
}