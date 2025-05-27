import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { parseCookies } from 'nookies';

interface Role {
    id: string;
    name: string;
}

export interface User {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    permissions?: string[];
    roles?: Role[];
}

interface AuthContextType {
    currentUser: User | null;
    isLoadingAuth: boolean;
    isAuthenticated: boolean;
    refetchUserProfile: () => Promise<void>;
    getUserIdFromToken: () => string | null;
}
const parseJwt = (token: string): any => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Error parsing JWT token:', e);
        return null;
    }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    const fetchUserProfile = async () => {
        setIsLoadingAuth(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
                withCredentials: true,
            });
            if (response.data) {
                setCurrentUser(response.data);
            } else {
                setCurrentUser(null);
            }
        } catch (error) {
            if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
            } else {
                console.error('AuthContext: Error fetching user profile.', error);
            }
            setCurrentUser(null);
        } finally {
            setIsLoadingAuth(false);
        }
    };

    const getUserIdFromToken = (): string | null => {
        try {
            const cookies = parseCookies();
            const authToken = cookies.authToken || cookies.jwt || cookies.token;
            
            if (!authToken) return null;
            
            const decodedToken = parseJwt(authToken);
            return decodedToken?.userId || decodedToken?.sub || null;
        } catch (error) {
            console.error('Error getting userId from token:', error);
            return null;
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    return (
        <AuthContext.Provider value={{
            currentUser,
            isLoadingAuth,
            isAuthenticated: !!currentUser,
            refetchUserProfile: fetchUserProfile,
            getUserIdFromToken
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
