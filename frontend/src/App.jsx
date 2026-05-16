import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/ui/Toast';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Hub from './pages/Hub';
import Simulator from './pages/Simulator';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import NotFound from './pages/NotFound';
import './index.css';

const queryClient = new QueryClient();

function App() {
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
              <Route path="hub" element={<Hub />} />
              <Route path="simulator" element={<Simulator />} />
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
