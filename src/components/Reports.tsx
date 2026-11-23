import { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCRM } from '../hooks/useCRM';
import { TrendingUp, Target, Award, BarChart3, Download, FileText, PieChart, Clock, CheckSquare, DollarSign } from 'lucide-react';

const stageProbabilities: Record<string, number> = {
  'prospecção': 0.2,
  'proposta_sent': 0.5,
  'closed_won': 1.0,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function csvEscape(val: string) {
  return `"${val.replace(/"/g, '""')}"`;
}

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  a.click(); URL.revokeObjectURL(url);
}

export const Reports = memo(function Reports() {
  const { t } = useTranslation();
  const { accounts, deals, tasks, invoices, expenses } = useCRM();

  const metrics = useMemo(() => {
    const activeDeals = deals.filter(d => !d.archived && d.status !== 'closed_won');
    const wonDeals = deals.filter(d => d.status === 'closed_won' && !d.archived);
    const lostDeals = deals.filter(d => d.archived && d.status !== 'closed_won');
    const totalPipeline = deals.reduce((s, d) => s + d.value, 0);
    const weightedForecast = deals.reduce((s, d) => s + d.value * (stageProbabilities[d.status] || 0), 0);
    const winRate = wonDeals.length + lostDeals.length > 0
      ? Math.round(wonDeals.length / (wonDeals.length + lostDeals.length) * 100) : 0;
    const avgDealSize = wonDeals.length > 0
      ? wonDeals.reduce((s, d) => s + d.value, 0) / wonDeals.length : 0;
    const totalRevenue = invoices.filter(i => i.status === 'Paga').reduce((s, i) => s + i.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const pendingTasks = tasks.filter(t => !t.completed);
    const overdueTasks = pendingTasks.filter(t => t.dueDate < new Date().toISOString().split('T')[0]);
    const completedTasks = tasks.filter(t => t.completed);
    const completionRate = tasks.length > 0 ? Math.round(completedTasks.length / tasks.length * 100) : 0;
    const outstandingInvoices = invoices.filter(i => i.status === 'Pendente');

    return {
      activeDeals, wonDeals, lostDeals,
      totalPipeline, weightedForecast, winRate, avgDealSize,
      totalRevenue, totalExpenses,
      pendingTasks, overdueTasks, completionRate, outstandingInvoices,
    };
  }, [deals, invoices, expenses, tasks]);

  const stageData = useMemo(() => {
    const stages = [
      { key: 'prospecção', label: t('dashboard.pipelineLabels.prospeccao'), prob: 0.2, color: 'bg-blue-500', textColor: 'text-blue-400', borderColor: 'border-blue-500/20' },
      { key: 'proposta_sent', label: t('dashboard.pipelineLabels.proposta_sent'), prob: 0.5, color: 'bg-amber-500', textColor: 'text-amber-400', borderColor: 'border-amber-500/20' },
      { key: 'closed_won', label: t('dashboard.pipelineLabels.closed_won'), prob: 1.0, color: 'bg-emerald-500', textColor: 'text-emerald-400', borderColor: 'border-emerald-500/20' },
    ];
    return stages.map(s => {
      const stageDeals = deals.filter(d => d.status === s.key && !d.archived);
      const value = stageDeals.reduce((sum, d) => sum + d.value, 0);
      return { ...s, count: stageDeals.length, value, weighted: value * s.prob };
    });
  }, [deals, t]);

  const monthlyData = useMemo(() => {
    const map = new Map<string, { revenue: number; expenses: number }>();
    invoices.filter(i => i.status === 'Paga').forEach(i => {
      const month = i.date.slice(0, 7);
      const prev = map.get(month) || { revenue: 0, expenses: 0 };
      map.set(month, { ...prev, revenue: prev.revenue + i.amount });
    });
    expenses.forEach(e => {
      const month = e.date.slice(0, 7);
      const prev = map.get(month) || { revenue: 0, expenses: 0 };
      map.set(month, { ...prev, expenses: prev.expenses + e.amount });
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [invoices, expenses]);

  const maxMonthly = Math.max(...monthlyData.map(m => m[1].revenue + m[1].expenses), 1);

  const exportDealsCSV = () => {
    const headers = ['Title', 'Account', 'Value', 'Stage', 'Created', 'Archived'];
    const rows = deals.map(d => [
      csvEscape(d.title),
      csvEscape(accounts.find(a => a.id === d.accountId)?.name || ''),
      d.value.toString(),
      d.status,
      d.createdAt,
      d.archived ? 'Yes' : 'No',
    ]);
    downloadCSV('deals.csv', headers, rows);
  };

  const exportInvoicesCSV = () => {
    const headers = ['Title', 'Account', 'Amount', 'Date', 'Due Date', 'Status'];
    const rows = invoices.map(i => [
      csvEscape(i.title),
      csvEscape(accounts.find(a => a.id === i.accountId)?.name || ''),
      i.amount.toString(),
      i.date, i.dueDate, i.status,
    ]);
    downloadCSV('invoices.csv', headers, rows);
  };

  const exportExpensesCSV = () => {
    const headers = ['Title', 'Account', 'Amount', 'Date', 'Category'];
    const rows = expenses.map(e => [
      csvEscape(e.title),
      csvEscape(accounts.find(a => a.id === e.accountId)?.name || ''),
      e.amount.toString(), e.date, e.category,
    ]);
    downloadCSV('expenses.csv', headers, rows);
  };

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-indigo-400" />
            {t('reports.title')}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">{t('reports.desc')}</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card-accent rounded-2xl p-5 card-highlight">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400"><Target className="w-5 h-5" /></div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t('reports.pipeline')}</span>
              <p className="text-xl font-bold text-white mt-0.5">R$ {fmt(metrics.totalPipeline)}</p>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-zinc-500">
            {t('reports.forecast')}: <span className="text-indigo-400 font-semibold">R$ {fmt(metrics.weightedForecast)}</span>
          </div>
        </div>
        <div className="glass-card-accent rounded-2xl p-5 card-highlight">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400"><Award className="w-5 h-5" /></div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t('reports.winRate')}</span>
              <p className="text-xl font-bold text-white mt-0.5">{metrics.winRate}%</p>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-zinc-500">
            {t('reports.avgDeal')}: <span className="text-emerald-400 font-semibold">R$ {fmt(metrics.avgDealSize)}</span>
          </div>
        </div>
        <div className="glass-card-accent rounded-2xl p-5 card-highlight">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400"><CheckSquare className="w-5 h-5" /></div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t('reports.tasks')}</span>
              <p className="text-xl font-bold text-white mt-0.5">{metrics.pendingTasks.length}</p>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-zinc-500">
            {metrics.overdueTasks.length} {t('reports.overdue')} · {metrics.completionRate}% {t('reports.done')}
          </div>
        </div>
        <div className="glass-card-accent rounded-2xl p-5 card-highlight">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400"><FileText className="w-5 h-5" /></div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t('reports.outstanding')}</span>
              <p className="text-xl font-bold text-white mt-0.5">R$ {fmt(metrics.outstandingInvoices.reduce((s, i) => s + i.amount, 0))}</p>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-zinc-500">
            {metrics.outstandingInvoices.length} {t('financial.invoices').toLowerCase()} {t('reports.pending')}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="glass-card-accent rounded-2xl p-5 card-highlight">
          <h3 className="font-bold text-zinc-100 flex items-center space-x-2 mb-6">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400"><PieChart className="w-4 h-4" /></div>
            <span>{t('reports.pipelineByStage')}</span>
          </h3>
          {deals.length > 0 ? (
            <div className="space-y-5">
              {stageData.map(stage => {
                const maxVal = Math.max(...stageData.map(s => s.value), 1);
                const pct = Math.round(stage.value / maxVal * 100);
                return (
                  <div key={stage.key} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-200 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${stage.color}`} />
                        {stage.label}
                        <span className="text-zinc-600 bg-zinc-900/80 border border-white/5 px-1.5 py-0.5 rounded text-[10px]">{stage.count}</span>
                      </span>
                      <span className="font-semibold text-zinc-400">
                        R$ {fmt(stage.value)} <span className="text-zinc-600 font-normal">(R$ {fmt(stage.weighted)} {t('reports.weighted').toLowerCase()})</span>
                      </span>
                    </div>
                    <div className="w-full bg-zinc-950/60 rounded-full h-2.5 border border-white/5 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${stage.color}`}
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-zinc-500">{t('dashboard.noActiveDeals')}</div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card-accent rounded-2xl p-5 card-highlight">
          <h3 className="font-bold text-zinc-100 flex items-center space-x-2 mb-6">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400"><TrendingUp className="w-4 h-4" /></div>
            <span>{t('reports.monthly')}</span>
          </h3>
          {monthlyData.length > 0 ? (
            <div className="flex items-end gap-2 h-48">
              {monthlyData.map(([month, data]) => {
                const revPct = Math.round(data.revenue / maxMonthly * 100);
                const expPct = Math.round(data.expenses / maxMonthly * 100);
                return (
                  <div key={month} className="flex-1 flex flex-col items-center justify-end h-full gap-0.5">
                    <div className="w-full flex flex-col items-center justify-end gap-0.5" style={{ height: `${Math.max(revPct + expPct, 2)}%` }}>
                      {data.expenses > 0 && (
                        <motion.div
                          initial={{ height: 0 }} animate={{ height: `${expPct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="w-full rounded-t-sm bg-rose-500/60 min-h-[2px]" />
                      )}
                      {data.revenue > 0 && (
                        <motion.div
                          initial={{ height: 0 }} animate={{ height: `${revPct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="w-full rounded-t-sm bg-emerald-500/60 min-h-[2px]" />
                      )}
                    </div>
                    <span className="text-[9px] text-zinc-600 mt-1 rotate-45 origin-left whitespace-nowrap">{month.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-zinc-500">{t('reports.noData')}</div>
          )}
          <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-zinc-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60" /> {t('financial.revenue')}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500/60" /> {t('financial.expenses')}</span>
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="glass-card-accent rounded-2xl p-5 card-highlight">
        <h3 className="font-bold text-zinc-100 flex items-center space-x-2 mb-6">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400"><Download className="w-4 h-4" /></div>
          <span>{t('reports.export')}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={exportDealsCSV}
            className="flex items-center gap-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 p-4 rounded-xl font-semibold text-sm text-zinc-200 transition cursor-pointer">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400"><TrendingUp className="w-4 h-4" /></div>
            <span>{t('reports.exportDeals')}</span>
          </button>
          <button onClick={exportInvoicesCSV}
            className="flex items-center gap-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 p-4 rounded-xl font-semibold text-sm text-zinc-200 transition cursor-pointer">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><DollarSign className="w-4 h-4" /></div>
            <span>{t('reports.exportInvoices')}</span>
          </button>
          <button onClick={exportExpensesCSV}
            className="flex items-center gap-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 p-4 rounded-xl font-semibold text-sm text-zinc-200 transition cursor-pointer">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400"><Clock className="w-4 h-4" /></div>
            <span>{t('reports.exportExpenses')}</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
});
