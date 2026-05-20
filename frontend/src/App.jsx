import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/ui/Toast';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Hub from './pages/Hub';
import Insights from './pages/Insights';
import SimulatorHub from './pages/simulators/SimulatorHub';
import SimDebt from './pages/simulators/SimDebt';
import SimSavings from './pages/simulators/SimSavings';
import SimLoan from './pages/simulators/SimLoan';
import SimEmergency from './pages/simulators/SimEmergency';
import SimBudget from './pages/simulators/SimBudget';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import NotFound from './pages/NotFound';
import Subscriptions from './pages/Subscriptions';
import { useEffect } from 'react';
import api from './api/axios';
import './index.css';

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    // Ping el backend cada 5 minutos (300,000 ms) para mantener el Free Tier de Render despierto
    const interval = setInterval(() => {
      api.get('/users/ping/').catch(() => {});
    }, 300000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* App Tools Layout */}
            <Route path="/app" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="hub" element={<Hub />} />
              <Route path="insights" element={<Insights />} />
              <Route path="simulator">
                <Route index element={<SimulatorHub />} />
                <Route path="debt" element={<SimDebt />} />
                <Route path="savings" element={<SimSavings />} />
                <Route path="loan" element={<SimLoan />} />
                <Route path="emergency" element={<SimEmergency />} />
                <Route path="budget" element={<SimBudget />} />
              </Route>
            </Route>
            
            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
