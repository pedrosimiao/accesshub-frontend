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

    useEffect(() => {
        const initialize = async () => {
            try {
                // plantar o cookie no navegador e resolver o "CSRF Missing"
                await api.get('/api/v1/auth/csrf/');
                // verifica a sessão
                await refreshUser();
            } catch (error) {
                console.error("Falha na inicialização de segurança:", error);
                setUser(null);
                setLoading(false);
            }
        };

        initialize();
    }, []);


    // Login
    const login = async (credentials: LoginPayload) => {
        try {
            await api.post('/api/v1/auth/login/', credentials);
            await refreshUser();
        } catch (err: unknown) {
            if (err instanceof AxiosError) {
                // Se o backend retornar 403, lança exceção customizada
                if (err.response?.status === 403) {
                    throw new Error("USER_INACTIVE");
                }
            }
            throw err;
        }
    };


    // Verify Email
    const verifyEmail = async (otpCode: string) => {
        try {
            // Ajustado para o seu novo endpoint manual e campo 'code'
            await api.post('/api/v1/auth/verify-email/', { code: otpCode });

            // Após ativar, limpamos o usuário para garantir que ele faça o login manual
            setUser(null);
        } catch (err: unknown) {
            const error = err as AxiosError<DjangoAuthError>;
            console.error("Erro na Verificação OTP:", error.response?.data);
            throw error;
        }
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

            setUser(null);

        } catch (err) {
            const error = err as AxiosError<DjangoAuthError>;
            console.error("Erro no Registro:", error.response?.data);
            throw error;
        }
    };



    // Logout
    // src/context/AuthProvider.tsx

    const logout = async () => {
        try {
            await api.post('/api/v1/auth/logout/');
        } finally {
            setUser(null);
            window.location.href = '/login';
        }
    };


    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser, verifyEmail }}>
            {children}
        </AuthContext.Provider>
    );
};