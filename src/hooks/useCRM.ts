import { useContext } from 'react';
import { CRMContext } from '../context/CRMContext';

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) throw new Error('useCRM must be used within CRMProvider');
  return context;
}