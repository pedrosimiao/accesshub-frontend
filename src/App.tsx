// src/App.tsx

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ConfirmEmailPage from './pages/ConfirmEmailPage';
import ConfirmPasswordResetPage from './pages/ConfirmPasswordResetPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  console.log("Estado do User:", user)

  // Loading padrão
  if (loading) {
    return (
      <main className="relative w-full h-screen bg-black flex items-center justify-center">
        <p className="text-xl text-zinc-400 animate-pulse">Verificando sessão...</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  console.log("Estado do User:", user)
  return <>{children}</>;
};

function App() {
  return (
    // Removido o <BrowserRouter> daqui, pois já está no main.tsx
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />

      <Route path="/confirm-email" element={
        <PublicRoute>
          <ConfirmEmailPage />
        </PublicRoute>
      } />

      <Route path="/password-reset-confirm" element={
        <PublicRoute>
          <ConfirmPasswordResetPage />
        </PublicRoute>
      } />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;