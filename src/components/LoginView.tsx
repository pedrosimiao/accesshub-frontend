// src/components/LoginView.tsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { z } from 'zod';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { MailCheck } from 'lucide-react'; // Ícone para feedback de e-mail

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
  password: z.string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres'),
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
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AuthFormFields>({
    resolver: zodResolver(authSchema),
  });

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setServerError(null);
    setSuccessMessage(null);
    reset();
  };

  const onSubmit = async (data: AuthFormFields) => {
    setIsSubmitting(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      if (isLogin) {
        await login({ email: data.email, password: data.password });
        navigate('/dashboard');
      } else {
        // CADASTRO MANUAL
        await signup({ email: data.email, password: data.password });

        // FEEDBACK DE SUCESSO
        setSuccessMessage("Verifique seu e-mail para confirmar o cadastro!");
        setIsLogin(true); // Retorna para o modo login
        reset(); // Limpa campos
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ detail?: string; email?: string[] }>;
      let message = "Erro ao processar. Verifique os dados.";

      if (axiosError.response?.status === 400 && axiosError.response?.data?.email) {
        message = "Este e-mail já está em uso.";
      } else if (axiosError.response?.data?.detail) {
        message = axiosError.response.data.detail;
      }
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const backendUrl = import.meta.env.VITE_API_URL;
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL;
  const targetUrl = encodeURIComponent(`${frontendUrl}/dashboard`);

  const handleGoogleLogin = () => {
    window.location.href = `${backendUrl}/api/v1/auth/google/login/?next=${targetUrl}`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${backendUrl}/api/v1/auth/github/login/?next=${targetUrl}`;
  };

  return (
    <Card className="z-10 w-full max-w-95 bg-zinc-900/70 border-zinc-800 text-white shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-700 font-sans">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold tracking-tight">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-zinc-100 to-zinc-500">
            {isLogin ? "Acessar Plataforma" : "Criar nova Conta"}
          </span>
        </CardTitle>
        <CardDescription className="text-zinc-500 mt-2 italic">
          {isLogin ? "Bem-vindo de volta" : "Cadastre-se agora"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* MENSAGEM DE SUCESSO (E-mail enviado) */}
        {successMessage && (
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex flex-col items-center gap-2 text-blue-200 text-sm animate-in fade-in slide-in-from-top-4">
            <MailCheck className="h-5 w-5 text-blue-400" />
            <p className="text-center font-medium">{successMessage}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white text-black hover:bg-zinc-200 transition-colors font-medium hover:cursor-pointer"
          >
            <FaGoogle className="mr-2 h-4 w-4" /> Continuar com Google
          </Button>

          <Button
            type="button"
            onClick={handleGithubLogin}
            className="w-full bg-[#24292F] text-white hover:bg-[#24292F]/90 border border-zinc-800 hover:cursor-pointer"
          >
            <FaGithub className="h-4 w-4 mr-2" /> Continuar com GitHub
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-[#18181b] px-2 text-zinc-500 tracking-widest">Ou via e-mail</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-400">Email</Label>
            <Input id="email" {...register('email')} placeholder="exemplo@email.com" className="bg-zinc-950/50 border-zinc-800 focus:ring-zinc-700 text-white" />
            {errors.email && <p className="text-red-500 text-[11px]">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-400">Senha</Label>
            <Input id="password" type="password" {...register('password')} className="bg-zinc-950/50 border-zinc-800 focus:ring-zinc-700 text-white" />
            {errors.password && <p className="text-red-500 text-[11px]">{errors.password.message}</p>}
          </div>

          {!isLogin && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <Label htmlFor="confirmPassword" className="text-zinc-400">Confirmar Senha</Label>
              <Input id="confirmPassword" type="password" {...register('confirmPassword')} className="bg-zinc-950/50 border-zinc-800 focus:ring-zinc-700 text-white" />
              {errors.confirmPassword && <p className="text-red-500 text-[11px]">{errors.confirmPassword.message}</p>}
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full bg-zinc-100 text-black hover:bg-white transition-all font-bold hover:cursor-pointer">
            {isSubmitting ? "Processando..." : (isLogin ? "Entrar" : "Finalizar Cadastro")}
          </Button>

          {serverError && (
            <p className="text-red-400 text-xs text-center p-2 bg-red-500/10 rounded border border-red-500/20">
              {serverError}
            </p>
          )}
        </form>

        <div className="text-center text-sm pt-2">
          <span className="text-zinc-500">
            {isLogin ? "Ainda não tem conta? " : "Já possui registro? "}
          </span>
          <button
            type="button"
            onClick={toggleMode}
            className="text-zinc-200 hover:text-white underline underline-offset-4 transition-colors font-medium hover:cursor-pointer"
          >
            {isLogin ? "Cadastre-se" : "Fazer Login"}
          </button>
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