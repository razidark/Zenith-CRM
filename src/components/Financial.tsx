import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCRM } from '../hooks/useCRM';
import { useToast } from '../context/ToastContext';
import { Modal } from './Modal';
import { Plus, DollarSign, TrendingUp, TrendingDown, Pencil, ToggleLeft } from 'lucide-react';

const expenseCategories = ['Tecnologia', 'Ferramentas', 'Viagem', 'Escritório', 'Marketing', 'Outro'];

export const Financial = memo(function Financial() {
  const { t } = useTranslation();
  const { accounts, invoices, expenses, addInvoice, updateInvoice, toggleInvoiceStatus, deleteInvoice, addExpense, updateExpense, deleteExpense } = useCRM();
  const { addToast } = useToast();

  const translateCategory = (cat: string) => {
    switch (cat) {
      case 'Tecnologia': return t('extra.financialExtra.techCategory');
      case 'Ferramentas': return t('extra.financialExtra.toolsCategory');
      case 'Viagem': return t('extra.financialExtra.travelCategory');
      case 'Escritório': return t('extra.financialExtra.officeCategory');
      case 'Marketing': return t('extra.financialExtra.marketingCategory');
      case 'Outro': return t('extra.financialExtra.otherCategory');
      default: return cat;
    }
  };
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [invoiceEditId, setInvoiceEditId] = useState<string | null>(null);
  const [expenseEditId, setExpenseEditId] = useState<string | null>(null);
  const [invTitle, setInvTitle] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const [invDate, setInvDate] = useState('');
  const [invDueDate, setInvDueDate] = useState('');
  const [invAccountId, setInvAccountId] = useState('');
  const [invStatus, setInvStatus] = useState<'Pendente' | 'Paga'>('Pendente');
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState('');
  const [expCategory, setExpCategory] = useState('');
  const [expNotes, setExpNotes] = useState('');
  const [expAccountId, setExpAccountId] = useState('');

  const totalRevenue = invoices.filter(i => i.status === 'Paga').reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const balance = totalRevenue - totalExpenses;

  const resetInvoiceForm = () => {
    setInvTitle(''); setInvAmount(''); setInvDate(''); setInvDueDate(''); setInvAccountId(''); setInvStatus('Pendente'); setInvoiceEditId(null);
  };

  const resetExpenseForm = () => {
    setExpTitle(''); setExpAmount(''); setExpDate(''); setExpCategory(''); setExpNotes(''); setExpAccountId(''); setExpenseEditId(null);
  };

  const openEditInvoice = (inv: typeof invoices[0]) => {
    setInvTitle(inv.title);
    setInvAmount(inv.amount.toString());
    setInvDate(inv.date);
    setInvDueDate(inv.dueDate);
    setInvAccountId(inv.accountId || '');
    setInvStatus(inv.status);
    setInvoiceEditId(inv.id);
    setShowInvoiceModal(true);
  };

  const openEditExpense = (exp: typeof expenses[0]) => {
    setExpTitle(exp.title);
    setExpAmount(exp.amount.toString());
    setExpDate(exp.date);
    setExpCategory(exp.category || '');
    setExpNotes(exp.notes || '');
    setExpAccountId(exp.accountId || '');
    setExpenseEditId(exp.id);
    setShowExpenseModal(true);
  };

  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invTitle || !invAmount || !invDate || !invDueDate) return;
    const data = { title: invTitle, amount: parseFloat(invAmount), date: invDate, dueDate: invDueDate, accountId: invAccountId || undefined, status: invStatus as 'Pendente' | 'Paga' };
    if (invoiceEditId) {
      updateInvoice(invoiceEditId, data);
      addToast(t('financial.saveInvoice') + '!', 'success');
    } else {
      addInvoice(data);
      addToast(t('financial.newInvoice') + '!', 'success');
    }
    resetInvoiceForm();
    setShowInvoiceModal(false);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle || !expAmount || !expDate) return;
    const data = { title: expTitle, amount: parseFloat(expAmount), date: expDate, category: expCategory, notes: expNotes, accountId: expAccountId || undefined };
    if (expenseEditId) {
      updateExpense(expenseEditId, data);
      addToast(t('financial.saveExpense') + '!', 'success');
    } else {
      addExpense(data);
      addToast(t('financial.newExpense') + '!', 'success');
    }
    resetExpenseForm();
    setShowExpenseModal(false);
  };

  const handleDeleteInvoice = (id: string) => {
    if (!window.confirm(t('settings.clearConfirm'))) return;
    deleteInvoice(id);
    addToast(t('financial.noInvoices'), 'info');
  };

  const handleDeleteExpense = (id: string) => {
    if (!window.confirm(t('settings.clearConfirm'))) return;
    deleteExpense(id);
    addToast(t('financial.noExpenses'), 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{t('financial.title')}</h1>
          <p className="text-sm text-zinc-500 mt-1">{t('financial.desc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }} className="glass-card-accent rounded-2xl p-5 card-highlight">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400"><TrendingUp className="w-5 h-5" /></div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t('financial.revenue')}</span>
              <p className="text-xl font-bold text-white mt-0.5">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }} className="glass-card-accent rounded-2xl p-5 card-highlight">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400"><TrendingDown className="w-5 h-5" /></div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t('financial.expenses')}</span>
              <p className="text-xl font-bold text-white mt-0.5">R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }} className="glass-card-accent rounded-2xl p-5 card-highlight">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl ${balance >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}><DollarSign className="w-5 h-5" /></div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t('financial.balance')}</span>
              <p className="text-xl font-bold text-white mt-0.5">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card-accent rounded-2xl p-5 card-highlight">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-zinc-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {t('financial.invoices')}
            </h3>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => { resetInvoiceForm(); setShowInvoiceModal(true); }}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> <span>{t('financial.add')}</span>
            </motion.button>
          </div>
          <div className="space-y-1.5">
            {invoices.map((inv, i) => (
              <motion.div key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-white/[0.04] hover:border-white/[0.08] transition-all">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-200 truncate">{inv.title}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-2">
                    <span>{inv.date}</span>
                    {inv.accountId && <><span>·</span><span className="text-indigo-400/70">{accounts.find(a => a.id === inv.accountId)?.name || '—'}</span></>}
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inv.status === 'Paga' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                    {inv.status === 'Paga' ? t('financial.paid') : t('financial.pending')}
                  </span>
                  <span className="text-sm font-bold text-zinc-200">R$ {inv.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <button onClick={() => toggleInvoiceStatus(inv.id)} className="text-xs text-zinc-600 hover:text-indigo-400 transition cursor-pointer p-1 hover:bg-indigo-500/10 rounded-lg" title="Toggle status"><ToggleLeft className="w-3.5 h-3.5" /></button>
                  <button onClick={() => openEditInvoice(inv)} className="text-xs text-zinc-600 hover:text-indigo-400 transition cursor-pointer p-1 hover:bg-indigo-500/10 rounded-lg"><Pencil className="w-3 h-3" /></button>
                  <button onClick={() => handleDeleteInvoice(inv.id)} className="text-xs text-zinc-600 hover:text-red-400 transition cursor-pointer p-1 hover:bg-red-500/10 rounded-lg">✕</button>
                </div>
              </motion.div>
            ))}
            {invoices.length === 0 && (
              <div className="text-center py-8 text-xs text-zinc-500">
                <DollarSign className="w-5 h-5 mx-auto mb-2 opacity-20" /> {t('financial.noInvoices')}
              </div>
            )}
          </div>
        </div>

        <div className="glass-card-accent rounded-2xl p-5 card-highlight">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-zinc-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> {t('financial.expensesList')}
            </h3>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => { resetExpenseForm(); setShowExpenseModal(true); }}
              className="flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-lg transition-all cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> <span>{t('financial.add')}</span>
            </motion.button>
          </div>
          <div className="space-y-1.5">
            {expenses.map((exp, i) => (
              <motion.div key={exp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-white/[0.04] hover:border-white/[0.08] transition-all">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-200 truncate">{exp.title}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-2">
                    <span>{exp.date}</span>
                    {exp.category && <><span>·</span><span className="text-rose-400/70">{translateCategory(exp.category)}</span></>}
                    {exp.accountId && <><span>·</span><span className="text-indigo-400/70">{accounts.find(a => a.id === exp.accountId)?.name || '—'}</span></>}
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-sm font-bold text-rose-400">- R$ {exp.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <button onClick={() => openEditExpense(exp)} className="text-xs text-zinc-600 hover:text-indigo-400 transition cursor-pointer p-1 hover:bg-indigo-500/10 rounded-lg"><Pencil className="w-3 h-3" /></button>
                  <button onClick={() => handleDeleteExpense(exp.id)} className="text-xs text-zinc-600 hover:text-red-400 transition cursor-pointer p-1 hover:bg-red-500/10 rounded-lg">✕</button>
                </div>
              </motion.div>
            ))}
            {expenses.length === 0 && (
              <div className="text-center py-8 text-xs text-zinc-500">
                <TrendingDown className="w-5 h-5 mx-auto mb-2 opacity-20" /> {t('financial.noExpenses')}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={showInvoiceModal} onClose={() => { resetInvoiceForm(); setShowInvoiceModal(false); }} title={invoiceEditId ? t('financial.editInvoice') : t('financial.newInvoice')}>
        <form onSubmit={handleInvoiceSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('financial.description')}</label>
            <input type="text" required value={invTitle} onChange={e => setInvTitle(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('financial.amount')}</label>
              <input type="number" required value={invAmount} onChange={e => setInvAmount(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('financial.status')}</label>
              <select value={invStatus} onChange={e => setInvStatus(e.target.value as 'Pendente' | 'Paga')} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-300">
                <option value="Pendente">{t('financial.pending')}</option>
                <option value="Paga">{t('financial.paid')}</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('financial.date')}</label>
              <input type="date" required value={invDate} onChange={e => setInvDate(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('tasks.dueDate')}</label>
              <input type="date" required value={invDueDate} onChange={e => setInvDueDate(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('contacts.account')}</label>
            <select value={invAccountId} onChange={e => setInvAccountId(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-300">
              <option value="">—</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => { resetInvoiceForm(); setShowInvoiceModal(false); }} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white border border-white/5 bg-zinc-900/50 rounded-xl transition hover:bg-zinc-800 cursor-pointer">{t('financial.cancel')}</button>
            <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">{invoiceEditId ? t('financial.save') : t('financial.saveInvoice')}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showExpenseModal} onClose={() => { resetExpenseForm(); setShowExpenseModal(false); }} title={expenseEditId ? t('financial.editExpense') : t('financial.newExpense')}>
        <form onSubmit={handleExpenseSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('financial.description')}</label>
            <input type="text" required value={expTitle} onChange={e => setExpTitle(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('financial.amount')}</label>
              <input type="number" required value={expAmount} onChange={e => setExpAmount(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('extra.financialExtra.categoryLabel')}</label>
              <select value={expCategory} onChange={e => setExpCategory(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-300">
                <option value="">—</option>
                {expenseCategories.map(cat => <option key={cat} value={cat}>{translateCategory(cat)}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('financial.date')}</label>
              <input type="date" required value={expDate} onChange={e => setExpDate(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('contacts.account')}</label>
              <select value={expAccountId} onChange={e => setExpAccountId(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-300">
                <option value="">—</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('contacts.notes')}</label>
            <input type="text" value={expNotes} onChange={e => setExpNotes(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => { resetExpenseForm(); setShowExpenseModal(false); }} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white border border-white/5 bg-zinc-900/50 rounded-xl transition hover:bg-zinc-800 cursor-pointer">{t('financial.cancel')}</button>
            <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 rounded-xl shadow-lg shadow-rose-500/20 transition-all cursor-pointer">{expenseEditId ? t('financial.save') : t('financial.saveExpense')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
});
