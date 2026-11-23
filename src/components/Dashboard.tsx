import { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCRM } from '../hooks/useCRM';
import { Modal } from './Modal';
import { TrendingUp, Award, FileText, CheckSquare, Plus, Info, Calculator, Target, ClipboardList, ChevronRight, Sparkles } from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const Dashboard = memo(function Dashboard({ onNavigate }: DashboardProps) {
  const { t } = useTranslation();
  const { accounts, deals, tasks, invoices, addDeal, addAccount } = useCRM();
  const [showDealModal, setShowDealModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [dealTitle, setDealTitle] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [dealAccount, setDealAccount] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');

  const quarterlyTarget = 100000;

  const { wonRevenue, pendingTasks, progress, pipelineStages, totalPipeline, metrics } = useMemo(() => {
    const ad = deals.filter(d => !d.archived && d.status !== 'closed_won');
    const wd = deals.filter(d => d.status === 'closed_won' && !d.archived);
    const ar = ad.reduce((s, d) => s + d.value, 0);
    const wr = wd.reduce((s, d) => s + d.value, 0);
    const pt = tasks.filter(t => !t.completed);
    const oi = invoices.filter(i => i.status === 'Pendente');
    const oia = oi.reduce((s, i) => s + i.amount, 0);
    const prog = Math.min(100, Math.round(wr / quarterlyTarget * 100));

    const stages = [
      { key: 'prospecção' as const, label: t('dashboard.pipelineLabels.prospeccao'), color: 'bg-blue-500', gradient: 'from-blue-500 to-blue-400', deals: deals.filter(d => d.status === 'prospecção' && !d.archived) },
      { key: 'proposta_sent' as const, label: t('dashboard.pipelineLabels.proposta_sent'), color: 'bg-amber-500', gradient: 'from-amber-500 to-amber-400', deals: deals.filter(d => d.status === 'proposta_sent' && !d.archived) },
      { key: 'closed_won' as const, label: t('dashboard.pipelineLabels.closed_won'), color: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-400', deals: deals.filter(d => d.status === 'closed_won' && !d.archived) },
    ];
    const tp = deals.filter(d => !d.archived).reduce((s, d) => s + d.value, 0);

    const m = [
      { title: t('dashboard.metric.active'), value: `R$ ${ar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, subtitle: `${ad.length} negócios ativos`, icon: TrendingUp, colorClass: 'text-indigo-400', bgClass: 'bg-indigo-500/10', gradient: 'from-indigo-500/10 to-transparent' },
      { title: t('dashboard.metric.won'), value: `R$ ${wr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, subtitle: `${wd.length} negócios ganhos`, icon: Award, colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10', gradient: 'from-emerald-500/10 to-transparent' },
      { title: t('dashboard.metric.invoices'), value: `R$ ${oia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, subtitle: `${oi.length} faturas em aberto`, icon: FileText, colorClass: 'text-amber-400', bgClass: 'bg-amber-500/10', gradient: 'from-amber-500/10 to-transparent' },
      { title: t('dashboard.metric.tasks'), value: pt.length.toString(), subtitle: `de ${tasks.length} tarefas`, icon: CheckSquare, colorClass: 'text-fuchsia-400', bgClass: 'bg-fuchsia-500/10', gradient: 'from-fuchsia-500/10 to-transparent' },
    ];

    return { wonRevenue: wr, pendingTasks: pt, progress: prog, pipelineStages: stages, totalPipeline: tp, metrics: m };
  }, [deals, tasks, invoices, t]);

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            {t('dashboard.title')}
            <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/15 px-2 py-0.5 rounded-full uppercase tracking-wider">CRM</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">{t('dashboard.desc')}</p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowCompanyModal(true)}
            className="flex items-center space-x-2 glass-panel text-zinc-200 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:border-white/10 cursor-pointer">
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>{t('dashboard.addCompany')}</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowDealModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>{t('dashboard.addDeal')}</span>
          </motion.button>
        </div>
      </motion.div>

      {deals.length === 0 && (
        <motion.div variants={itemVariants}
          className="bg-gradient-to-r from-indigo-600/8 to-indigo-500/5 border border-indigo-500/15 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 card-highlight">
          <div className="flex items-center space-x-4 text-center md:text-left flex-col md:flex-row">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/10">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-zinc-100 text-lg">{t('dashboard.empty.title')}</h4>
              <p className="text-xs text-zinc-500 mt-0.5">{t('dashboard.empty.desc')}</p>
            </div>
          </div>
          <button onClick={() => setShowCompanyModal(true)}
            className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition shadow-lg shadow-indigo-500/20">
            {t('dashboard.addCompany')}
          </button>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={i} whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="glass-card-accent rounded-2xl p-5 group relative overflow-hidden card-highlight">
            <div className={`absolute inset-0 bg-gradient-to-br ${m.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="flex justify-between items-start relative z-10">
              <div>
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">{m.title}</span>
                <span className={`text-2xl font-bold block mt-1.5 ${m.colorClass}`}>{m.value}</span>
              </div>
              <div className={`p-2.5 rounded-xl ${m.bgClass} ${m.colorClass} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <m.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-zinc-500 relative z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mr-2" />
              {m.subtitle}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card-accent rounded-2xl p-5 lg:col-span-2 card-highlight">
          <h3 className="font-bold text-zinc-100 flex items-center space-x-2 mb-6">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span>{t('dashboard.chart.title')}</span>
          </h3>
          {deals.length > 0 ? (
            <div className="space-y-5">
              {pipelineStages.map(stage => {
                const stageValue = stage.deals.reduce((s, d) => s + d.value, 0);
                const pct = totalPipeline > 0 ? Math.round(stageValue / totalPipeline * 100) : 0;
                return (
                  <div key={stage.key} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-200 flex items-center space-x-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${stage.color} shadow-sm`} />
                        <span>{stage.label}</span>
                        <span className="text-zinc-600 font-bold bg-zinc-900/80 border border-white/5 px-1.5 py-0.5 rounded-md text-[10px]">{stage.deals.length}</span>
                      </span>
                      <span className="font-semibold text-zinc-400">R$ {stageValue.toLocaleString('pt-BR')} <span className="text-zinc-600 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="w-full bg-zinc-950/60 rounded-full h-2.5 border border-white/5 overflow-hidden shadow-inner">
                      <motion.div className={`h-full rounded-full bg-gradient-to-r ${stage.gradient} shadow-sm`}
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-xs text-zinc-500 space-y-3 py-10">
              <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/5">
                <Calculator className="w-6 h-6 opacity-30 text-indigo-500" />
              </div>
              <span className="font-medium">{t('dashboard.noActiveDeals')}</span>
            </div>
          )}
        </div>

        <div className="glass-card-accent rounded-2xl p-5 flex flex-col items-center text-center relative overflow-hidden card-highlight">
          <div className="w-full flex items-center space-x-2 mb-4 justify-start">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
              <h3 className="font-bold text-zinc-100">{t('dashboard.quarterlyTarget')}</h3>
          </div>
          <div className="relative w-36 h-36 flex items-center justify-center mt-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
              <motion.circle cx="50" cy="50" r="42" stroke="url(#emeraldGradient)" strokeWidth="8" fill="transparent"
                strokeDasharray="263.8" strokeDashoffset={263.8 - 263.8 * progress / 100}
                strokeLinecap="round" initial={{ strokeDashoffset: 263.8 }}
                animate={{ strokeDashoffset: 263.8 - 263.8 * progress / 100 }}
                transition={{ duration: 1.5, ease: 'easeOut' }} />
              <defs>
                <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">{progress}%</span>
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">{t('dashboard.achieved')}</span>
            </div>
          </div>
          <div className="mt-6 space-y-1.5 w-full">
            <div className="flex justify-between text-xs px-2">
              <span className="text-zinc-500">{t('dashboard.target')}</span>
              <span className="font-semibold text-zinc-300">R$ {quarterlyTarget.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between text-xs px-2">
              <span className="text-zinc-500">{t('dashboard.remaining')}</span>
              <span className="font-semibold text-amber-400">R$ {Math.max(0, quarterlyTarget - wonRevenue).toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>
        <div className="glass-card-accent rounded-2xl p-5 lg:col-span-3 card-highlight">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-zinc-100 flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-fuchsia-500/10 text-fuchsia-400">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <span>{t('dashboard.focus.title')}</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">{t('dashboard.focus.desc')}</p>
            </div>
            <motion.button whileHover={{ x: 2 }} onClick={() => onNavigate('tasks')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1 bg-indigo-500/5 hover:bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/10 transition-all">
              <span>{t('dashboard.focus.all')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingTasks.slice(0, 3).map((task, i) => (
              <motion.div key={task.id} whileHover={{ y: -3, transition: { duration: 0.2 } }}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                className="bg-zinc-900/60 rounded-xl p-4 border border-white/[0.04] hover:border-indigo-500/20 hover:bg-zinc-900/80 transition-all flex flex-col justify-between group">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-sm font-bold text-zinc-200 line-clamp-1 group-hover:text-indigo-300 transition-colors">{task.title}</span>
                  <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full ${task.priority === 'Alta' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : task.priority === 'Média' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-zinc-800 text-zinc-400 border border-white/5'}`}>
                    {task.priority}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-zinc-600" />
                    {t('dashboard.due')} {task.dueDate}
                  </span>
                  <span className="text-indigo-400 font-semibold cursor-pointer hover:text-indigo-300 transition-colors opacity-0 group-hover:opacity-100" onClick={() => onNavigate('tasks')}>{t('dashboard.details')}</span>
                </div>
              </motion.div>
            ))}
            {pendingTasks.length === 0 && (
              <div className="col-span-full py-10 text-center text-xs text-zinc-500 bg-zinc-900/20 border border-dashed border-white/5 rounded-xl">
                <CheckSquare className="w-6 h-6 mx-auto mb-2 opacity-20 text-emerald-400" />
                {t('dashboard.focus.empty')}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <Modal isOpen={showDealModal} onClose={() => setShowDealModal(false)} title={t('extra.newDealTitle')}>
        <form onSubmit={e => { e.preventDefault(); if (dealTitle && dealValue && dealAccount) { addDeal({ title: dealTitle, value: parseFloat(dealValue), accountId: dealAccount, status: 'prospecção', archived: false, notes: '' }); setDealTitle(''); setDealValue(''); setDealAccount(''); setShowDealModal(false); } }} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('extra.dealTitleLabel')}</label>
            <input type="text" required value={dealTitle} onChange={e => setDealTitle(e.target.value)} placeholder="Ex: Licenciamento de Software" className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('extra.dealValueLabel')}</label>
              <input type="number" required value={dealValue} onChange={e => setDealValue(e.target.value)} placeholder="Ex: 5000" className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('extra.companyLabel')}</label>
              <select required value={dealAccount} onChange={e => setDealAccount(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-300 transition-all">
                <option value="">{t('extra.selectPlaceholder')}</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
          {accounts.length === 0 && <p className="text-[11px] text-amber-400 italic flex items-center gap-1.5"><Info className="w-3 h-3" /> {t('extra.needCompanyWarning')}</p>}
          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => setShowDealModal(false)} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white border border-white/5 bg-zinc-900/50 rounded-xl transition hover:bg-zinc-800 cursor-pointer">{t('extra.cancelBtn')}</button>
            <button type="submit" disabled={accounts.length === 0} className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">{t('extra.saveDealBtn')}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showCompanyModal} onClose={() => setShowCompanyModal(false)} title={t('extra.newCompanyTitle')}>
        <form onSubmit={e => { e.preventDefault(); if (companyName && companyIndustry && companyWebsite) { addAccount({ name: companyName, industry: companyIndustry, website: companyWebsite }); setCompanyName(''); setCompanyIndustry(''); setCompanyWebsite(''); setShowCompanyModal(false); } }} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('extra.orgNameLabel')}</label>
            <input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Ex: Globex LTDA" className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('extra.industryLabel')}</label>
              <input type="text" required value={companyIndustry} onChange={e => setCompanyIndustry(e.target.value)} placeholder="Ex: Tecnologia" className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('extra.websiteLabel')}</label>
              <input type="text" required value={companyWebsite} onChange={e => setCompanyWebsite(e.target.value)} placeholder="Ex: globex.com" className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100 transition-all" />
            </div>
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => setShowCompanyModal(false)} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white border border-white/5 bg-zinc-900/50 rounded-xl transition hover:bg-zinc-800 cursor-pointer">{t('extra.cancelBtn')}</button>
            <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">{t('extra.saveCompanyBtn')}</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
});