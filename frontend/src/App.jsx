import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Hub from './pages/Hub';
import Simulator from './pages/Simulator';
import './index.css';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/hub" element={<Hub />} />
            <Route path="/simulator" element={<Simulator />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
