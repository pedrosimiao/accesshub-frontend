// src/components/ConfirmPasswordResetView.tsx

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { Loader2, CheckCircle2 } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const resetSchema = z.object({
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

type ResetFormFields = z.infer<typeof resetSchema>;

export function ConfirmPasswordResetView() {
    // captura dos códigos criptográficos direto da URL
    const { uid, token } = useParams<{ uid: string; token: string }>();

    const { confirmPasswordReset } = useAuth();
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success'>('idle');
    const [serverError, setServerError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<ResetFormFields>({
        resolver: zodResolver(resetSchema),
    });

    const onSubmit = async (data: ResetFormFields) => {
        // bloqueio em caso de acesso sem os códigos (uid & token) na URL
        if (!uid || !token) {
            setServerError("Link de recuperação inválido ou incompleto.");
            return;
        }

        setIsSubmitting(true);
        setServerError(null);

        try {
            // envio de dados da URL + senhas digitadas para a API
            await confirmPasswordReset(
                uid,
                token,
                data.password,
                data.confirmPassword
            );
            setStatus('success');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: unknown) {
            if (err instanceof AxiosError) {
                setServerError(err.response?.data?.detail || "Erro ao processar alteração.");
            } else {
                setServerError("Ocorreu um erro inesperado.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="z-10 w-full max-w-md bg-zinc-900/70 border-zinc-800 text-white shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-700">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold tracking-tight">
                    <span className="bg-clip-text text-transparent bg-linear-to-r from-zinc-100 to-zinc-500">
                        Nova Senha
                    </span>
                </CardTitle>
                <CardDescription className="text-zinc-500 mt-2 italic">
                    Defina sua nova credencial de acesso
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {status !== 'success' ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* 
                        UID e TOKEN "escondidos" na URL, 
                        não é preciso inputs para eles 
                        */}

                        <div className="space-y-2">
                            <Label htmlFor="password">Nova Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register('password')}
                                placeholder="••••••••"
                                className="bg-zinc-950/50 border-zinc-800 focus:ring-zinc-700 text-white"
                            />
                            {errors.password && <p className="text-red-500 text-[11px]">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                {...register('confirmPassword')}
                                placeholder="••••••••"
                                className="bg-zinc-950/50 border-zinc-800 focus:ring-zinc-700 text-white"
                            />
                            {errors.confirmPassword && <p className="text-red-500 text-[11px]">{errors.confirmPassword.message}</p>}
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-zinc-100 text-black hover:bg-white transition-all font-bold h-12 mt-2 hover:cursor-pointer"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : "Salvar Nova Senha"}
                        </Button>

                        {serverError && (
                            <p className="text-red-400 text-xs text-center p-2 bg-red-500/10 rounded border border-red-500/20 animate-shake">
                                {serverError}
                            </p>
                        )}
                    </form>
                ) : (
                    <div className="flex flex-col items-center gap-4 py-6 animate-in zoom-in-95 duration-500">
                        <div className="rounded-full bg-emerald-500/10 p-3 ring-1 ring-emerald-500/20">
                            <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                        </div>
                        <p className="text-center font-medium text-emerald-50 text-lg">
                                Senha atualizada com sucesso!
                        </p>
                            <p className="text-zinc-500 text-xs italic">Redirecionando para o login...</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}