// src/pages/LoginPage.tsx

import Waves from "@/components/Waves"; 
import { LoginView } from "@/components/LoginView";

// Configuração visual idêntica à que você definiu
const WAVE_CONFIG = {
  lineColor: "#52525b", // Zinc-600
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

export default function LoginPage() {
  return (
    <main className="relative w-full h-screen bg-black overflow-hidden font-sans">
      
      {/* Background com Waves - z-0 */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Waves {...WAVE_CONFIG} /> 
      </div>

      {/* Conteúdo Central - z-10 */}
      <div className="relative z-10 flex items-center justify-center h-full px-4">
        {/* Card de Login que consome o useAuth */}
        <LoginView /> 
      </div>

    </main>
  );
}