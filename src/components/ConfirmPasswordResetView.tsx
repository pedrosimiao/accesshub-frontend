import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    token: z.string().min(1, 'O token é obrigatório'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

type ResetFormFields = z.infer<typeof resetSchema>;

export function ConfirmPasswordResetView() {
    const navigate = useNavigate();
    const { confirmPasswordReset } = useAuth();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success'>('idle');
    const [serverError, setServerError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<ResetFormFields>({
        resolver: zodResolver(resetSchema),
    });

    const onSubmit = async (data: ResetFormFields) => {
        setIsSubmitting(true);
        setServerError(null);

        try {
            await confirmPasswordReset(data.token, data.password, data.confirmPassword);
            setStatus('success');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: unknown) {
            if (err instanceof AxiosError) {
                setServerError(err.response?.data?.detail || "Token inválido ou erro no servidor.");
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
                        Definir Nova Senha
                    </span>
                </CardTitle>
                <CardDescription className="text-zinc-500 mt-2 italic">
                    Insira o código enviado e sua nova senha
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {status !== 'success' ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="token" className="text-zinc-400">Token</Label>
                            <Input
                                id="token"
                                {...register('token')}
                                placeholder="Token de segurança"
                                className="bg-zinc-950/50 border-zinc-800 text-center font-mono focus:ring-zinc-700 text-white"
                            />
                            {errors.token && <p className="text-red-500 text-[11px]">{errors.token.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" size-sm className="text-zinc-400">Nova Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register('password')}
                                className="bg-zinc-950/50 border-zinc-800 focus:ring-zinc-700 text-white"
                            />
                            {errors.password && <p className="text-red-500 text-[11px]">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" size-sm className="text-zinc-400">Confirmar Senha</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                {...register('confirmPassword')}
                                className="bg-zinc-950/50 border-zinc-800 focus:ring-zinc-700 text-white"
                            />
                            {errors.confirmPassword && <p className="text-red-500 text-[11px]">{errors.confirmPassword.message}</p>}
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-zinc-100 text-black hover:bg-white transition-all font-bold h-12 mt-2"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : "Redefinir Senha"}
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
                            Senha atualizada!
                        </p>
                        <p className="text-zinc-500 text-xs italic">Você já pode fazer login.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}