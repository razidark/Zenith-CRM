import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, KanbanSquare, Building, CheckSquare, DollarSign, Settings, ChevronLeft, ChevronRight, Bell, Shield, Users, BarChart3, Briefcase, Activity, Link2, ChevronDown, Star, MoreVertical, Trash2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCRM } from './hooks/useCRM';
import { Dashboard } from './components/Dashboard';
import { Kanban } from './components/Kanban';
import { Customers } from './components/Customers';
import { Financial } from './components/Financial';
import { TasksView } from './components/TasksView';
import { ContactsView } from './components/Contacts';
import { Employees } from './components/Employees';
import { Incidents } from './components/Incidents';
import { GlobalSearch } from './components/GlobalSearch';
import { Reports } from './components/Reports';
import { SettingsView } from './components/Settings';
import { SharePopover } from './components/SharePopover';
import { useToast } from './context/ToastContext';
import { Modal } from './components/Modal';
import { readJsonArray } from './lib/storage';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function App() {
  const { t } = useTranslation();
  const { tasks } = useCRM();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSharePopover, setShowSharePopover] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDatabaseStatus, setShowDatabaseStatus] = useState(false);
  const [workspaceStarred, setWorkspaceStarred] = useState(() => {
    return localStorage.getItem('zenith_workspace_starred') === 'true';
  });

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const pendingTasks = tasks.filter(t => !t.completed);

  const exportWorkspaceData = () => {
    try {
      const keys = ['zenith_employees', 'zenith_incidents', 'zenith_collaborators', 'zenith_general_access', 'zenith_workspace_starred', 'crm_accounts', 'crm_deals', 'crm_tasks', 'crm_invoices', 'crm_expenses'];
      const backup: Record<string, unknown> = {};
      keys.forEach(k => {
        const val = localStorage.getItem(k);
        if (val) {
          try {
            backup[k] = JSON.parse(val);
          } catch {
            backup[k] = val;
          }
        }
      });

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zenith_workspace_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast(t('extra.backupSuccess'), 'success');
    } catch {
      addToast(t('extra.backupFailed'), 'error');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={setActiveTab} />;
      case 'kanban': return <Kanban />;
      case 'database': return <Customers />;
      case 'tasks': return <TasksView />;
      case 'financial': return <Financial />;
      case 'contacts': return <ContactsView />;
      case 'employees': return <Employees />;
      case 'incidents': return <Incidents />;
      case 'reports': return <Reports />;
      case 'settings': return <SettingsView />;
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-300 overflow-hidden">
      <motion.aside
        animate={{ width: isSidebarCollapsed ? 72 : 240 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="glass-panel border-r border-white/[0.04] h-screen flex flex-col justify-between shrink-0 relative z-30"
      >
        <div className="relative flex flex-col flex-1">
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.04] relative">
            <div className={`flex items-center space-x-3 overflow-hidden ${isSidebarCollapsed ? 'justify-center w-full' : ''}`}>
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }} whileTap={{ scale: 0.95 }}
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0 border border-white/10"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 5H19L9 19H19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
              {!isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col"
                >
                  <span className="font-bold text-xs tracking-wider text-white leading-none uppercase">Zenith</span>
                  <span className="text-[9px] font-bold text-indigo-400 tracking-widest mt-0.5 uppercase">Workspace</span>
                </motion.div>
              )}
            </div>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="absolute -right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-zinc-900 border border-white/[0.08] hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all hover:border-white/[0.12] cursor-pointer shadow-md z-50 flex items-center justify-center w-6 h-6"
            >
              {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>

          <nav className="p-2.5 space-y-0.5 flex-1 overflow-y-auto custom-scrollbar">
            <SidebarLink icon={LayoutDashboard} label={t('nav.dashboard')} active={activeTab === 'dashboard'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('dashboard')} />
            <SidebarLink icon={KanbanSquare} label={t('nav.kanban')} active={activeTab === 'kanban'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('kanban')} />
            <SidebarLink icon={Building} label={t('nav.customers')} active={activeTab === 'database'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('database')} />
            <SidebarLink icon={CheckSquare} label={t('nav.tasks')} active={activeTab === 'tasks'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('tasks')} badge={pendingTasks.length > 0 ? pendingTasks.length : undefined} />
            <SidebarLink icon={DollarSign} label={t('nav.financial')} active={activeTab === 'financial'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('financial')} />
            <SidebarLink icon={Users} label={t('nav.contacts')} active={activeTab === 'contacts'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('contacts')} />
            <SidebarLink icon={Briefcase} label={t('nav.employees')} active={activeTab === 'employees'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('employees')} />
            <SidebarLink icon={Activity} label={t('nav.incidents')} active={activeTab === 'incidents'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('incidents')} />
            <SidebarLink icon={BarChart3} label={t('nav.reports')} active={activeTab === 'reports'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('reports')} />
            <SidebarLink icon={Settings} label={t('nav.settings')} active={activeTab === 'settings'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('settings')} />
          </nav>

          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-950/80 to-transparent pointer-events-none" />
        </div>

        <div className="relative p-3 border-t border-white/[0.04] bg-zinc-900/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/[0.02] to-transparent pointer-events-none" />
          {!isSidebarCollapsed ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between relative">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/[0.06] flex items-center justify-center text-indigo-400 relative shadow-inner">
                  <Shield className="w-4 h-4" />
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border-2 border-zinc-950"></span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">Razid</h4>
                  <span className="text-[9px] text-zinc-500 font-semibold block leading-tight">{t('extra.roleAdmin')}</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center relative">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/[0.06] flex items-center justify-center text-indigo-400 relative shadow-inner">
                <Shield className="w-4 h-4" />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border-2 border-zinc-950"></span>
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 border-b border-white/[0.04] flex items-center justify-between px-6 bg-zinc-950/30 backdrop-blur-md relative z-20 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center space-x-1.5 text-[10px] font-bold text-zinc-600 tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 animate-pulse-subtle" />
              <span>{t('app.offline')}</span>
            </div>
            <GlobalSearch onNavigate={setActiveTab} />
          </div>

          <div className="flex items-center space-x-3">
            {/* PWA Install Button */}
            {installPrompt && (
              <button
                onClick={handleInstallClick}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1.5 cursor-pointer font-bold text-xs select-none h-8 shadow-sm shadow-indigo-600/10"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('extra.installApp')}</span>
              </button>
            )}

            {/* Share Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setShowSharePopover(!showSharePopover)}
                className="share-trigger-btn px-3 py-2 rounded-xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 hover:border-white/10 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer font-bold text-xs select-none h-8 shadow-sm"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>{t('extra.share')}</span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </button>
              <SharePopover isOpen={showSharePopover} onClose={() => setShowSharePopover(false)} />
            </div>

            {/* Initials Avatar */}
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-extrabold flex items-center justify-center text-xs select-none shadow-sm cursor-default">
              KR
            </div>

            {/* Star Button */}
            <button
              onClick={() => {
                const nextStarred = !workspaceStarred;
                setWorkspaceStarred(nextStarred);
                localStorage.setItem('zenith_workspace_starred', String(nextStarred));
                addToast(
                  nextStarred 
                    ? t('extra.favAdded') 
                    : t('extra.favRemoved'), 
                  'info'
                );
              }}
              className="p-2 rounded-lg bg-zinc-900/80 border border-white/[0.04] hover:bg-zinc-800 transition-all hover:border-white/[0.08] cursor-pointer h-8 flex items-center justify-center"
            >
              <Star className={`w-3.5 h-3.5 transition-all ${workspaceStarred ? 'text-amber-400 fill-amber-400 scale-110' : 'text-zinc-400 hover:text-zinc-200'}`} />
            </button>

            {/* More Options Button */}
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-2 rounded-lg bg-zinc-900/80 border border-white/[0.04] hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all hover:border-white/[0.08] cursor-pointer h-8 flex items-center justify-center"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              <AnimatePresence>
                {showMoreMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl p-2 shadow-2xl z-50 border border-white/[0.06] bg-zinc-950/95 backdrop-blur-xl text-left"
                    >
                      <div className="px-3 py-2 border-b border-white/[0.04] mb-1.5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">{t('extra.workspaceTools')}</span>
                      </div>
                      
                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          setShowDatabaseStatus(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-all text-xs font-semibold text-zinc-300 hover:text-white text-left cursor-pointer"
                      >
                        <Shield className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{t('extra.databaseStatus')}</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          exportWorkspaceData();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-all text-xs font-semibold text-zinc-300 hover:text-white text-left cursor-pointer"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t('extra.exportBackup')}</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          setActiveTab('settings');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-all text-xs font-semibold text-zinc-300 hover:text-white text-left cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{t('extra.workspaceSettings')}</span>
                      </button>

                      <div className="h-px bg-white/[0.04] my-1.5" />

                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          if (window.confirm(t('extra.clearCacheConfirm'))) {
                            localStorage.clear();
                            window.location.reload();
                          }
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-400 transition-all text-xs font-semibold text-left cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        <span>{t('extra.clearLocalCache')}</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <span className="w-px h-6 bg-white/[0.06] block mx-1" />

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg bg-zinc-900/80 border border-white/[0.04] hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all hover:border-white/[0.08] relative cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                {pendingTasks.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-500 text-[7px] font-extrabold text-white flex items-center justify-center rounded-full shadow-sm shadow-indigo-500/30">
                    {pendingTasks.length > 9 ? '9+' : pendingTasks.length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl p-4 shadow-2xl z-50 border border-white/[0.06]"
                    >
                      <div className="flex items-center justify-between border-b border-white/[0.04] pb-2.5 mb-3">
                        <h4 className="font-bold text-xs text-white">{t('app.notifications')}</h4>
                        <span className="text-[9px] font-bold text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded-md">{pendingTasks.length}</span>
                      </div>
                      <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar">
                        {pendingTasks.map(task => (
                          <div key={task.id} className="p-2.5 rounded-xl bg-zinc-900/60 border border-white/[0.03] hover:bg-zinc-900/80 transition-colors">
                            <span className="font-semibold text-xs text-zinc-200 block">{task.title}</span>
                            <span className="text-[10px] text-zinc-500 mt-1 block">{t('app.deadline')} {task.dueDate}</span>
                          </div>
                        ))}
                        {pendingTasks.length === 0 && (
                          <div className="text-center py-6">
                            <span className="text-xs text-zinc-500">{t('app.allDone')}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* DATABASE STATUS MODAL */}
      <Modal
        isOpen={showDatabaseStatus}
        onClose={() => setShowDatabaseStatus(false)}
        title={t('extra.databaseStatusTitle')}
      >
        <div className="space-y-4 text-xs">
          <p className="text-zinc-400 leading-relaxed">
            {t('extra.databaseStatusDesc')}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-zinc-900/60 border border-white/[0.04] rounded-xl">
              <span className="text-zinc-500 block text-[9px] font-bold uppercase tracking-wider">{t('extra.totalAccounts')}</span>
              <span className="text-xl font-extrabold text-zinc-100 mt-1 block">
                {readJsonArray('crm_accounts', []).length}
              </span>
            </div>
            <div className="p-3 bg-zinc-900/60 border border-white/[0.04] rounded-xl">
              <span className="text-zinc-500 block text-[9px] font-bold uppercase tracking-wider">{t('extra.activeDeals')}</span>
              <span className="text-xl font-extrabold text-zinc-100 mt-1 block">
                {readJsonArray('crm_deals', []).length}
              </span>
            </div>
            <div className="p-3 bg-zinc-900/60 border border-white/[0.04] rounded-xl">
              <span className="text-zinc-500 block text-[9px] font-bold uppercase tracking-wider">{t('extra.totalEmployees')}</span>
              <span className="text-xl font-extrabold text-zinc-100 mt-1 block">
                {readJsonArray('zenith_employees', []).length}
              </span>
            </div>
            <div className="p-3 bg-zinc-900/60 border border-white/[0.04] rounded-xl">
              <span className="text-zinc-500 block text-[9px] font-bold uppercase tracking-wider">{t('extra.stabilityIncidents')}</span>
              <span className="text-xl font-extrabold text-zinc-100 mt-1 block">
                {readJsonArray('zenith_incidents', []).length}
              </span>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setShowDatabaseStatus(false)}
              className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 text-white font-bold rounded-xl border border-white/5 transition cursor-pointer"
            >
              {t('extra.close')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

interface SidebarLinkProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  collapsed: boolean;
  badge?: number;
  onClick: () => void;
}

function SidebarLink({ icon: Icon, label, active, collapsed, badge, onClick }: SidebarLinkProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full relative px-2.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between outline-none cursor-pointer group ${
        active
          ? 'text-white bg-gradient-to-r from-indigo-500/10 to-transparent border border-indigo-500/15 shadow-sm shadow-indigo-500/5'
          : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.02] border border-transparent'
      }`}
    >
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
          active
            ? 'bg-indigo-500/15 text-indigo-400 shadow-sm'
            : 'bg-transparent text-zinc-500 group-hover:text-zinc-300 group-hover:bg-zinc-900/50'
        }`}>
          <Icon className="w-4 h-4" />
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="truncate font-medium"
          >
            {label}
          </motion.span>
        )}
      </div>
      {badge && !collapsed && (
        <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/15 text-indigo-400 font-bold px-1.5 py-0.5 rounded-md min-w-5 text-center">
          {badge}
        </span>
      )}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-full shadow-sm shadow-indigo-500/50" />
      )}
    </button>
  );
}

export default App;