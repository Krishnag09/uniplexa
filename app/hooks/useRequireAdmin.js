import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

/**
 * Redirects non-admins to dashboard once auth has hydrated.
 * @returns {boolean} true when admin may render the screen
 */
export function useRequireAdmin(router) {
  const { isAdmin, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    if (!isAdmin) {
      router.replace('/dashboard');
    }
  }, [isAdmin, isReady, router]);

  return isReady && isAdmin;
}
