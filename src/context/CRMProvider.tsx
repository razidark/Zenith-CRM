import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Account, Contact, Deal, Task, Invoice, Expense, Meeting } from '../types';
import { CRMContext } from './CRMContext';
// Shared with the rest of the app so every localStorage read is guarded
// the same way -- see src/lib/storage.ts.
import { readJson } from '../lib/storage';

const STORAGE_VERSION = 1;
const VERSION_KEY = 'crm_version';

/**
 * The localStorage key prefixes this app owns. "Clear data" removes only
 * these, so nothing else on the origin is affected.
 */
const CRM_STORAGE_PREFIXES = ['crm_', 'zenith_'];
const now = () => new Date().toISOString();

const loadFromStorage = readJson;

function migrateData() {
  const version = loadFromStorage<number>(VERSION_KEY, 0);
  if (version < STORAGE_VERSION) {
    if (version === 0) {
      const accounts = loadFromStorage<Account[]>('crm_accounts', []);
      const migrated = accounts.map(a => ({
        ...a,
        updatedAt: a.updatedAt || a.createdAt || now(),
      }));
      localStorage.setItem('crm_accounts', JSON.stringify(migrated));
    }
    localStorage.setItem(VERSION_KEY, JSON.stringify(STORAGE_VERSION));
  }
}

function initializeData() {
  const initialized = localStorage.getItem('crm_initialized') === 'true';
  if (!initialized) {
    const ts = new Date().toISOString();
    const accounts = [
      { id: '1', name: 'Acme Corp', industry: 'Tecnologia', website: 'acme.com', email: 'contato@acme.com', phone: '+55 (11) 98888-0001', location: 'São Paulo, SP', size: 'Médio', revenue: 'R$ 1.500.000', status: 'Cliente Ativo', description: 'Empresa líder em soluções de tecnologia em nuvem e infraestrutura para grandes corporações do varejo brasileiro.', createdAt: '2025-01-15T10:00:00Z', updatedAt: ts },
      { id: '2', name: 'Globex Inc', industry: 'Manufatura', website: 'globex.com', email: 'contato@globex.com', phone: '+55 (21) 97777-0002', location: 'Rio de Janeiro, RJ', size: 'Grande', revenue: 'R$ 10.000.000', status: 'Prospect', description: 'Conglomerado industrial multinacional focado em automação pesada e robótica de alta precisão para linhas de montagem automotivas.', createdAt: '2025-02-20T10:00:00Z', updatedAt: ts },
      { id: '3', name: 'Nexos Digital', industry: 'Marketing', website: 'nexos.agency', email: 'hello@nexos.agency', phone: '+55 (31) 96666-0003', location: 'Belo Horizonte, MG', size: 'Pequeno', revenue: 'R$ 500.000', status: 'Lead', description: 'Agência de marketing focada em aquisição de clientes por canais digitais e campanhas de branding automatizadas.', createdAt: '2025-03-05T10:00:00Z', updatedAt: ts },
    ];
    const meetings = [
      { id: 'm1', accountId: '1', title: 'Alinhamento Técnico Inicial', date: '2026-05-10', summary: 'Reunião para entender as dores da infraestrutura da Acme. Alinhado que eles precisam de 50 novas licenças e migração de banco de dados para PostgreSQL.', attendees: 'João Silva, Razid', createdAt: ts, updatedAt: ts },
      { id: 'm2', accountId: '1', title: 'Demonstração do Painel SaaS', date: '2026-05-18', summary: 'Apresentação detalhada da plataforma Zenith CRM para a diretoria. Feedback extremamente positivo sobre a velocidade de resposta offline do app.', attendees: 'João Silva, Maria Santos, Razid', createdAt: ts, updatedAt: ts },
      { id: 'm3', accountId: '2', title: 'Apresentação Comercial de Automação', date: '2026-06-02', summary: 'Apresentação de proposta comercial para o Pedro. Eles pediram 5% de desconto no setup básico de robótica integrada.', attendees: 'Pedro Oliveira, Razid', createdAt: ts, updatedAt: ts },
    ];
    const contacts = [
      { id: 'c1', accountId: '1', firstName: 'João', lastName: 'Silva', email: 'joao@acme.com', phone: '+55 (11) 98888-1001', role: 'CTO', isPrimary: true, notes: '', createdAt: ts, updatedAt: ts },
      { id: 'c2', accountId: '1', firstName: 'Maria', lastName: 'Santos', email: 'maria@acme.com', phone: '+55 (11) 98888-1002', role: 'Financeiro', isPrimary: false, notes: '', createdAt: ts, updatedAt: ts },
      { id: 'c3', accountId: '2', firstName: 'Pedro', lastName: 'Oliveira', email: 'pedro@globex.com', phone: '+55 (21) 97777-2001', role: 'Diretor de Operações', isPrimary: true, notes: '', createdAt: ts, updatedAt: ts },
    ];
    const deals = [
      { id: 'd1', accountId: '1', title: 'Licenças SaaS - 50 seats', value: 15000, status: 'prospecção', archived: false, notes: 'Cliente interessado em pacote corporativo. Próxima reunião agendada para 15/06.', createdAt: '2025-04-01T10:00:00Z', updatedAt: ts },
      { id: 'd2', accountId: '2', title: 'Consultoria de Processos', value: 32000, status: 'proposta_sent', archived: false, notes: 'Proposta enviada em 10/05. Aguardando retorno do Pedro.', createdAt: '2025-04-10T10:00:00Z', updatedAt: ts },
      { id: 'd3', accountId: '1', title: 'Suporte Premium Anual', value: 8500, status: 'closed_won', archived: false, notes: 'Contrato assinado. Faturamento recorrente mensal.', createdAt: '2025-03-15T10:00:00Z', updatedAt: ts },
    ];
    const tasks = [
      { id: 't1', accountId: '1', dealId: 'd1', title: 'Ligar para alinhar prazos', description: 'Discutir cronograma de implantação', dueDate: '2026-06-01', priority: 'Alta', completed: false, createdAt: ts, updatedAt: ts },
      { id: 't2', title: 'Enviar proposta revisada', description: 'Incluir descontos por volume', dueDate: '2026-05-28', priority: 'Alta', completed: false, createdAt: ts, updatedAt: ts },
      { id: 't3', title: 'Revisar metas do trimestre', description: '', dueDate: '2026-05-30', priority: 'Baixa', completed: true, completedAt: ts, createdAt: ts, updatedAt: ts },
    ];
    const invoices = [
      { id: 'i1', accountId: '1', title: 'Fatura Acme - 1a Parcela', amount: 5000, date: '2026-05-10', dueDate: '2026-06-10', status: 'Paga', paidAt: '2026-05-12T10:00:00Z', createdAt: ts, updatedAt: ts },
      { id: 'i2', accountId: '2', title: 'Fatura Globex - Setup', amount: 8000, date: '2026-06-01', dueDate: '2026-07-01', status: 'Pendente', createdAt: ts, updatedAt: ts },
    ];
    const expenses = [
      { id: 'e1', accountId: '1', title: 'Servidores AWS', amount: 1200, date: '2026-05-15', category: 'Tecnologia', notes: '', createdAt: ts, updatedAt: ts },
      { id: 'e2', title: 'Licenças Zoom', amount: 350, date: '2026-05-18', category: 'Ferramentas', notes: 'Renovação anual', createdAt: ts, updatedAt: ts },
    ];
    localStorage.setItem('crm_accounts', JSON.stringify(accounts));
    localStorage.setItem('crm_meetings', JSON.stringify(meetings));
    localStorage.setItem('crm_contacts', JSON.stringify(contacts));
    localStorage.setItem('crm_deals', JSON.stringify(deals));
    localStorage.setItem('crm_tasks', JSON.stringify(tasks));
    localStorage.setItem('crm_invoices', JSON.stringify(invoices));
    localStorage.setItem('crm_expenses', JSON.stringify(expenses));
    localStorage.setItem('crm_initialized', 'true');
  }
}

export function CRMProvider({ children }: { children: ReactNode }) {
  initializeData();
  migrateData();

  const [accounts, setAccounts] = useState<Account[]>(() => loadFromStorage<Account[]>('crm_accounts', []));
  const [contacts, setContacts] = useState<Contact[]>(() => loadFromStorage<Contact[]>('crm_contacts', []));
  const [deals, setDeals] = useState<Deal[]>(() => loadFromStorage<Deal[]>('crm_deals', []));
  const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage<Task[]>('crm_tasks', []));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadFromStorage<Invoice[]>('crm_invoices', []));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadFromStorage<Expense[]>('crm_expenses', []));
  const [meetings, setMeetings] = useState<Meeting[]>(() => loadFromStorage<Meeting[]>('crm_meetings', []));

  useEffect(() => { localStorage.setItem('crm_accounts', JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem('crm_contacts', JSON.stringify(contacts)); }, [contacts]);
  useEffect(() => { localStorage.setItem('crm_deals', JSON.stringify(deals)); }, [deals]);
  useEffect(() => { localStorage.setItem('crm_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('crm_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('crm_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('crm_meetings', JSON.stringify(meetings)); }, [meetings]);

  const addAccount = useCallback((data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    const ts = now();
    const account: Account = { ...data, id: crypto.randomUUID(), createdAt: ts, updatedAt: ts };
    setAccounts(prev => [...prev, account]);
  }, []);

  const updateAccount = useCallback((id: string, data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...data, updatedAt: now() } : a));
  }, []);

  const deleteAccount = useCallback((id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    setContacts(prev => prev.filter(c => c.accountId !== id));
    setDeals(prev => prev.filter(d => d.accountId !== id));
    setTasks(prev => prev.filter(t => t.accountId !== id));
    setMeetings(prev => prev.filter(m => m.accountId !== id));
  }, []);

  const addMeeting = useCallback((data: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => {
    const ts = now();
    const meeting: Meeting = { ...data, id: crypto.randomUUID(), createdAt: ts, updatedAt: ts };
    setMeetings(prev => [...prev, meeting]);
  }, []);

  const deleteMeeting = useCallback((id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
  }, []);

  const addContact = useCallback((data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    const ts = now();
    const contact: Contact = { ...data, id: crypto.randomUUID(), createdAt: ts, updatedAt: ts };
    setContacts(prev => [...prev, contact]);
  }, []);

  const updateContact = useCallback((id: string, data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...data, updatedAt: now() } : c));
  }, []);

  const deleteContact = useCallback((id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  }, []);

  const addDeal = useCallback((data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const ts = now();
    const deal: Deal = { ...data, id: crypto.randomUUID(), archived: false, createdAt: ts, updatedAt: ts };
    setDeals(prev => [...prev, deal]);
  }, []);

  const updateDeal = useCallback((id: string, data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, ...data, updatedAt: now() } : d));
  }, []);

  const updateDealStatus = useCallback((id: string, status: Deal['status']) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, status, updatedAt: now() } : d));
  }, []);

  const archiveDeal = useCallback((id: string) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, archived: true, updatedAt: now() } : d));
  }, []);

  const restoreDeal = useCallback((id: string) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, archived: false, updatedAt: now() } : d));
  }, []);

  const deleteDeal = useCallback((id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
  }, []);

  const addTask = useCallback((data: Omit<Task, 'id' | 'completed' | 'completedAt' | 'createdAt' | 'updatedAt'>) => {
    const ts = now();
    const task: Task = { ...data, id: crypto.randomUUID(), description: data.description || '', completed: false, createdAt: ts, updatedAt: ts };
    setTasks(prev => [...prev, task]);
  }, []);

  const updateTask = useCallback((id: string, data: Omit<Task, 'id' | 'completed' | 'completedAt' | 'createdAt' | 'updatedAt'>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data, updatedAt: now() } : t));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const completed = !t.completed;
      return { ...t, completed, completedAt: completed ? now() : undefined, updatedAt: now() };
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const addInvoice = useCallback((data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    const ts = now();
    const invoice: Invoice = { ...data, id: crypto.randomUUID(), createdAt: ts, updatedAt: ts };
    setInvoices(prev => [...prev, invoice]);
  }, []);

  const updateInvoice = useCallback((id: string, data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...data, updatedAt: now() } : i));
  }, []);

  const toggleInvoiceStatus = useCallback((id: string) => {
    setInvoices(prev => prev.map(i => {
      if (i.id !== id) return i;
      const newStatus: 'Pendente' | 'Paga' = i.status === 'Paga' ? 'Pendente' : 'Paga';
      return { ...i, status: newStatus, paidAt: newStatus === 'Paga' ? now() : undefined, updatedAt: now() };
    }));
  }, []);

  const deleteInvoice = useCallback((id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
  }, []);

  const addExpense = useCallback((data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const ts = now();
    const expense: Expense = { ...data, id: crypto.randomUUID(), category: data.category || '', notes: data.notes || '', createdAt: ts, updatedAt: ts };
    setExpenses(prev => [...prev, expense]);
  }, []);

  const updateExpense = useCallback((id: string, data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...data, updatedAt: now() } : e));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const loadDemoData = useCallback(() => {
    const ts = now();
    setAccounts([
      { id: '1', name: 'Acme Corp', industry: 'Tecnologia', website: 'acme.com', email: 'contato@acme.com', phone: '+55 (11) 98888-0001', location: 'São Paulo, SP', size: 'Médio', revenue: 'R$ 1.500.000', status: 'Cliente Ativo', description: 'Empresa líder em soluções de tecnologia em nuvem e infraestrutura para grandes corporações do varejo brasileiro.', createdAt: '2025-01-15T10:00:00Z', updatedAt: ts },
      { id: '2', name: 'Globex Inc', industry: 'Manufatura', website: 'globex.com', email: 'contato@globex.com', phone: '+55 (21) 97777-0002', location: 'Rio de Janeiro, RJ', size: 'Grande', revenue: 'R$ 10.000.000', status: 'Prospect', description: 'Conglomerado industrial multinacional focado em automação pesada e robótica de alta precisão para linhas de montagem automotivas.', createdAt: '2025-02-20T10:00:00Z', updatedAt: ts },
      { id: '3', name: 'Nexos Digital', industry: 'Marketing', website: 'nexos.agency', email: 'hello@nexos.agency', phone: '+55 (31) 96666-0003', location: 'Belo Horizonte, MG', size: 'Pequeno', revenue: 'R$ 500.000', status: 'Lead', description: 'Agência de marketing focada em aquisição de clientes por canais digitais e campanhas de branding automatizadas.', createdAt: '2025-03-05T10:00:00Z', updatedAt: ts },
    ]);
    setMeetings([
      { id: 'm1', accountId: '1', title: 'Alinhamento Técnico Inicial', date: '2026-05-10', summary: 'Reunião para entender as dores da infraestrutura da Acme. Alinhado que eles precisam de 50 novas licenças e migração de banco de dados para PostgreSQL.', attendees: 'João Silva, Razid', createdAt: ts, updatedAt: ts },
      { id: 'm2', accountId: '1', title: 'Demonstração do Painel SaaS', date: '2026-05-18', summary: 'Apresentação detalhada da plataforma Zenith CRM para a diretoria. Feedback extremamente positivo sobre a velocidade de resposta offline do app.', attendees: 'João Silva, Maria Santos, Razid', createdAt: ts, updatedAt: ts },
      { id: 'm3', accountId: '2', title: 'Apresentação Comercial de Automação', date: '2026-06-02', summary: 'Apresentação de proposta comercial para o Pedro. Eles pediram 5% de desconto no setup básico de robótica integrada.', attendees: 'Pedro Oliveira, Razid', createdAt: ts, updatedAt: ts },
    ]);
    setContacts([
      { id: 'c1', accountId: '1', firstName: 'João', lastName: 'Silva', email: 'joao@acme.com', phone: '+55 (11) 98888-1001', role: 'CTO', isPrimary: true, notes: '', createdAt: ts, updatedAt: ts },
      { id: 'c2', accountId: '1', firstName: 'Maria', lastName: 'Santos', email: 'maria@acme.com', phone: '+55 (11) 98888-1002', role: 'Financeiro', isPrimary: false, notes: '', createdAt: ts, updatedAt: ts },
      { id: 'c3', accountId: '2', firstName: 'Pedro', lastName: 'Oliveira', email: 'pedro@globex.com', phone: '+55 (21) 97777-2001', role: 'Diretor de Operações', isPrimary: true, notes: '', createdAt: ts, updatedAt: ts },
    ]);
    setDeals([
      { id: 'd1', accountId: '1', title: 'Licenças SaaS - 50 seats', value: 15000, status: 'prospecção', archived: false, notes: 'Cliente interessado em pacote corporativo. Próxima reunião agendada para 15/06.', createdAt: '2025-04-01T10:00:00Z', updatedAt: ts },
      { id: 'd2', accountId: '2', title: 'Consultoria de Processos', value: 32000, status: 'proposta_sent', archived: false, notes: 'Proposta enviada em 10/05. Aguardando retorno do Pedro.', createdAt: '2025-04-10T10:00:00Z', updatedAt: ts },
      { id: 'd3', accountId: '1', title: 'Suporte Premium Anual', value: 8500, status: 'closed_won', archived: false, notes: 'Contrato assinado. Faturamento recorrente mensal.', createdAt: '2025-03-15T10:00:00Z', updatedAt: ts },
    ]);
    setTasks([
      { id: 't1', accountId: '1', dealId: 'd1', title: 'Ligar para alinhar prazos', description: 'Discutir cronograma de implantação', dueDate: '2026-06-01', priority: 'Alta', completed: false, createdAt: ts, updatedAt: ts },
      { id: 't2', title: 'Enviar proposta revisada', description: 'Incluir descontos por volume', dueDate: '2026-05-28', priority: 'Alta', completed: false, createdAt: ts, updatedAt: ts },
      { id: 't3', title: 'Revisar metas do trimestre', description: '', dueDate: '2026-05-30', priority: 'Baixa', completed: true, completedAt: ts, createdAt: ts, updatedAt: ts },
    ]);
    setInvoices([
      { id: 'i1', accountId: '1', title: 'Fatura Acme - 1a Parcela', amount: 5000, date: '2026-05-10', dueDate: '2026-06-10', status: 'Paga', paidAt: '2026-05-12T10:00:00Z', createdAt: ts, updatedAt: ts },
      { id: 'i2', accountId: '2', title: 'Fatura Globex - Setup', amount: 8000, date: '2026-06-01', dueDate: '2026-07-01', status: 'Pendente', createdAt: ts, updatedAt: ts },
    ]);
    setExpenses([
      { id: 'e1', accountId: '1', title: 'Servidores AWS', amount: 1200, date: '2026-05-15', category: 'Tecnologia', notes: '', createdAt: ts, updatedAt: ts },
      { id: 'e2', title: 'Licenças Zoom', amount: 350, date: '2026-05-18', category: 'Ferramentas', notes: 'Renovação anual', createdAt: ts, updatedAt: ts },
    ]);
  }, []);

  const clearData = useCallback(() => {
    setAccounts([]);
    setContacts([]);
    setDeals([]);
    setTasks([]);
    setInvoices([]);
    setExpenses([]);
    setMeetings([]);
    const lang = localStorage.getItem('i18nextLng');

    // `localStorage.clear()` wipes EVERYTHING for the origin, including
    // keys this app does not own -- and anything another app on the same
    // domain stored there. Only the keys this app manages are removed.
    for (const key of Object.keys(localStorage)) {
      if (CRM_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        localStorage.removeItem(key);
      }
    }

    if (lang) localStorage.setItem('i18nextLng', lang);
    localStorage.setItem(VERSION_KEY, JSON.stringify(STORAGE_VERSION));
    localStorage.setItem('crm_initialized', 'true');
  }, []);

  return (
    <CRMContext.Provider value={{
      accounts, contacts, deals, tasks, invoices, expenses, meetings,
      addAccount, updateAccount, deleteAccount,
      addContact, updateContact, deleteContact,
      addDeal, updateDeal, updateDealStatus, archiveDeal, restoreDeal, deleteDeal,
      addTask, updateTask, toggleTask, deleteTask,
      addInvoice, updateInvoice, toggleInvoiceStatus, deleteInvoice,
      addExpense, updateExpense, deleteExpense,
      addMeeting, deleteMeeting,
      loadDemoData, clearData,
    }}>
      {children}
    </CRMContext.Provider>
  );
}
