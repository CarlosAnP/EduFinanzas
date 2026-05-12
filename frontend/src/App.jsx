import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Hub from './pages/Hub';
import Simulator from './pages/Simulator';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import './index.css';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          
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
  );
}

export default App;
