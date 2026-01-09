// src/context/AuthProvider.tsx

import { useState, useEffect, type ReactNode } from 'react';

// types de erro do axios
import { AxiosError } from 'axios';
// instância configurada do Axios
import api from '../api/axios';

import { AuthContext } from './AuthContext';
import type { UserProfile, LoginPayload, RegisterPayload, DjangoAuthError } from '../types/auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // estado do current user
    const [user, setUser] = useState<UserProfile | null>(null);
    // estado de carregamento
    const [loading, setLoading] = useState<boolean>(true);

    // função core de autenticação
    const refreshUser = async () => {
        try {
            // consulta o user atual ao endpoint de autenticação no backend
            const response = await api.get<UserProfile>('/api/v1/auth/user/');
            setUser(response.data);
        } catch {
            // captura erro (401) caso não haja user logado
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // lista de dependências vazia no useEffect => executa de refreshUser na montagem do app
    // verifica a session
    // atualiza o estado global
    useEffect(() => {
        refreshUser();
    }, []);


    // Login
    const login = async (credentials: LoginPayload) => {
        // cria sessão no backend com as credenciais tipadas
        // chamada de POST para o endpoint de login da API
        await api.post('/api/v1/auth/login/', credentials);
        await refreshUser();
    };

    // Signup
    const signup = async (credentials: RegisterPayload) => {
    const payload = {
        email: credentials.email,
        password1: credentials.password,
        password2: credentials.password,
    };

    try {
        // chamada de POST no endpoint de registro via axios.ts (CSRF e BaseURL automáticos)
        await api.post('/api/v1/auth/registration/', payload);
    } catch (err) {
        const error = err as AxiosError<DjangoAuthError>;

        if (error.response?.data) {
            console.error("Erro no Registro:", error.response.data);
        }
        
        throw error;
    }
};

    // Logout
    const logout = async () => {
        try {
            await api.post('/api/v1/auth/logout/');
        } finally {
            setUser(null);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};