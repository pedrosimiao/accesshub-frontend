// src/context/AuthProvider.tsx

import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// types de erro do axios
import { AxiosError } from 'axios';
// instância configurada do Axios
import api from '../api/axios';

import { AuthContext } from './AuthContext';

import type {
    UserProfile,
    LoginPayload,
    RegisterPayload,
    DjangoAuthError
} from '../types/auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // estado do current user
    const [user, setUser] = useState<UserProfile | null>(null);

    // estado de carregamento
    const [loading, setLoading] = useState<boolean>(true);

    // navegaçao entre rotas
    const navigate = useNavigate();


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


    // inicialização (captura de token)
    useEffect(() => {
        const initialize = async () => {
            try {
                const response = await api.get('/api/v1/auth/csrf/');

                const token = response.data.csrfToken;

                // configurando o Axios manualmente para todas as próximas chamadas
                if (token) {
                    api.defaults.headers.common['X-CSRFToken'] = token;
                    console.log("Header X-CSRFToken configurado.");
                }

                await refreshUser();

            } catch (error) {
                console.error("Falha na inicialização:", error);
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

            // refreshing token CSRF (Session Rotation)
            const response = await api.get('/api/v1/auth/csrf/');
            if (response.data.csrfToken) {
                api.defaults.headers.common['X-CSRFToken'] = response.data.csrfToken;
            }

            await refreshUser();
            navigate('/dashboard');

        } catch (err: unknown) {
            if (err instanceof AxiosError && err.response?.status === 403) {
                throw new Error("USER_INACTIVE");
            }
            throw err;
        }
    };


    // Logout
    const logout = async () => {
        try {
            // post cabeçalho X-CSRFToken, evitar status 403
            await api.post('/api/v1/auth/logout/');
            console.log("Logout backend realizado com sucesso.");

        } catch (error) {
            console.error("Erro ao deslogar no servidor:", error);

        } finally {
            // limpeza de estado
            setUser(null);
            delete api.defaults.headers.common['X-CSRFToken'];

            navigate('/login');
        }
    };


    // Verificação via Email (MFA)
    const verifyEmail = async (otpCode: string) => {
        try {
            // ajustado para endpoint manual e campo 'code'
            await api.post('/api/v1/auth/verify-email/', { code: otpCode });

            // user ativo -> limpar user para garantir login manual
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
            // POST no endpoint de registr
            // (CSRF e BaseURL automáticos)
            await api.post('/api/v1/auth/registration/', payload);

            setUser(null);

        } catch (err) {
            const error = err as AxiosError<DjangoAuthError>;
            console.error("Erro no Registro:", error.response?.data);
            throw error;
        }
    };



    // reenvio de código OTP
    const resendOTP = async (email: string) => {
        try {
            await api.post('/api/v1/auth/resend-otp/', { email });

        } catch (err) {
            console.error("Erro ao reenviar OTP:", err);
            throw err;
        }
    };



    // esqueci minha senha
    const requestPasswordReset = async (email: string) => {
        try {
            await api.post('/api/v1/auth/password/reset/', { email });
        } catch (err) {
            console.error("Erro ao solicitar reset de senha:", err);
            throw err;
        }
    };



    // Confirmar nova senha 
    // envio do uid e token recebidos da View junto com as senhas
    const confirmPasswordReset = async (uid: string, token: string, password1: string, password2: string) => {
        try {
            // padrão do Django Rest Auth/AllAuth
            await api.post('/api/v1/auth/password/reset/confirm/', {
                uid: uid,
                token: token,
                password1: password1,
                password2: password2
            });
        } catch (err) {
            console.error("Erro ao confirmar reset de senha:", err);
            throw err;
        }
    };


    return (
        <AuthContext.Provider value={{ 
            user, loading, login, signup, logout, 
            refreshUser, verifyEmail, resendOTP, 
            requestPasswordReset, confirmPasswordReset }}>
            {children}
        </AuthContext.Provider>
    );
};