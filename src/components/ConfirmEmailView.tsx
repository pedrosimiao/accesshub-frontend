// src/components/ConfirmEmailView.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AxiosError } from 'axios';
import { Loader2, CheckCircle2 } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ConfirmEmailView() {
    const navigate = useNavigate();
    const { verifyEmail } = useAuth();

    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length < 6) return;

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            await verifyEmail(code); // envia { code } para o novo endpoint
            setStatus('success');

            // redirecionar para /login e não para /dashboard.
            // user agora é is_active=True, o login funciona
            setTimeout(() => navigate('/login'), 2500);

        } catch (err: unknown) {
            if (err instanceof AxiosError) {
                const axiosError = err as AxiosError<{ detail?: string }>;
                setErrorMessage(axiosError.response?.data?.detail || "Código inválido ou expirado.");
            } else {
                setErrorMessage("Ocorreu um erro inesperado.");
            }
            setStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="z-10 w-full max-w-md bg-zinc-900/70 border-zinc-800 text-white shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-700">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold tracking-tight">
                    <span className="bg-clip-text text-transparent bg-linear-to-r from-zinc-100 to-zinc-500">
                        Verificar E-mail
                    </span>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {status !== 'success' ? (
                    <form onSubmit={onSubmit} className="space-y-4">
                        <p className="text-center text-zinc-400 text-sm italic">
                            Insira o código de 6 dígitos enviado ao seu e-mail.
                        </p>

                        <Input
                            placeholder="000000"
                            maxLength={6}
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                            className="bg-zinc-950/50 border-zinc-800 text-center text-3xl tracking-[0.5em] font-mono h-16 focus:ring-zinc-700"
                        />

                        <Button
                            disabled={isSubmitting || code.length < 6}
                            className="w-full bg-zinc-100 text-black hover:bg-white transition-all font-bold h-12"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : "Confirmar Registro"}
                        </Button>

                        {errorMessage && (
                            <p className="text-red-400 text-xs text-center p-2 bg-red-500/10 rounded border border-red-500/20 animate-shake">
                                {errorMessage}
                            </p>
                        )}
                    </form>
                ) : (
                    <div className="flex flex-col items-center gap-4 py-6 animate-in zoom-in-95 duration-500">
                        <div className="rounded-full bg-emerald-500/10 p-3 ring-1 ring-emerald-500/20">
                            <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                        </div>
                            <p className="text-center font-medium text-emerald-50 text-lg">
                                Conta ativada com sucesso!
                            </p>
                        <p className="text-zinc-500 text-xs italic">Redirecionando para o painel...</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}