import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCRM } from '../hooks/useCRM';
import { useToast } from '../context/ToastContext';
import { Modal } from './Modal';
import { Search, Plus, Users, Mail, Phone, Building, Trash2, Pencil, Star, User } from 'lucide-react';

export const ContactsView = memo(function ContactsView() {
  const { t } = useTranslation();
  const { contacts, accounts, addContact, updateContact, deleteContact } = useCRM();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [accountId, setAccountId] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [notes, setNotes] = useState('');

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    return c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (accounts.find(a => a.id === c.accountId)?.name || '').toLowerCase().includes(q);
  });

  const current = contacts.find(c => c.id === selected) || filtered[0] || null;

  const resetForm = () => {
    setFirstName(''); setLastName(''); setEmail(''); setPhone('');
    setRole(''); setAccountId(''); setIsPrimary(false); setNotes('');
    setEditId(null);
  };

  const openEdit = (id: string) => {
    const c = contacts.find(ct => ct.id === id);
    if (!c) return;
    setEditId(c.id);
    setFirstName(c.firstName);
    setLastName(c.lastName);
    setEmail(c.email);
    setPhone(c.phone);
    setRole(c.role);
    setAccountId(c.accountId);
    setIsPrimary(c.isPrimary);
    setNotes(c.notes);
    setShowEditModal(true);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !accountId) return;
    addContact({ firstName, lastName, email, phone, role, accountId, isPrimary, notes });
    addToast(t('contacts.save') + '!', 'success');
    resetForm();
    setShowAddModal(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !firstName || !lastName || !email || !accountId) return;
    updateContact(editId, { firstName, lastName, email, phone, role, accountId, isPrimary, notes });
    addToast(t('contacts.saveEdit') + '!', 'success');
    resetForm();
    setShowEditModal(false);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm(t('contacts.deleteConfirm'))) return;
    deleteContact(id);
    addToast(t('contacts.empty'), 'info');
    if (selected === id) setSelected(null);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{t('contacts.title')}</h1>
          <p className="text-sm text-zinc-500 mt-1">{t('contacts.desc')}</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 group-hover:text-indigo-400 transition-colors" />
            <input type="text" placeholder={t('contacts.search')} value={search} onChange={e => setSearch(e.target.value)}
              className="glass-panel focus:outline-none focus:border-indigo-500 rounded-xl py-2 pl-10 pr-4 text-sm w-44 sm:w-60 text-zinc-200 transition-all focus:ring-2 focus:ring-indigo-500/20" />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>{t('contacts.add')}</span>
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        <div className="glass-card-accent rounded-2xl p-4 flex flex-col space-y-3 h-full overflow-y-auto custom-scrollbar card-highlight">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-2 block">{t('contacts.listTitle')} <span className="text-zinc-600 font-normal">({filtered.length})</span></span>
          <div className="space-y-1.5">
            {filtered.map(c => (
              <motion.div key={c.id} whileHover={{ scale: 1.01 }}
                onClick={() => setSelected(c.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center space-x-3 ${
                  current?.id === c.id ? 'border-indigo-500/40 bg-indigo-500/[0.07]' : 'border-white/[0.04] bg-zinc-900/30 hover:bg-zinc-800/60 hover:border-indigo-500/20'
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                  current?.id === c.id ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20' : 'bg-zinc-800 text-indigo-400 border-white/5'
                }`}>
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-zinc-200 truncate">{c.firstName} {c.lastName}</h4>
                  <p className="text-xs text-zinc-500 truncate">{c.email}</p>
                </div>
                {c.isPrimary && <Star className="w-3 h-3 text-amber-400 shrink-0" />}
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-8 text-xs text-zinc-500">
                <Users className="w-5 h-5 mx-auto mb-2 opacity-20" />
                {t('contacts.empty')}
              </div>
            )}
          </div>
        </div>

        <div className="glass-card-accent rounded-2xl lg:col-span-2 flex flex-col h-full overflow-hidden relative card-highlight">
          {current ? (
            <>
              <div className="h-32 bg-gradient-to-r from-violet-600/80 via-violet-700/60 to-violet-800/40 relative shrink-0" />
              <div className="px-6 pb-6 border-b border-white/[0.04] relative bg-zinc-900/50 shrink-0">
                <div className="flex justify-between items-end -mt-12 mb-4">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border-4 border-zinc-950 flex items-center justify-center text-violet-400 shadow-xl relative z-10">
                    <User className="w-10 h-10" />
                  </div>
                  <div className="flex space-x-2">
                    <motion.button whileHover={{ scale: 1.02 }}
                      onClick={() => openEdit(current.id)}
                      className="flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 rounded-xl bg-indigo-500/5 font-semibold transition cursor-pointer">
                      <Pencil className="w-3.5 h-3.5" />
                      <span>{t('contacts.saveEdit')}</span>
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }}
                      onClick={() => handleDelete(current.id)}
                      className="flex items-center space-x-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl bg-red-500/5 font-semibold transition cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('customers.delete')}</span>
                    </motion.button>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold text-zinc-100">{current.firstName} {current.lastName}</h2>
                    {current.isPrimary && (
                      <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <Star className="w-2.5 h-2.5" /> {t('contacts.primary')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-500">{t('contacts.role')}: {current.role}</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-2 text-xs text-zinc-400">
                  <div className="flex items-center space-x-1.5 bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-white/[0.04]">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{current.email}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-white/[0.04]">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{current.phone}</span>
                  </div>
                  {(() => {
                    const acc = accounts.find(a => a.id === current.accountId);
                    return acc ? (
                      <div className="flex items-center space-x-1.5 bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-white/[0.04]">
                        <Building className="w-3.5 h-3.5 text-rose-400" />
                        <span>{t('contacts.contactOf')} {acc.name}</span>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
              <div className="flex-1 p-6 bg-zinc-950/10 overflow-y-auto">
                {current.notes ? (
                  <div>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{t('contacts.notes')}</h4>
                    <p className="text-sm text-zinc-400 whitespace-pre-wrap">{current.notes}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800/40 flex items-center justify-center text-zinc-500 mb-3 border border-white/[0.04]">
                      <User className="w-6 h-6 opacity-40" />
                    </div>
                    <p className="text-sm text-zinc-600">{t('contacts.notes')} —</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800/30 flex items-center justify-center text-zinc-600 mb-4 border border-white/[0.04]">
                <Users className="w-8 h-8 opacity-40" />
              </div>
              <h3 className="font-bold text-zinc-400">{t('contacts.noSelection')}</h3>
              <p className="text-sm text-zinc-600 mt-1">{t('contacts.noSelectionDesc')}</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showAddModal} onClose={() => { resetForm(); setShowAddModal(false); }} title={t('contacts.newContact')}>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('contacts.firstName')}</label>
              <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder={t('extra.placeholders.firstName')} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('contacts.lastName')}</label>
              <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} placeholder={t('extra.placeholders.lastName')} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('contacts.email')}</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="joao@empresa.com" className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('contacts.phone')}</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder={t('extra.placeholders.phone')} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('contacts.role')}</label>
              <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder={t('extra.placeholders.role')} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('contacts.account')}</label>
              <select required value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-300">
                <option value="">{t('contacts.selectAccount')}</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('contacts.notes')}</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100 resize-none" />
          </div>
          <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
            <input type="checkbox" checked={isPrimary} onChange={e => setIsPrimary(e.target.checked)} className="rounded border-zinc-600 bg-zinc-800 text-indigo-500 focus:ring-indigo-500" />
            <span>{t('contacts.primary')}</span>
          </label>
          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => { resetForm(); setShowAddModal(false); }} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white border border-white/5 bg-zinc-900/50 rounded-xl transition hover:bg-zinc-800 cursor-pointer">{t('contacts.cancel')}</button>
            <button type="submit" disabled={accounts.length === 0} className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50">{t('contacts.save')}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { resetForm(); setShowEditModal(false); }} title={t('contacts.editContact')}>
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('contacts.firstName')}</label>
              <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('contacts.lastName')}</label>
              <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('contacts.email')}</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('contacts.phone')}</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('contacts.role')}</label>
              <input type="text" value={role} onChange={e => setRole(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('contacts.account')}</label>
              <select required value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-300">
                <option value="">{t('contacts.selectAccount')}</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('contacts.notes')}</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100 resize-none" />
          </div>
          <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
            <input type="checkbox" checked={isPrimary} onChange={e => setIsPrimary(e.target.checked)} className="rounded border-zinc-600 bg-zinc-800 text-indigo-500 focus:ring-indigo-500" />
            <span>{t('contacts.primary')}</span>
          </label>
          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => { resetForm(); setShowEditModal(false); }} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white border border-white/5 bg-zinc-900/50 rounded-xl transition hover:bg-zinc-800 cursor-pointer">{t('contacts.cancel')}</button>
            <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">{t('contacts.saveEdit')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
});
