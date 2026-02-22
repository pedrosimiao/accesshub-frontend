// src/components/ConfirmEmailView.tsx

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AxiosError } from 'axios';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Loader2, CheckCircle2, RefreshCw } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';

export function ConfirmEmailView() {
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyEmail, resendOTP } = useAuth();

    // captura do e-mail enviado pelo navigate da tela de login
    const emailToResend = location.state?.email;

    // estado codigo de validação
    const [code, setCode] = useState('');
    // estado de envio de registro
    const [isSubmitting, setIsSubmitting] = useState(false);
    // estado para o loading de reenvio
    const [isResending, setIsResending] = useState(false);
    // status de validação
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    // msg de erro
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    // msg de sucesso do reenvio
    const [resendMessage, setResendMessage] = useState<string | null>(null);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length < 6) return;

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            await verifyEmail(code); // envia { code } para o novo endpoint
            setStatus('success');

            // user.is_active=True -> navegar para /login
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

    const handleResendOTP = async () => {
        if (!emailToResend) return;

        setIsResending(true);
        setErrorMessage(null);
        setResendMessage(null);

        try {
            await resendOTP(emailToResend);
            setResendMessage("Um novo código foi enviado para o seu e-mail!");
        } catch (err) {
            if (err instanceof AxiosError) {
                const axiosError = err as AxiosError<{ detail?: string }>;
                setErrorMessage(axiosError.response?.data?.detail || "Código inválido ou expirado.");
            } else {
                setErrorMessage("Erro ao reenviar o código. Tente novamente mais tarde.");
            }
        } finally {
            setIsResending(false);
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
                    <form onSubmit={onSubmit} className="space-y-4 flex flex-col">
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

                        {/* MENSAGENS DE ERRO OU SUCESSO (Reenvio) */}
                        {errorMessage && (
                            <p className="text-red-400 text-xs text-center p-2 bg-red-500/10 rounded border border-red-500/20 animate-shake">
                                {errorMessage}
                            </p>
                        )}
                        {resendMessage && (
                            <p className="text-emerald-400 text-xs text-center p-2 bg-emerald-500/10 rounded border border-emerald-500/20">
                                {resendMessage}
                            </p>
                        )}

                        {/* BOTÃO DE REENVIO SE TIVERMOS O E-MAIL EM MÃOS */}
                        {emailToResend && (
                            <div className="pt-4 text-center border-t border-zinc-800 mt-2">
                                <p className="text-xs text-zinc-500 mb-2">Não recebeu o código?</p>
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={isResending}
                                    className="text-zinc-300 hover:text-white text-xs flex items-center justify-center w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isResending ? (
                                        <><Loader2 className="w-3 h-3 mr-2 animate-spin" /> Reenviando...</>
                                    ) : (
                                        <><RefreshCw className="w-3 h-3 mr-2" /> Reenviar código para {emailToResend}</>
                                    )}
                                </button>
                            </div>
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
                            <p className="text-zinc-500 text-xs italic">Redirecionando para o login...</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}