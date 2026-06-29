import { useContext } from 'react';
import { RBACCtx } from './RBACConfig';

export function useRBAC() {
  const ctx = useContext(RBACCtx);
  if (!ctx) throw new Error('useRBAC must be used inside RBACProvider');
  return ctx;
}
