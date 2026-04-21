import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Terminals are managed within the Branches page (tabbed detail view).
 * This page redirects to /admin/branches.
 */
export default function TerminalsPage() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate('/admin/branches'); }, [navigate]);
  return null;
}
