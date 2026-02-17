// src/pages/DashboardPage.tsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Waves from "@/components/Waves";
import { Button } from "@/components/ui/button";

const WAVE_CONFIG = {
    lineColor: "#52525b",
    backgroundColor: "transparent",
    waveSpeedX: 0.015,
    waveSpeedY: 0.007,
    waveAmpX: 35,
    waveAmpY: 20,
    friction: 0.93,
    tension: 0.008,
    maxCursorMove: 100,
    xGap: 12,
    yGap: 36,
};

export default function DashboardPage() {
    const navigate = useNavigate();
    const { user, loading, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Erro ao sair:", error);
        }
    }

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login', { replace: true });
        }
    }, [loading, user, navigate]);

    if (loading) {
        return (
            <main className="relative w-full h-screen bg-black flex items-center justify-center">
                <p className="text-xl text-zinc-400 animate-pulse">Verificando sessão...</p>
            </main>
        );
    }

    if (!user) return null;

    return (
        <main className="relative w-full h-screen bg-black overflow-hidden font-sans">

            {/* Background Waves */}
            <div className="absolute inset-0 z-0 opacity-40">
                <Waves {...WAVE_CONFIG} />
            </div>

            {/* BOTÃO DE LOGOUT */}
            <div className="absolute top-4 right-4 z-20">
                <Button
                    onClick={handleLogout}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-200"
                >
                    Logout
                </Button>
            </div>

            {/* Conteúdo Central */}
            <div className="relative z-10 flex items-center justify-center h-full">
                <h1 className="text-4xl font-bold text-white">
                    <span className="bg-clip-text text-transparent bg-linear-to-r from-zinc-100 to-zinc-500">
                        Welcome!
                    </span>
                </h1>
            </div>
        </main>
    );
}