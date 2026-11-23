import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCRM } from '../hooks/useCRM';
import { useDebounce } from '../hooks/useDebounce';
import { Search, Building, User, KanbanSquare, CheckSquare, DollarSign, TrendingDown, Briefcase, Activity } from 'lucide-react';
import { readJsonArray } from '../lib/storage';

interface GlobalSearchProps {
  onNavigate: (tab: string) => void;
}

interface SearchEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position?: string;
  department: string;
}

interface SearchIncident {
  id: string;
  description: string;
  reportedBy: string;
  severity: string;
  category: string;
}

export function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  const { t } = useTranslation();
  const { accounts, contacts, deals, tasks, invoices, expenses } = useCRM();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 200);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const q = useMemo(() => debouncedQuery.toLowerCase().trim(), [debouncedQuery]);

  const results: { label: string; icon: React.ElementType; items: { id: string; title: string; subtitle: string; tab: string }[] }[] = [];

  if (q) {
    const matchedAccounts = accounts.filter(a => a.name.toLowerCase().includes(q) || a.industry.toLowerCase().includes(q));
    if (matchedAccounts.length) {
      results.push({
        label: t('customers.title'),
        icon: Building,
        items: matchedAccounts.map(a => ({ id: a.id, title: a.name, subtitle: a.industry, tab: 'database' })),
      });
    }

    const matchedContacts = contacts.filter(c => c.firstName.toLowerCase().includes(q) || c.lastName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
    if (matchedContacts.length) {
      results.push({
        label: t('contacts.title'),
        icon: User,
        items: matchedContacts.map(c => ({ id: c.id, title: `${c.firstName} ${c.lastName}`, subtitle: c.email, tab: 'contacts' })),
      });
    }

    const matchedDeals = deals.filter(d => d.title.toLowerCase().includes(q) || (accounts.find(a => a.id === d.accountId)?.name || '').toLowerCase().includes(q));
    if (matchedDeals.length) {
      results.push({
        label: t('kanban.title'),
        icon: KanbanSquare,
        items: matchedDeals.map(d => ({ id: d.id, title: d.title, subtitle: `R$ ${d.value.toLocaleString('pt-BR')}`, tab: 'kanban' })),
      });
    }

    const matchedTasks = tasks.filter(t => t.title.toLowerCase().includes(q));
    if (matchedTasks.length) {
      results.push({
        label: t('tasks.title'),
        icon: CheckSquare,
        items: matchedTasks.map(t => ({ id: t.id, title: t.title, subtitle: t.completed ? '✓' : '○', tab: 'tasks' })),
      });
    }

    const matchedInvoices = invoices.filter(i => i.title.toLowerCase().includes(q) || (i.accountId && (accounts.find(a => a.id === i.accountId)?.name || '').toLowerCase().includes(q)));
    if (matchedInvoices.length) {
      results.push({
        label: t('financial.invoices'),
        icon: DollarSign,
        items: matchedInvoices.map(i => ({ id: i.id, title: i.title, subtitle: `R$ ${i.amount.toLocaleString('pt-BR')}`, tab: 'financial' })),
      });
    }

    const matchedExpenses = expenses.filter(e => e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q));
    if (matchedExpenses.length) {
      results.push({
        label: t('financial.expensesList'),
        icon: TrendingDown,
        items: matchedExpenses.map(e => ({ id: e.id, title: e.title, subtitle: `R$ ${e.amount.toLocaleString('pt-BR')}`, tab: 'financial' })),
      });
    }

    // Match Employees
    const employeesList: SearchEmployee[] = readJsonArray<SearchEmployee>('zenith_employees', []);
    const matchedEmployees = employeesList.filter((emp: SearchEmployee) =>
      emp.firstName.toLowerCase().includes(q) ||
      emp.lastName.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.id.toLowerCase().includes(q)
    );
    if (matchedEmployees.length) {
      results.push({
        label: t('nav.employees'),
        icon: Briefcase,
        items: matchedEmployees.map((emp: SearchEmployee) => ({
          id: emp.id,
          title: `${emp.firstName} ${emp.lastName}`,
          subtitle: `${emp.position || 'Colaborador'} | ${emp.department}`,
          tab: 'employees',
        })),
      });
    }

    // Match Incidents
    const incidentsList: SearchIncident[] = readJsonArray<SearchIncident>('zenith_incidents', []);
    const matchedIncidents = incidentsList.filter((inc: SearchIncident) =>
      inc.description.toLowerCase().includes(q) ||
      inc.reportedBy.toLowerCase().includes(q) ||
      inc.id.toLowerCase().includes(q)
    );
    if (matchedIncidents.length) {
      results.push({
        label: t('nav.incidents'),
        icon: Activity,
        items: matchedIncidents.map((inc: SearchIncident) => ({
          id: inc.id,
          title: `${inc.id}: ${inc.description}`,
          subtitle: `Severity: ${inc.severity} | Category: ${inc.category}`,
          tab: 'incidents',
        })),
      });
    }
  }

  const totalResults = results.reduce((s, r) => s + r.items.length, 0);

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md mx-4">
      <div className="relative group">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 group-hover:text-indigo-400 transition-colors pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={`${t('customers.search')}... (Ctrl+K)`}
          className="w-full glass-panel focus:outline-none focus:border-indigo-500 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-200 transition-all focus:ring-2 focus:ring-indigo-500/20 placeholder:text-zinc-600"
        />
      </div>

      <AnimatePresence>
        {open && query && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute top-full mt-2 left-0 right-0 glass-panel rounded-2xl p-3 shadow-2xl z-50 border border-white/[0.06] max-h-80 overflow-y-auto custom-scrollbar"
            >
              {totalResults === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4">No results for "{query}"</p>
              ) : (
                results.map((group, gi) => (
                  <div key={gi} className={gi > 0 ? 'mt-2 pt-2 border-t border-white/[0.04]' : ''}>
                    <div className="flex items-center gap-1.5 px-2 py-1">
                      <group.icon className="w-3 h-3 text-zinc-500" />
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{group.label}</span>
                    </div>
                    {group.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => { setOpen(false); setQuery(''); onNavigate(item.tab); }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-800/60 transition-all text-left cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/[0.04] flex items-center justify-center shrink-0">
                          <group.icon className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-zinc-200 truncate">{item.title}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{item.subtitle}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
