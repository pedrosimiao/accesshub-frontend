// src/types/auth.ts

export interface UserProfile {
    pk: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
}

export interface LoginPayload {
    email?: string;
    password?: string;
}

// payload para registro manual
export interface RegisterPayload extends LoginPayload {
    confirmPassword?: string;
}

export interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    login: (credentials: LoginPayload) => Promise<void>;
    signup: (credentials: RegisterPayload) => Promise<void>;
    verifyEmail: (key: string) => Promise<void>;
    resendOTP: (email: string) => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
    confirmPasswordReset: (token: string, password1: string, password2: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

export interface DjangoAuthError {
    email?: string[];
    username?: string[];
    password1?: string[];
    password2?: string[];
    non_field_errors?: string[];
    detail?: string;
}