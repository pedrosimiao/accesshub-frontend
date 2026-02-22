// src/components/LoginView.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { AxiosError } from 'axios';

import { FaGoogle, FaGithub } from 'react-icons/fa';
import { MailCheck, ArrowLeft } from 'lucide-react'; // icone feedback de e-mail

import { useAuth } from '../hooks/useAuth';

// Shadcn UI
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

// SCHEMA DE VALIDAÇÃO DINÂMICO
const authSchema = z.object({
  email: z.string()
    .min(1, 'O e-mail é obrigatório')
    .email('Formato de e-mail inválido'),
  password: z.string().optional().or(z.literal('')),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type AuthFormFields = z.infer<typeof authSchema>;

export function LoginView() {
  const navigate = useNavigate();
  const { login, signup, requestPasswordReset } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, setError, reset } = useForm<AuthFormFields>({
    resolver: zodResolver(authSchema),
  });

  // toggle login & cadastro
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setIsForgot(false);
    setServerError(null);
    setSuccessMessage(null);
    reset();
  };

  // toggle p/ tela "Esqueci a senha"
  const toggleForgot = () => {
    setIsForgot(true);
    setServerError(null);
    setSuccessMessage(null);
    reset();
  };

  const onSubmit = async (data: AuthFormFields) => {
    // validação manual da senha para Login e Cadastro
    if (!isForgot && (!data.password || data.password.length < 6)) {
      setError('password', { message: 'A senha deve ter no mínimo 6 caracteres' });
      return;
    }

    setIsSubmitting(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      if (isForgot) {
        // tenta recuperar a senha
        await requestPasswordReset(data.email);
        setSuccessMessage("Se o e-mail for válido, você receberá instruções de recuperação.");
        setTimeout(() => toggleMode(), 4000); // Volta pro login após 4s
      }
      else if (isLogin) {
        // tenta logar
        await login({ email: data.email, password: data.password! });
        navigate('/dashboard');
      }
      else {
        // tenta cadastrar
        await signup({ email: data.email, password: data.password! });
        setSuccessMessage("Conta criada! Verifique seu e-mail.");

        // TRANSPORTANDO O EMAIL NO STATE
        setTimeout(() => navigate('/confirm-email', { state: { email: data.email } }), 2000);
      }
    } catch (err: unknown) {
      // CAPTURA ERRO CUSTOMIZADO (USER_INACTIVE)
      if (err instanceof Error && err.message === "USER_INACTIVE") {
        setServerError("Sua conta ainda não foi ativada. Redirecionando para confirmação...");
        // TRANSPORTANDO O EMAIL NO STATE
        setTimeout(() => navigate('/confirm-email', { state: { email: data.email } }), 2000);
        return;
      }

      // CAPTURA ERROS DO AXIOS (ERROS DE VALIDAÇÃO DO DJANGO)
      if (err instanceof AxiosError) {
        const axiosError = err as AxiosError<{ email?: string[]; detail?: string }>;
        const responseData = axiosError.response?.data;

        if (axiosError.response?.status === 400) {
          if (responseData?.email && responseData.email.length > 0) {
            const emailMsg = responseData.email[0];
            if (emailMsg.includes("already exists") || emailMsg.includes("já está em uso")) {
              setServerError("Este e-mail já está cadastrado. Tente fazer login.");
            } else {
              setServerError(emailMsg);
            }
          }
          else if (responseData?.detail) {
            setServerError(responseData.detail);
          }
        } else if (axiosError.response?.status === 401) {
          setServerError("E-mail ou senha incorretos.");
        } else {
          setServerError("Ocorreu um erro no servidor. Tente novamente.");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const backendUrl = import.meta.env.VITE_API_URL;
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL;
  const targetUrl = encodeURIComponent(`${frontendUrl}/dashboard`);

  const handleGoogleLogin = () => window.location.href = `${backendUrl}/api/v1/auth/google/login/?next=${targetUrl}`;
  const handleGithubLogin = () => window.location.href = `${backendUrl}/api/v1/auth/github/login/?next=${targetUrl}`;

  return (
    <Card className="z-10 w-full max-w-95 bg-zinc-900/70 border-zinc-800 text-white shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-700 font-sans">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold tracking-tight">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-zinc-100 to-zinc-500">
            {isForgot ? "Recuperar Senha" : (isLogin ? "Acessar Plataforma" : "Criar nova Conta")}
          </span>
        </CardTitle>
        <CardDescription className="text-zinc-500 mt-2 italic">
          {isForgot ? "Enviaremos um link para redefinição" : (isLogin ? "Bem-vindo de volta" : "Cadastre-se agora")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {successMessage && (
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex flex-col items-center gap-2 text-blue-200 text-sm animate-in fade-in slide-in-from-top-4">
            <MailCheck className="h-5 w-5 text-blue-400" />
            <p className="text-center font-medium">{successMessage}</p>
          </div>
        )}

        {/* Esconde os botões sociais se estiver no modo Esqueci a Senha */}
        {!isForgot && (
          <>
            <div className="flex flex-col gap-3 animate-in fade-in duration-300">
              <Button type="button" onClick={handleGoogleLogin} className="w-full bg-white text-black hover:bg-zinc-200 transition-colors font-medium hover:cursor-pointer">
                <FaGoogle className="mr-2 h-4 w-4" /> Continuar com Google
              </Button>
              <Button type="button" onClick={handleGithubLogin} className="w-full bg-[#24292F] text-white hover:bg-[#24292F]/90 border border-zinc-800 hover:cursor-pointer">
                <FaGithub className="h-4 w-4 mr-2" /> Continuar com GitHub
              </Button>
            </div>

            <div className="relative animate-in fade-in duration-300">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#18181b] px-2 text-zinc-500 tracking-widest">Ou via e-mail</span>
              </div>
            </div>
          </>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-400">Email</Label>
            <Input id="email" {...register('email')} placeholder="exemplo@email.com" className="bg-zinc-950/50 border-zinc-800 focus:ring-zinc-700 text-white" />
            {errors.email && <p className="text-red-500 text-[11px]">{errors.email.message}</p>}
          </div>

          {/* Oculta os campos de senha se estiver no Esqueci a Senha */}
          {!isForgot && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-400">Senha</Label>
                {isLogin && (
                  <button type="button" onClick={toggleForgot} className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <Input id="password" type="password" {...register('password')} className="bg-zinc-950/50 border-zinc-800 focus:ring-zinc-700 text-white" />
              {errors.password && <p className="text-red-500 text-[11px]">{errors.password.message}</p>}
            </div>
          )}

          {!isLogin && !isForgot && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <Label htmlFor="confirmPassword" className="text-zinc-400">Confirmar Senha</Label>
              <Input id="confirmPassword" type="password" {...register('confirmPassword')} className="bg-zinc-950/50 border-zinc-800 focus:ring-zinc-700 text-white" />
              {errors.confirmPassword && <p className="text-red-500 text-[11px]">{errors.confirmPassword.message}</p>}
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full bg-zinc-100 text-black hover:bg-white transition-all font-bold hover:cursor-pointer">
            {isSubmitting ? "Processando..." : (isForgot ? "Enviar instruções" : (isLogin ? "Entrar" : "Finalizar Cadastro"))}
          </Button>

          {serverError && (
            <p className="text-red-400 text-xs text-center p-2 bg-red-500/10 rounded border border-red-500/20">
              {serverError}
            </p>
          )}
        </form>

        <div className="text-center text-sm pt-2 flex flex-col items-center gap-2">
          {isForgot ? (
            <button type="button" onClick={toggleMode} className="flex items-center text-zinc-400 hover:text-white transition-colors text-xs font-medium">
              <ArrowLeft className="w-3 h-3 mr-1" /> Voltar para o Login
            </button>
          ) : (
            <div>
              <span className="text-zinc-500">
                {isLogin ? "Ainda não tem conta? " : "Já possui registro? "}
              </span>
                <button type="button" onClick={toggleMode} className="text-zinc-200 hover:text-white underline underline-offset-4 transition-colors font-medium hover:cursor-pointer">
                  {isLogin ? "Cadastre-se" : "Fazer Login"}
                </button>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 justify-center pb-6">
        <p className="text-[11px] text-center text-zinc-500 px-4 leading-relaxed">
          Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
        </p>
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
          AccessHub v1.0
        </p>
      </CardFooter>
    </Card>
  );
}