import { useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCRM } from '../hooks/useCRM';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { CheckSquare, Plus, Circle, Pencil } from 'lucide-react';

export const TasksView = memo(function TasksView() {
  const { t } = useTranslation();
  const { tasks, toggleTask, addTask, updateTask, deleteTask } = useCRM();
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'Alta' | 'Média' | 'Baixa'>('Média');
  const [editId, setEditId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title'>('dueDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;
    if (editId) {
      updateTask(editId, { title, dueDate, priority, description: '', accountId: undefined, dealId: undefined });
      addToast(t('tasks.save') + '!', 'success');
      setEditId(null);
    } else {
      addTask({ title, dueDate, priority, description: '', accountId: undefined, dealId: undefined });
      addToast(t('tasks.add') + '!', 'success');
    }
    setTitle(''); setDueDate(''); setPriority('Média');
    setShowForm(false);
  };

  const openEdit = (task: typeof tasks[0]) => {
    setTitle(task.title);
    setDueDate(task.dueDate);
    setPriority(task.priority);
    setEditId(task.id);
    setShowForm(true);
  };

  const priorityOrder = { 'Alta': 0, 'Média': 1, 'Baixa': 2 };
  const filtered = filterPriority === 'all' ? tasks : tasks.filter(t => t.priority === filterPriority);
  const sorted = [...filtered].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const cmp = sortBy === 'dueDate' ? a.dueDate.localeCompare(b.dueDate)
      : sortBy === 'priority' ? priorityOrder[a.priority] - priorityOrder[b.priority]
      : a.title.localeCompare(b.title);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{t('tasks.title')}</h1>
          <p className="text-sm text-zinc-500 mt-1">{t('tasks.summary', { pending: tasks.filter(t => !t.completed).length, total: tasks.length })}</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { setShowForm(!showForm); if (!showForm) { setEditId(null); setTitle(''); setDueDate(''); setPriority('Média'); } }}
          className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>{t('tasks.add')}</span>
        </motion.button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-zinc-500 font-medium">{t('tasks.sort')}:</span>
          {['dueDate', 'priority', 'title'].map(s => (
            <button key={s} onClick={() => { if (sortBy === s) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortBy(s as typeof sortBy); setSortDir('asc'); } }}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                sortBy === s ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400' : 'border-white/5 bg-zinc-900 text-zinc-500 hover:text-zinc-300'
              }`}>
              {s === 'dueDate' ? t('tasks.dueDate') : s === 'priority' ? t('tasks.priority') : t('tasks.titleLabel')} {sortBy === s ? (sortDir === 'asc' ? '↑' : '↓') : ''}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-zinc-500 font-medium">{t('tasks.priority')}:</span>
          {['all', 'Alta', 'Média', 'Baixa'].map(p => (
            <button key={p} onClick={() => setFilterPriority(p)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                filterPriority === p ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400' : 'border-white/5 bg-zinc-900 text-zinc-500 hover:text-zinc-300'
              }`}>
              {p === 'all' ? t('tasks.all') : p}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit} className="glass-card-accent rounded-2xl p-5 space-y-4 card-highlight">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('tasks.titleLabel')}</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder={t('tasks.titleLabel')} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('tasks.dueDate')}</label>
              <input type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('tasks.priority')}</label>
              <select value={priority} onChange={e => setPriority(e.target.value as 'Alta' | 'Média' | 'Baixa')} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-300">
                <option value="Alta">{t('tasks.high')}</option>
                <option value="Média">{t('tasks.medium')}</option>
                <option value="Baixa">{t('tasks.low')}</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); setTitle(''); setDueDate(''); setPriority('Média'); }} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white border border-white/5 bg-zinc-900/50 rounded-xl transition hover:bg-zinc-800 cursor-pointer">{t('tasks.cancel')}</button>
            <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">{t('tasks.save')}</button>
          </div>
        </motion.form>
      )}

      <div className="space-y-1.5">
        {sorted.map((task, i) => (
          <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className={`glass-card rounded-xl p-4 flex items-center justify-between border transition-all hover:border-white/[0.08] ${task.completed ? 'border-white/[0.03] opacity-50' : 'border-white/[0.04]'}`}>
            <div className="flex items-center space-x-3 flex-1">
              <button onClick={() => toggleTask(task.id)} className="cursor-pointer group">
                {task.completed ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                ) : (
                  <Circle className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 group-hover:scale-110 transition-all" />
                )}
              </button>
              <div className="flex-1">
                <span className={`text-sm font-semibold ${task.completed ? 'line-through text-zinc-600' : 'text-zinc-200'}`}>
                  {task.title}
                </span>
                <div className="flex items-center space-x-3 mt-0.5">
                  <span className="text-[10px] text-zinc-500">{t('tasks.due')} {task.dueDate}</span>
                  <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                    task.priority === 'Alta' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    task.priority === 'Média' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-zinc-800 text-zinc-400 border border-white/5'
                  }`}>{task.priority}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button onClick={() => openEdit(task)} className="text-xs text-zinc-600 hover:text-indigo-400 transition cursor-pointer p-1.5 hover:bg-indigo-500/10 rounded-lg">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { if (!window.confirm(t('settings.clearConfirm'))) return; deleteTask(task.id); addToast(t('tasks.empty'), 'info'); }} className="text-xs text-zinc-600 hover:text-red-400 transition cursor-pointer p-1.5 hover:bg-red-500/10 rounded-lg">✕</button>
            </div>
          </motion.div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-12 text-xs text-zinc-500 bg-zinc-900/20 border border-dashed border-white/[0.04] rounded-xl">
            <CheckSquare className="w-6 h-6 mx-auto mb-2 opacity-20 text-indigo-400" />
            {t('tasks.empty')}
          </div>
        )}
      </div>
    </div>
  );
});