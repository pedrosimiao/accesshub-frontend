// src/components/ConfirmEmailView.tsx

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

import api from '../api/axios';

// Shadcn UI 
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';

export function ConfirmEmailView() {
    const { key } = useParams(); // captura da chave da URL enviada pelo Django
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        const verifyEmail = async () => {
            if (!key) {
                setStatus('error');
                return;
            }

            try {
                // Endpoint padrão do dj-rest-auth para verificação
                await api.post('/api/v1/auth/registration/verify-email/', { key });
                setStatus('success');
            } catch (error) {
                console.error("Erro na verificação de e-mail:", error);
                setStatus('error');
            }
        };

        verifyEmail();
    }, [key]);

    return (
        <div className="flex items-center justify-center w-full min-h-[50vh]">
            <Card className="z-10 w-full max-w-md bg-zinc-900/70 border-zinc-800 text-white shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-700 font-sans">

                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        <span className="bg-clip-text text-transparent bg-linear-to-r from-zinc-100 to-zinc-500">
                            Confirmação de Conta
                        </span>
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col items-center justify-center py-8 space-y-6">

                    {/* ESTADO: CARREGANDO */}
                    {status === 'loading' && (
                        <div className="flex flex-col items-center gap-4 animate-pulse">
                            <Loader2 className="h-12 w-12 text-zinc-500 animate-spin" />
                            <p className="text-zinc-400 text-sm">Validando sua chave de acesso...</p>
                        </div>
                    )}

                    {/* ESTADO: SUCESSO */}
                    {status === 'success' && (
                        <div className="flex flex-col items-center gap-4 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="rounded-full bg-emerald-500/10 p-3 ring-1 ring-emerald-500/20">
                                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-lg font-medium text-zinc-100">E-mail Confirmado!</p>
                                <p className="text-sm text-zinc-400 max-w-65">
                                    Sua conta foi ativada com sucesso. Você já pode acessar a plataforma.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ESTADO: ERRO */}
                    {status === 'error' && (
                        <div className="flex flex-col items-center gap-4 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="rounded-full bg-red-500/10 p-3 ring-1 ring-red-500/20">
                                <XCircle className="h-10 w-10 text-red-400" />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-lg font-medium text-zinc-100">Link Inválido</p>
                                <p className="text-sm text-zinc-400 max-w-65">
                                    Não foi possível verificar seu e-mail. O link pode ter expirado ou já foi utilizado.
                                </p>
                            </div>
                        </div>
                    )}

                </CardContent>

                <CardFooter className="flex justify-center pb-8 pt-2">
                    {status === 'success' ? (
                        <Button
                            asChild
                            className="w-full bg-zinc-100 text-black hover:bg-white transition-all font-bold hover:cursor-pointer"
                        >
                            <Link to="/login">Ir para Login</Link>
                        </Button>
                    ) : (
                        // Se deu erro ou loading, permite voltar
                        status !== 'loading' && (
                            <Button
                                asChild
                                variant="outline"
                                className="w-full border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                            >
                                <Link to="/login">Voltar ao Início</Link>
                            </Button>
                        )
                    )}
                </CardFooter>

                <div className="pb-4 border-t border-zinc-800/50 mx-6 pt-4 text-center">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
                        AccessHub Security
                    </p>
                </div>
            </Card>
        </div>
    );
}