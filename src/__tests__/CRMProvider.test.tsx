import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { CRMProvider } from '../context/CRMProvider';
import { useCRM } from '../hooks/useCRM';

function wrapper({ children }: { children: ReactNode }) {
  return <CRMProvider>{children}</CRMProvider>;
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('crm_initialized', 'true');
});

describe('CRMProvider', () => {
  it('starts with empty state', () => {
    const { result } = renderHook(() => useCRM(), { wrapper });
    expect(result.current.accounts).toEqual([]);
    expect(result.current.contacts).toEqual([]);
    expect(result.current.deals).toEqual([]);
    expect(result.current.tasks).toEqual([]);
    expect(result.current.invoices).toEqual([]);
    expect(result.current.expenses).toEqual([]);
  });

  it('adds an account', () => {
    const { result } = renderHook(() => useCRM(), { wrapper });
    act(() => {
      result.current.addAccount({
        name: 'Test Corp',
        industry: 'Tech',
        website: '',
        email: 'test@corp.com',
        phone: '11999999999',
        location: 'São Paulo',
      });
    });
    expect(result.current.accounts).toHaveLength(1);
    expect(result.current.accounts[0].name).toBe('Test Corp');
  });

  it('adds and deletes a contact', () => {
    const { result } = renderHook(() => useCRM(), { wrapper });
    act(() => {
      result.current.addAccount({ name: 'A', industry: '', website: '', email: '', phone: '', location: '' });
    });
    const accountId = result.current.accounts[0].id;
    act(() => {
      result.current.addContact({
        accountId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        phone: '',
        role: '',
        isPrimary: false,
        notes: '',
      });
    });
    expect(result.current.contacts).toHaveLength(1);
    act(() => {
      result.current.deleteContact(result.current.contacts[0].id);
    });
    expect(result.current.contacts).toHaveLength(0);
  });

  it('cascade deletes contacts and deals when account is removed', () => {
    const { result } = renderHook(() => useCRM(), { wrapper });
    act(() => {
      result.current.addAccount({ name: 'Acme', industry: '', website: '', email: '', phone: '', location: '' });
    });
    const accountId = result.current.accounts[0].id;
    act(() => {
      result.current.addContact({ accountId, firstName: 'Jane', lastName: 'Doe', email: '', phone: '', role: '', isPrimary: false, notes: '' });
      result.current.addDeal({ accountId, title: 'Big Deal', value: 50000, status: 'prospecção', archived: false, notes: '' });
    });
    expect(result.current.contacts).toHaveLength(1);
    expect(result.current.deals).toHaveLength(1);
    act(() => {
      result.current.deleteAccount(accountId);
    });
    expect(result.current.accounts).toHaveLength(0);
    expect(result.current.contacts).toHaveLength(0);
    expect(result.current.deals).toHaveLength(0);
  });

  it('loads demo data', () => {
    const { result } = renderHook(() => useCRM(), { wrapper });
    act(() => {
      result.current.loadDemoData();
    });
    expect(result.current.accounts.length).toBeGreaterThan(0);
    expect(result.current.contacts.length).toBeGreaterThan(0);
    expect(result.current.deals.length).toBeGreaterThan(0);
    expect(result.current.tasks.length).toBeGreaterThan(0);
    expect(result.current.invoices.length).toBeGreaterThan(0);
    expect(result.current.expenses.length).toBeGreaterThan(0);
  });

  it('clears all data', () => {
    const { result } = renderHook(() => useCRM(), { wrapper });
    act(() => {
      result.current.loadDemoData();
    });
    expect(result.current.accounts.length).toBeGreaterThan(0);
    act(() => {
      result.current.clearData();
    });
    expect(result.current.accounts).toEqual([]);
  });

  it('persists data to localStorage', () => {
    const { result } = renderHook(() => useCRM(), { wrapper });
    act(() => {
      result.current.addAccount({ name: 'Persist Co', industry: '', website: '', email: '', phone: '', location: '' });
    });
    const saved = localStorage.getItem('crm_accounts');
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved!);
    expect(parsed[0].name).toBe('Persist Co');
  });

  it('toggles task completion', () => {
    const { result } = renderHook(() => useCRM(), { wrapper });
    act(() => {
      result.current.addTask({ title: 'Test task', priority: 'Média', dueDate: '', description: '', dealId: '' });
    });
    const taskId = result.current.tasks[0].id;
    expect(result.current.tasks[0].completed).toBe(false);
    act(() => {
      result.current.toggleTask(taskId);
    });
    expect(result.current.tasks[0].completed).toBe(true);
    expect(result.current.tasks[0].completedAt).not.toBeNull();
  });

  it('toggles invoice status', () => {
    const { result } = renderHook(() => useCRM(), { wrapper });
    act(() => {
      result.current.addInvoice({ accountId: '', title: 'INV-001', amount: 1000, date: '', dueDate: '', status: 'Pendente' });
    });
    const invId = result.current.invoices[0].id;
    act(() => {
      result.current.toggleInvoiceStatus(invId);
    });
    expect(result.current.invoices[0].status).toBe('Paga');
    expect(result.current.invoices[0].paidAt).not.toBeNull();
  });

  it('archives and restores deals', () => {
    const { result } = renderHook(() => useCRM(), { wrapper });
    act(() => {
      result.current.addDeal({ title: 'Archivable', value: 100, status: 'prospecção', accountId: '', archived: false, notes: '' });
    });
    const dealId = result.current.deals[0].id;
    expect(result.current.deals[0].archived).toBe(false);
    act(() => {
      result.current.archiveDeal(dealId);
    });
    expect(result.current.deals[0].archived).toBe(true);
    act(() => {
      result.current.restoreDeal(dealId);
    });
    expect(result.current.deals[0].archived).toBe(false);
  });
});
