import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ConfirmEmailPage from './pages/ConfirmEmailPage'; // Novo Import

// PENDENTE: implementação de guards de rota

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* rota de captura do token de confirmação.  */}
        {/* parâmetro ':key' é lido pelo ConfirmEmailView para validar no backend */}
        {/* token vem do Django via email */}        
        <Route path="/confirm-email/:key" element={<ConfirmEmailPage />} />

        {/* Redirecionamentos */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;