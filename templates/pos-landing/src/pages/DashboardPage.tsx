import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/dashboard/DashboardLayout';

const isLocalhost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.endsWith('.local');

export function DashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLocalhost) navigate('/', { replace: true });
  }, [navigate]);

  if (!isLocalhost) return null;
  return <DashboardLayout />;
}
