import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCRM } from '../hooks/useCRM';
import { useToast } from '../context/ToastContext';
import { Modal } from './Modal';
import { Plus, Search, Archive, RotateCcw, FileText, Trash2 } from 'lucide-react';

export const Kanban = memo(function Kanban() {
  const { t } = useTranslation();
  const { deals, accounts, updateDealStatus, addDeal, updateDeal, archiveDeal, restoreDeal, deleteDeal } = useCRM();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [accountId, setAccountId] = useState('');
  const [editDeal, setEditDeal] = useState<{ id: string; title: string; value: string; notes: string } | null>(null);

  const columns = [
    { id: 'prospecção' as const, label: t('kanban.columns.prospeccao'), color: 'bg-blue-500', textColor: 'text-blue-400' },
    { id: 'proposta_sent' as const, label: t('kanban.columns.proposta_sent'), color: 'bg-amber-500', textColor: 'text-amber-400' },
    { id: 'closed_won' as const, label: t('kanban.columns.closed_won'), color: 'bg-emerald-500', textColor: 'text-emerald-400' },
  ];

  const displayDeals = showArchived ? deals : deals.filter(d => !d.archived);
  const filtered = displayDeals.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    (accounts.find(a => a.id === d.accountId)?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{t('kanban.title')}</h1>
          <p className="text-sm text-zinc-500 mt-1">{t('kanban.desc')}</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 group-hover:text-indigo-400 transition-colors" />
            <input type="text" placeholder={t('kanban.search')} value={search} onChange={e => setSearch(e.target.value)}
              className="glass-panel focus:outline-none focus:border-indigo-500 rounded-xl py-2 pl-10 pr-4 text-sm w-44 sm:w-60 text-zinc-200 transition-all focus:ring-2 focus:ring-indigo-500/20" />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
              showArchived ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-zinc-800 text-zinc-400 border border-white/5 hover:bg-zinc-700'
            }`}>
            {showArchived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
            <span>{showArchived ? t('kanban.active') : t('kanban.archived')}</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>{t('kanban.add')}</span>
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        {columns.map(col => {
          const colDeals = filtered.filter(d => d.status === col.id);
          const colValue = colDeals.reduce((s, d) => s + d.value, 0);
          return (
            <div key={col.id} className="glass-card-accent rounded-2xl flex flex-col overflow-hidden card-highlight">
              <div className="p-4 border-b border-white/[0.04] flex justify-between items-center bg-zinc-900/30 backdrop-blur-md">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.color} shadow-sm`} />
                  <span className="font-semibold text-sm uppercase tracking-wider text-zinc-200">{col.label}</span>
                  <span className={`text-xs bg-zinc-900/80 border border-white/[0.04] ${col.textColor} px-2 py-0.5 rounded-md font-bold`}>{colDeals.length}</span>
                </div>
                <span className="text-xs font-semibold text-zinc-500">R$ {colValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="p-3 flex-1 overflow-y-auto space-y-3 bg-zinc-950/10 custom-scrollbar">
                {colDeals.map(deal => (
                  <motion.div key={deal.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setEditDeal({ id: deal.id, title: deal.title, value: deal.value.toString(), notes: deal.notes })}
                    className="bg-zinc-800/60 backdrop-blur-sm border border-white/[0.04] rounded-xl p-4 shadow-lg hover:border-indigo-500/40 hover:shadow-indigo-500/5 hover:bg-zinc-800/80 transition-all group cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-zinc-200 text-sm group-hover:text-indigo-300 transition-colors">{deal.title}</h4>
                      {deal.notes && <FileText className="w-3.5 h-3.5 text-indigo-400/60 shrink-0 ml-2" />}
                    </div>
                    <div className="text-xs text-zinc-500 mb-3 font-medium">
                      {accounts.find(a => a.id === deal.accountId)?.name || t('kanban.unknownCompany')}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-white/[0.04]">
                      <span className="font-bold text-zinc-300 text-sm">R$ {deal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        {deal.archived ? (
                          <button onClick={() => { restoreDeal(deal.id); addToast(t('extra.kanbanAlerts.restored'), 'success'); }}
                            className="text-[10px] bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white px-2 py-1 rounded transition cursor-pointer border border-amber-500/10"><RotateCcw className="w-3 h-3" /></button>
                        ) : (
                          <>
                            {columns.findIndex(c => c.id === col.id) > 0 && (
                              <button onClick={() => { const idx = columns.findIndex(c => c.id === col.id); updateDealStatus(deal.id, columns[idx - 1].id); }}
                                className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded text-zinc-400 hover:text-zinc-200 transition cursor-pointer border border-white/[0.04]">{'<'}</button>
                            )}
                            {columns.findIndex(c => c.id === col.id) < columns.length - 1 && (
                              <button onClick={() => { const idx = columns.findIndex(c => c.id === col.id); updateDealStatus(deal.id, columns[idx + 1].id); }}
                                className="text-[10px] bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white px-2 py-1 rounded transition cursor-pointer border border-indigo-500/10">{'>'}</button>
                            )}
                            {col.id === 'closed_won' && (
                              <button onClick={() => { archiveDeal(deal.id); addToast(t('extra.kanbanAlerts.archived'), 'info'); }}
                                className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded text-zinc-400 hover:text-zinc-200 transition cursor-pointer border border-white/[0.04]"><Archive className="w-3 h-3" /></button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {colDeals.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-xs font-medium text-zinc-600 italic border-2 border-dashed border-white/[0.06] rounded-xl py-12">
                    <Plus className="w-6 h-6 mb-2 opacity-20" />
                    <span>{t('kanban.empty')}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={t('kanban.add')}>
        <form onSubmit={e => { e.preventDefault(); if (title && value && accountId) { addDeal({ title, value: parseFloat(value), accountId, status: 'prospecção', archived: false, notes: '' }); addToast(t('kanban.save') + '!', 'success'); setTitle(''); setValue(''); setAccountId(''); setShowModal(false); } }} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('kanban.dealTitle')}</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Software License" className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('kanban.estimatedValue')}</label>
              <input type="number" required value={value} onChange={e => setValue(e.target.value)} placeholder="Ex: 5000" className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('kanban.company')}</label>
              <select required value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-300">
                <option value="">{t('kanban.select')}</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
          {accounts.length === 0 && <p className="text-[11px] text-amber-400 italic">{t('kanban.noAccount')}</p>}
          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white border border-white/5 bg-zinc-900/50 rounded-xl transition">{t('kanban.cancel')}</button>
            <button type="submit" disabled={accounts.length === 0} className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">{t('kanban.save')}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editDeal} onClose={() => setEditDeal(null)} title={t('kanban.editTitle')}>
        {editDeal && (
          <form onSubmit={e => {
            e.preventDefault();
            const account = deals.find(d => d.id === editDeal.id);
            if (account) {
              updateDeal(editDeal.id, {
                title: editDeal.title,
                value: parseFloat(editDeal.value),
                accountId: account.accountId,
                status: account.status,
                archived: account.archived,
                notes: editDeal.notes,
              });
              addToast(t('kanban.save') + '!', 'success');
              setEditDeal(null);
            }
          }} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('kanban.dealTitle')}</label>
              <input type="text" required value={editDeal.title} onChange={e => setEditDeal({ ...editDeal, title: e.target.value })}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('kanban.value')}</label>
              <input type="number" required value={editDeal.value} onChange={e => setEditDeal({ ...editDeal, value: e.target.value })}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('kanban.notes')}</label>
              <textarea value={editDeal.notes} onChange={e => setEditDeal({ ...editDeal, notes: e.target.value })}
                placeholder={t('kanban.notesPlaceholder')}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100 min-h-[100px] resize-y" />
            </div>
            <div className="pt-4 flex justify-between items-center">
              <button type="button" onClick={() => {
                if (window.confirm(t('kanban.deleteConfirm'))) {
                  deleteDeal(editDeal.id);
                  addToast(t('extra.kanbanAlerts.deleted'), 'info');
                  setEditDeal(null);
                }
              }}
                className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 bg-red-500/5 rounded-xl transition cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('kanban.delete')}</span>
              </button>
              <div className="flex space-x-3">
                <button type="button" onClick={() => setEditDeal(null)}
                  className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white border border-white/5 bg-zinc-900/50 rounded-xl transition cursor-pointer">{t('kanban.cancel')}</button>
                <button type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">{t('kanban.save')}</button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
});