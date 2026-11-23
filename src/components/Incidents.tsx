import { useState, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext';
import { Modal } from './Modal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Lock, AlertTriangle,
  Pencil, Trash2, ArrowUpDown, Clock, Eye,
  Sparkles, RefreshCw
} from 'lucide-react';
import { readJsonArray } from '../lib/storage';

interface IncidentLog {
  timestamp: string;
  user: string;
  text: string;
}

interface Incident {
  id: string; // INC-XXXX
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  reportedBy: string;
  reportedByAvatar?: string;
  period: string; // e.g. "Apr 11 8:25am - Now"
  category: 'Software' | 'Engineering' | 'Hardware' | '3rd party';
  status: 'Active' | 'Resolved';
  resolutionNotes?: string;
  logs: IncidentLog[];
}

const DEFAULT_INCIDENTS: Incident[] = [
  {
    id: 'INC-4382',
    severity: 'Low',
    description: '4 employees unable to log new tickets',
    reportedBy: 'Tiffany',
    period: 'Apr 11, 8:25am - Now',
    category: 'Software',
    status: 'Active',
    resolutionNotes: 'Awaiting support team feedback.',
    logs: [
      { timestamp: 'Apr 11, 8:25am', user: 'System', text: 'Incident detected via ticket submission gateway' },
      { timestamp: 'Apr 11, 9:00am', user: 'Tiffany', text: 'Assigned priority and flagged to support' }
    ]
  },
  {
    id: 'INC-4381',
    severity: 'High',
    description: 'Breaking change to electron login',
    reportedBy: 'Michelle',
    period: 'Apr 8, 9:22am - 4:26pm',
    category: 'Engineering',
    status: 'Resolved',
    resolutionNotes: 'Updated login handler in desktop electron module.',
    logs: [
      { timestamp: 'Apr 8, 9:22am', user: 'System', text: 'Auth server rejected credentials from Electron agent client v2.4.1' },
      { timestamp: 'Apr 8, 11:15am', user: 'Michelle', text: 'Verified OAuth redirect issue' },
      { timestamp: 'Apr 8, 4:26pm', user: 'Michelle', text: 'Merged Hotfix release and validated client authentication flow successfully' }
    ]
  },
  {
    id: 'INC-4380',
    severity: 'Critical',
    description: 'Breaking changes to web login',
    reportedBy: 'Michelle',
    period: 'Apr 2, 3:26pm - Apr 3, 12:41pm',
    category: 'Software',
    status: 'Resolved',
    resolutionNotes: 'Rolled back web application release to production v12.3.0.',
    logs: [
      { timestamp: 'Apr 2, 3:26pm', user: 'System', text: 'Failure rate spiked above 15% on web sign-in API endpoint' },
      { timestamp: 'Apr 2, 4:00pm', user: 'Michelle', text: 'Initiated rollback command to stable state' },
      { timestamp: 'Apr 3, 12:41pm', user: 'System', text: 'Web login rates stabilized. Confirmed resolved.' }
    ]
  },
  {
    id: 'INC-4379',
    severity: 'Low',
    description: 'Server rack 16B temporarily unavailable',
    reportedBy: 'Andy',
    period: 'Mar 15, 9:46am - Mar 17, 12:32am',
    category: 'Hardware',
    status: 'Resolved',
    resolutionNotes: 'Replaced failed power supply controller module.',
    logs: [
      { timestamp: 'Mar 15, 9:46am', user: 'System', text: 'UPS Unit 2 in Rack 16B reported battery voltage failure' },
      { timestamp: 'Mar 17, 12:32am', user: 'Andy', text: 'Replaced UPS power controller module, power restored to servers' }
    ]
  },
  {
    id: 'INC-4378',
    severity: 'Medium',
    description: 'Stripe integration broken from API update',
    reportedBy: 'Andy',
    period: 'Mar 12, 12:25am - 4:19pm',
    category: '3rd party',
    status: 'Resolved',
    resolutionNotes: 'Updated API signature payloads matching Stripe version 2026-05.',
    logs: [
      { timestamp: 'Mar 12, 12:25am', user: 'System', text: 'Stripe gateway returned webhook signature verification error' },
      { timestamp: 'Mar 12, 4:19pm', user: 'Andy', text: 'Updated API keys and validated webhook signature headers' }
    ]
  }
];

export const Incidents = memo(function Incidents() {
  const { t, i18n } = useTranslation();
  const { addToast } = useToast();
  const currentLang = i18n.language || 'pt';

  const translateCategory = (cat: 'Software' | 'Engineering' | 'Hardware' | '3rd party' | string) => {
    switch (cat) {
      case 'Software': return t('extra.incidents.catSoftware');
      case 'Engineering': return t('extra.incidents.catEngineering');
      case 'Hardware': return t('extra.incidents.catHardware');
      case '3rd party': return t('extra.incidents.cat3rdParty');
      default: return cat;
    }
  };

  const translateStatus = (status: 'Active' | 'Resolved') => {
    return status === 'Active' 
      ? t('extra.incidents.statusActiveSingular') 
      : t('extra.incidents.statusResolvedSingular');
  };

  const translateSeverity = (sev: 'Low' | 'Medium' | 'High' | 'Critical') => {
    switch (sev) {
      case 'Low': return t('extra.incidents.lowPill');
      case 'Medium': return t('extra.incidents.mediumPill');
      case 'High': return t('extra.incidents.highPill');
      case 'Critical': return t('extra.incidents.criticalPill');
      default: return sev;
    }
  };

  const translateLogText = (text: string) => {
    if (text.startsWith('Incident registered with status ')) {
      const status = text.replace('Incident registered with status ', '');
      return t('extra.incidents.logRegistered', { status: status === 'Active' ? t('extra.incidents.statusActiveSingular') : t('extra.incidents.statusResolvedSingular'), defaultValue: text });
    }
    if (text === 'Incident marked as Resolved.') {
      return t('extra.incidents.logMarkedResolved', { defaultValue: text });
    }
    if (text.startsWith('Status toggled to ')) {
      const status = text.replace('Status toggled to ', '');
      return t('extra.incidents.logStatusToggled', { status: status === 'Active' ? t('extra.incidents.statusActiveSingular') : t('extra.incidents.statusResolvedSingular'), defaultValue: text });
    }
    const map: Record<string, string> = {
      'Incident detected via ticket submission gateway': 'extra.incidents.logDetectedGateway',
      'Assigned priority and flagged to support': 'extra.incidents.logAssignedPriority',
      'Auth server rejected credentials from Electron agent client v2.4.1': 'extra.incidents.logAuthRejected',
      'Verified OAuth redirect issue': 'extra.incidents.logVerifiedRedirect',
      'Merged Hotfix release and validated client authentication flow successfully': 'extra.incidents.logMergedHotfix',
      'Failure rate spiked above 15% on web sign-in API endpoint': 'extra.incidents.logFailureSpike',
      'Initiated rollback command to stable state': 'extra.incidents.logInitiatedRollback',
      'Web login rates stabilized. Confirmed resolved.': 'extra.incidents.logWebLoginStabilized',
      'UPS Unit 2 in Rack 16B reported battery voltage failure': 'extra.incidents.logUPSFailure',
      'Replaced UPS power controller module, power restored to servers': 'extra.incidents.logUPSReplaced',
      'Stripe gateway returned webhook signature verification error': 'extra.incidents.logStripeError',
      'Updated API keys and validated webhook signature headers': 'extra.incidents.logStripeUpdated',
    };
    const key = map[text];
    return key ? t(key, { defaultValue: text }) : text;
  };

  // Sub-tabs: 'incidents' | 'reports' | 'charges'
  const [subTab, setSubTab] = useState<'incidents' | 'reports' | 'charges'>('incidents');

  // Local storage state
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    // A corrupt stored value would throw during render and take the whole
    // app down, so it is treated as absent.
    const saved = readJsonArray<Incident>('zenith_incidents', DEFAULT_INCIDENTS);
    if (saved.length) return saved;
    localStorage.setItem('zenith_incidents', JSON.stringify(DEFAULT_INCIDENTS));
    return DEFAULT_INCIDENTS;
  });

  const saveIncidents = (updated: Incident[]) => {
    setIncidents(updated);
    localStorage.setItem('zenith_incidents', JSON.stringify(updated));
  };

  // Selection list
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(() => {
    return incidents[0]?.id || '';
  });

  // Search & filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'Software' | 'Engineering' | 'Hardware' | '3rd party'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'Low' | 'Medium' | 'High' | 'Critical'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Resolved'>('ALL');
  
  // Sort states
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form states
  const [formDesc, setFormDesc] = useState('');
  const [formSeverity, setFormSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [formCategory, setFormCategory] = useState<'Software' | 'Engineering' | 'Hardware' | '3rd party'>('Software');
  const [formReporter, setFormReporter] = useState('Razid');
  const [formPeriod, setFormPeriod] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Resolved'>('Active');
  const [formResolution, setFormResolution] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  // Audit Log input
  const [newLogText, setNewLogText] = useState('');

  // Selected incident details object
  const activeIncident = useMemo(() => {
    return incidents.find(inc => inc.id === selectedIncidentId) || incidents[0];
  }, [incidents, selectedIncidentId]);

  // Filters logic
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter(inc => {
        const matchesSearch =
          inc.description.toLowerCase().includes(search.toLowerCase()) ||
          inc.reportedBy.toLowerCase().includes(search.toLowerCase()) ||
          inc.id.toLowerCase().includes(search.toLowerCase());

        const matchesCategory = categoryFilter === 'ALL' || inc.category === categoryFilter;
        const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
        const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;

        return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
      })
      .sort((a, b) => {
        const numA = parseInt(a.id.replace('INC-', ''));
        const numB = parseInt(b.id.replace('INC-', ''));
        return sortOrder === 'desc' ? numB - numA : numA - numB;
      });
  }, [incidents, search, categoryFilter, severityFilter, statusFilter, sortOrder]);

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredIncidents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredIncidents.map(inc => inc.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDesc) return;

    // Generate INC number
    const maxNum = incidents.reduce((max, inc) => {
      const num = parseInt(inc.id.replace('INC-', ''));
      return isNaN(num) ? max : Math.max(max, num);
    }, 4300);
    const nextId = `INC-${maxNum + 1}`;

    const dateLocale = currentLang === 'pt' ? 'pt-BR' : currentLang === 'es' ? 'es-ES' : 'en-US';
    const nowStr = new Date().toLocaleString(dateLocale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const newIncident: Incident = {
      id: nextId,
      severity: formSeverity,
      description: formDesc,
      reportedBy: formReporter,
      period: formPeriod || `${nowStr} - Now`,
      category: formCategory,
      status: formStatus,
      resolutionNotes: formResolution,
      logs: [
        {
          timestamp: nowStr,
          user: formReporter,
          text: `Incident registered with status ${formStatus}`
        }
      ]
    };

    const updated = [newIncident, ...incidents];
    saveIncidents(updated);
    setSelectedIncidentId(nextId);
    addToast(t('extra.incidents.registerSuccess'), 'success');
    resetForm();
    setShowAddModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !formDesc) return;

    const updated = incidents.map(inc => {
      if (inc.id === editId) {
        const isNowResolved = formStatus === 'Resolved' && inc.status === 'Active';
        const newLogs = [...inc.logs];
        
        if (isNowResolved) {
          const dateLocale = currentLang === 'pt' ? 'pt-BR' : currentLang === 'es' ? 'es-ES' : 'en-US';
          const nowStr = new Date().toLocaleString(dateLocale, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          newLogs.push({
            timestamp: nowStr,
            user: formReporter,
            text: 'Incident marked as Resolved.'
          });
        }

        return {
          ...inc,
          severity: formSeverity,
          description: formDesc,
          reportedBy: formReporter,
          period: formPeriod,
          category: formCategory,
          status: formStatus,
          resolutionNotes: formResolution,
          logs: newLogs
        };
      }
      return inc;
    });

    saveIncidents(updated);
    addToast(t('extra.incidents.editSuccess'), 'success');
    resetForm();
    setShowEditModal(false);
  };

  const openEdit = (inc: Incident) => {
    setEditId(inc.id);
    setFormDesc(inc.description);
    setFormSeverity(inc.severity);
    setFormCategory(inc.category);
    setFormReporter(inc.reportedBy);
    setFormPeriod(inc.period);
    setFormStatus(inc.status);
    setFormResolution(inc.resolutionNotes || '');
    setShowEditModal(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm(t('extra.incidents.deleteConfirm'))) return;
    const updated = incidents.filter(inc => inc.id !== id);
    saveIncidents(updated);
    setSelectedIds(prev => prev.filter(x => x !== id));
    if (selectedIncidentId === id && updated.length > 0) {
      setSelectedIncidentId(updated[0].id);
    }
    addToast(t('extra.incidents.deleteSuccess'), 'info');
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogText.trim() || !activeIncident) return;

    const dateLocale = currentLang === 'pt' ? 'pt-BR' : currentLang === 'es' ? 'es-ES' : 'en-US';
    const nowStr = new Date().toLocaleString(dateLocale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const newLog: IncidentLog = {
      timestamp: nowStr,
      user: 'Razid',
      text: newLogText.trim()
    };

    const updated = incidents.map(inc => {
      if (inc.id === activeIncident.id) {
        return {
          ...inc,
          logs: [...inc.logs, newLog]
        };
      }
      return inc;
    });

    saveIncidents(updated);
    setNewLogText('');
    addToast(t('extra.incidents.commentSuccess'), 'success');
  };

  const toggleIncidentStatus = (inc: Incident) => {
    const nextStatus: 'Active' | 'Resolved' = inc.status === 'Active' ? 'Resolved' : 'Active';
    const dateLocale = currentLang === 'pt' ? 'pt-BR' : currentLang === 'es' ? 'es-ES' : 'en-US';
    const nowStr = new Date().toLocaleString(dateLocale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const newLog: IncidentLog = {
      timestamp: nowStr,
      user: 'Razid',
      text: `Status toggled to ${nextStatus}`
    };

    const updated = incidents.map(item => {
      if (item.id === inc.id) {
        return {
          ...item,
          status: nextStatus,
          logs: [...item.logs, newLog]
        };
      }
      return item;
    });

    saveIncidents(updated);
    addToast(
      t('extra.incidents.statusToggleSuccess') + (nextStatus === 'Resolved' ? t('extra.incidents.statusResolvedSingular') : t('extra.incidents.statusActiveSingular')), 
      'success'
    );
  };

  const resetForm = () => {
    setEditId(null);
    setFormDesc('');
    setFormSeverity('Medium');
    setFormCategory('Software');
    setFormReporter('Razid');
    setFormPeriod('');
    setFormStatus('Active');
    setFormResolution('');
  };

  // Severity style helper
  const getSeverityPill = (severity: 'Low' | 'Medium' | 'High' | 'Critical') => {
    switch (severity) {
      case 'Low':
        return (
          <span className="flex items-center space-x-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-md font-bold text-[10px] w-fit">
            <span className="flex space-x-0.5 items-end h-2 w-3">
              <span className="w-0.5 h-1.5 bg-yellow-400 rounded-sm" />
              <span className="w-0.5 h-0.5 bg-zinc-700 rounded-sm" />
              <span className="w-0.5 h-0.5 bg-zinc-700 rounded-sm" />
            </span>
            <span>{t('extra.incidents.lowPill')}</span>
          </span>
        );
      case 'Medium':
        return (
          <span className="flex items-center space-x-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded-md font-bold text-[10px] w-fit">
            <span className="flex space-x-0.5 items-end h-2 w-3">
              <span className="w-0.5 h-1.5 bg-orange-400 rounded-sm" />
              <span className="w-0.5 h-2.5 bg-orange-400 rounded-sm" />
              <span className="w-0.5 h-0.5 bg-zinc-700 rounded-sm" />
            </span>
            <span>{t('extra.incidents.mediumPill')}</span>
          </span>
        );
      case 'High':
        return (
          <span className="flex items-center space-x-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded-md font-bold text-[10px] w-fit">
            <span className="flex space-x-0.5 items-end h-2 w-3">
              <span className="w-0.5 h-1.5 bg-rose-400 rounded-sm" />
              <span className="w-0.5 h-2.5 bg-rose-400 rounded-sm" />
              <span className="w-0.5 h-3.5 bg-rose-400 rounded-sm" />
            </span>
            <span>{t('extra.incidents.highPill')}</span>
          </span>
        );
      case 'Critical':
        return (
          <span className="flex items-center space-x-1 bg-red-500/15 border border-red-500/30 text-red-400 px-2 py-0.5 rounded-md font-extrabold text-[10px] w-fit shadow-sm shadow-red-500/10 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
            <span>{t('extra.incidents.criticalPill')}</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Software': return 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400';
      case 'Engineering': return 'bg-sky-500/10 border border-sky-500/20 text-sky-400';
      case 'Hardware': return 'bg-zinc-800 border border-white/5 text-zinc-400';
      case '3rd party': return 'bg-amber-500/10 border border-amber-500/20 text-amber-400';
      default: return 'bg-zinc-900 border border-white/5 text-zinc-500';
    }
  };

  // Metrics for reports subTab
  const severityMetrics = useMemo(() => {
    const counts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    incidents.forEach(inc => {
      counts[inc.severity] += 1;
    });
    return counts;
  }, [incidents]);

  const categoryMetrics = useMemo(() => {
    const counts = { Software: 0, Engineering: 0, Hardware: 0, '3rd party': 0 };
    incidents.forEach(inc => {
      counts[inc.category] += 1;
    });
    return counts;
  }, [incidents]);

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      {/* Breadcrumb Header */}
      <div className="shrink-0 space-y-1">
        <div className="flex items-center space-x-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
          <span>{t('extra.incidents.breadHome')}</span>
          <span>&gt;</span>
          <span className="text-zinc-600">...</span>
          <span>&gt;</span>
          <span className="text-indigo-400">incident-tracking-system</span>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
          <div className="flex items-center gap-1 text-[9px] text-zinc-500 bg-zinc-900 border border-white/5 px-2 py-0.5 rounded-md">
            <Lock className="w-2.5 h-2.5 text-zinc-600" />
            <span>{t('extra.incidents.privateDatabase')}</span>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pt-1">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>{t('extra.incidents.title')}</span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/15 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> {t('extra.incidents.stabilityMonitor')}
              </span>
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              {t('extra.incidents.monitorDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tabs + Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.04] pb-2 gap-4 shrink-0">
        <div className="flex items-center space-x-1 bg-zinc-900/50 p-1 rounded-xl border border-white/[0.03]">
          {(['incidents', 'reports', 'charges'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSubTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                subTab === tab 
                  ? 'bg-zinc-800 text-white shadow-sm border border-white/[0.04]' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab === 'incidents' && t('extra.incidents.tabIncidents')}
              {tab === 'reports' && t('extra.incidents.tabReports')}
              {tab === 'charges' && t('extra.incidents.tabCharges')}
            </button>
          ))}
          <button 
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition border border-white/[0.04] cursor-pointer"
            title={t('extra.incidents.addTitle')}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {subTab === 'incidents' && (
          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Search */}
            <div className="relative group">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text" 
                placeholder={t('extra.incidents.searchPlaceholder')} 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="bg-zinc-900/80 border border-white/5 focus:outline-none focus:border-indigo-500 rounded-xl py-1.5 pl-9 pr-4 text-xs w-44 sm:w-52 text-zinc-200 focus:ring-2 focus:ring-indigo-500/10" 
              />
            </div>

            {/* Category selection */}
            <select 
              value={categoryFilter} 
              onChange={e => setCategoryFilter(e.target.value as 'ALL' | 'Software' | 'Engineering' | 'Hardware' | '3rd party')}
              className="bg-zinc-900 border border-white/5 rounded-xl p-1.5 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 h-8"
            >
              <option value="ALL">{t('extra.incidents.allCategories')}</option>
              <option value="Software">Software</option>
              <option value="Engineering">Engineering</option>
              <option value="Hardware">Hardware</option>
              <option value="3rd party">3rd party</option>
            </select>

            {/* Severity selection */}
            <select 
              value={severityFilter} 
              onChange={e => setSeverityFilter(e.target.value as 'ALL' | 'Low' | 'Medium' | 'High' | 'Critical')}
              className="bg-zinc-900 border border-white/5 rounded-xl p-1.5 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 h-8"
            >
              <option value="ALL">{t('extra.incidents.allSeverities')}</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>

            {/* Status filters */}
            <div className="flex border border-white/5 rounded-xl bg-zinc-900 p-0.5 h-8">
              {(['ALL', 'Active', 'Resolved'] as const).map(statusOpt => (
                <button
                  key={statusOpt}
                  onClick={() => setStatusFilter(statusOpt)}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    statusFilter === statusOpt 
                      ? 'bg-zinc-800 text-indigo-400 border border-white/[0.03]' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {statusOpt === 'ALL' && t('extra.incidents.allStatus')}
                  {statusOpt === 'Active' && t('extra.incidents.activeStatus')}
                  {statusOpt === 'Resolved' && t('extra.incidents.resolvedStatus')}
                </button>
              ))}
            </div>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="h-8 w-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
              title="Toggle Sort ID Order"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Data Display (Left) + Detail & logs (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* Left Column content */}
        <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={subTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 min-h-0 overflow-y-auto custom-scrollbar"
            >
              {subTab === 'incidents' && (
                <div className="glass-panel border border-white/[0.04] rounded-2xl overflow-hidden flex flex-col h-full min-h-0 bg-zinc-900/30">
                  <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.04] bg-zinc-950/20 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-4 w-12 text-center">
                            <input 
                              type="checkbox" 
                              checked={filteredIncidents.length > 0 && selectedIds.length === filteredIncidents.length}
                              onChange={handleToggleSelectAll}
                              className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-0 cursor-pointer"
                            />
                          </th>
                          <th className="py-3 px-4">{t('extra.incidents.colCode')}</th>
                          <th className="py-3 px-4">{t('extra.incidents.colSeverity')}</th>
                          <th className="py-3 px-4">{t('extra.incidents.colIncident')}</th>
                          <th className="py-3 px-4">{t('extra.incidents.colReportedBy')}</th>
                          <th className="py-3 px-4">{t('extra.incidents.colPeriod')}</th>
                          <th className="py-3 px-4">{t('extra.incidents.colCategory')}</th>
                          <th className="py-3 px-4 text-center w-20">{t('extra.incidents.colActions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredIncidents.map(inc => {
                          const isSelectedRow = selectedIds.includes(inc.id);
                          const isActiveRow = selectedIncidentId === inc.id;
                          return (
                            <tr 
                              key={inc.id}
                              onClick={() => setSelectedIncidentId(inc.id)}
                              className={`border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors cursor-pointer ${
                                isSelectedRow ? 'bg-indigo-500/[0.02]' : ''
                              } ${isActiveRow ? 'bg-white/[0.04] border-l-2 border-l-indigo-500' : ''}`}
                            >
                              <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                                <input 
                                  type="checkbox" 
                                  checked={isSelectedRow}
                                  onChange={() => handleToggleSelectRow(inc.id)}
                                  className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-0 cursor-pointer"
                                />
                              </td>
                              <td className="py-3.5 px-4 font-semibold text-zinc-100">
                                <div className="flex items-center space-x-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                  <span className="font-mono text-zinc-200">{inc.id}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                {getSeverityPill(inc.severity)}
                              </td>
                              <td className="py-3.5 px-4 text-zinc-300 font-semibold truncate max-w-[200px]">
                                {inc.description}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center space-x-2">
                                  <div className="w-5.5 h-5.5 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center font-bold text-[8px] text-zinc-400 uppercase">
                                    {inc.reportedBy.slice(0, 2)}
                                  </div>
                                  <span className="text-zinc-400 font-medium">{inc.reportedBy}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-zinc-400 font-medium text-[10px] truncate max-w-[120px]">
                                {inc.period}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] w-fit block uppercase tracking-wider ${getCategoryColor(inc.category)}`}>
                                  {translateCategory(inc.category)}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-center space-x-1">
                                  <button 
                                    onClick={() => openEdit(inc)}
                                    className="p-1 hover:bg-indigo-500/15 border border-transparent hover:border-indigo-500/25 rounded-md text-zinc-500 hover:text-indigo-400 transition cursor-pointer"
                                    title={t('extra.employees.editTitle')}
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(inc.id)}
                                    className="p-1 hover:bg-red-500/15 border border-transparent hover:border-red-500/25 rounded-md text-zinc-500 hover:text-red-400 transition cursor-pointer"
                                    title={t('extra.employees.deleteTitle')}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredIncidents.length === 0 && (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-zinc-500">
                              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-25 text-zinc-400" />
                              <p className="font-semibold text-xs">{t('extra.incidents.noIncidents')}</p>
                              <p className="text-[10px] text-zinc-600 mt-1">{t('extra.incidents.noIncidentsDesc')}</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {subTab === 'reports' && (
                <div className="space-y-6">
                  {/* Cards Dashboard */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="glass-panel p-4 bg-zinc-900/30 border border-white/[0.04] rounded-2xl">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">{t('extra.incidents.totalIncidents')}</span>
                      <span className="text-3xl font-extrabold text-white mt-1 block">{incidents.length}</span>
                    </div>
                    <div className="glass-panel p-4 bg-zinc-900/30 border border-white/[0.04] rounded-2xl">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">{t('extra.incidents.activeSpikes')}</span>
                      <span className="text-3xl font-extrabold text-amber-400 mt-1 block">
                        {incidents.filter(i => i.status === 'Active').length}
                      </span>
                    </div>
                    <div className="glass-panel p-4 bg-zinc-900/30 border border-white/[0.04] rounded-2xl">
                      <span className="text-[9px] font-bold text-red-500/80 uppercase tracking-wider block font-extrabold">{t('extra.incidents.criticalSeverities')}</span>
                      <span className="text-3xl font-extrabold text-red-400 mt-1 block">{severityMetrics.Critical}</span>
                    </div>
                    <div className="glass-panel p-4 bg-zinc-900/30 border border-white/[0.04] rounded-2xl">
                      <span className="text-[9px] font-bold text-emerald-500/80 uppercase tracking-wider block font-extrabold">{t('extra.incidents.resolvedRate')}</span>
                      <span className="text-3xl font-extrabold text-emerald-400 mt-1 block">
                        {incidents.length > 0
                          ? `${Math.round((incidents.filter(i => i.status === 'Resolved').length / incidents.length) * 100)}%`
                          : '0%'}
                      </span>
                    </div>
                  </div>

                  {/* Summary lists */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-panel p-5 bg-zinc-900/30 border border-white/[0.04] rounded-2xl">
                      <h3 className="font-extrabold text-xs text-white uppercase tracking-widest mb-4">{t('extra.incidents.severityBreakdown')}</h3>
                      <div className="space-y-3">
                        {Object.entries(severityMetrics).map(([sev, count]) => (
                          <div key={sev} className="flex items-center justify-between text-xs">
                            <span className="text-zinc-400 font-semibold">{translateSeverity(sev as 'Low' | 'Medium' | 'High' | 'Critical')}</span>
                            <div className="flex-1 mx-4 h-1.5 bg-zinc-800 rounded-full overflow-hidden max-w-[180px]">
                              <div 
                                className={`h-full rounded-full ${
                                  sev === 'Critical' ? 'bg-red-500' :
                                  sev === 'High' ? 'bg-rose-500' :
                                  sev === 'Medium' ? 'bg-orange-400' : 'bg-yellow-400'
                                }`} 
                                style={{ width: `${incidents.length > 0 ? (count / incidents.length) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-zinc-200">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass-panel p-5 bg-zinc-900/30 border border-white/[0.04] rounded-2xl">
                      <h3 className="font-extrabold text-xs text-white uppercase tracking-widest mb-4">{t('extra.incidents.categoryBreakdown')}</h3>
                      <div className="space-y-3">
                        {Object.entries(categoryMetrics).map(([cat, count]) => (
                          <div key={cat} className="flex items-center justify-between text-xs">
                            <span className="text-zinc-400 font-semibold">{translateCategory(cat)}</span>
                            <div className="flex-1 mx-4 h-1.5 bg-zinc-800 rounded-full overflow-hidden max-w-[180px]">
                              <div 
                                className={`h-full rounded-full ${
                                  cat === 'Software' ? 'bg-emerald-400' :
                                  cat === 'Engineering' ? 'bg-sky-400' :
                                  cat === 'Hardware' ? 'bg-zinc-400' : 'bg-amber-400'
                                }`} 
                                style={{ width: `${incidents.length > 0 ? (count / incidents.length) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-zinc-200">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {subTab === 'charges' && (
                <div className="glass-panel p-6 bg-zinc-900/30 border border-white/[0.04] rounded-2xl text-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-3">
                    <div>
                      <h3 className="font-bold text-sm text-zinc-100">{t('extra.incidents.summaryTitle')}</h3>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{t('extra.incidents.summaryDesc')}</p>
                    </div>
                    <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-md">
                      {t('extra.incidents.pendingSlaReviews')}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div>
                      <span className="text-zinc-500 block">{t('extra.incidents.activeClaims')}</span>
                      <span className="text-lg font-bold text-zinc-200 mt-0.5 block">$ 1,840.00</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">{t('extra.incidents.estimatedCredits')}</span>
                      <span className="text-lg font-bold text-red-400 mt-0.5 block">$ 430.00</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">{t('extra.incidents.stabilityRebates')}</span>
                      <span className="text-lg font-bold text-emerald-400 mt-0.5 block">$ 0.00</span>
                    </div>
                  </div>

                  <p className="text-zinc-400 leading-relaxed text-[11px] pt-2 border-t border-white/[0.02]">
                    {t('extra.incidents.chargesNotice')}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Column - Resolution details & Activity log */}
        <div className="glass-panel border border-white/[0.04] rounded-2xl bg-zinc-900/20 p-5 flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar">
          {activeIncident ? (
            <div className="flex flex-col h-full space-y-4">
              <div className="shrink-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    activeIncident.status === 'Active' 
                      ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' 
                      : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  }`}>
                    {translateStatus(activeIncident.status)}
                  </span>
                  
                  <button 
                    onClick={() => toggleIncidentStatus(activeIncident)}
                    className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-300 transition cursor-pointer flex items-center gap-1 text-[10px] font-bold border border-white/5 px-2 py-0.5"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    {t('extra.incidents.toggleStatus')}
                  </button>
                </div>
                <h2 className="text-lg font-extrabold text-white pt-1 flex items-center gap-2">
                  <span className="font-mono text-zinc-500">{activeIncident.id}:</span>
                  <span className="truncate">{activeIncident.description}</span>
                </h2>
              </div>

              {/* Category & Severity stats box */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-900/50 border border-white/[0.03] rounded-xl text-xs shrink-0">
                <div>
                  <span className="text-zinc-500 block text-[9px] font-bold uppercase tracking-wider">{t('extra.incidents.severityLabel')}</span>
                  <div className="mt-1">{getSeverityPill(activeIncident.severity)}</div>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[9px] font-bold uppercase tracking-wider">{t('extra.incidents.categoryLabel')}</span>
                  <span className={`mt-1.5 px-2 py-0.5 rounded-full font-bold text-[9px] w-fit block uppercase tracking-wider ${getCategoryColor(activeIncident.category)}`}>
                    {translateCategory(activeIncident.category)}
                  </span>
                </div>
              </div>

              {/* Resolution details block */}
              <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/15 space-y-1.5 shrink-0 text-xs">
                <div className="flex items-center space-x-1.5 text-indigo-400 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t('extra.incidents.timelineNotes')}</span>
                </div>
                <p className="text-zinc-400 leading-normal font-medium text-[11px]">
                  {activeIncident.resolutionNotes || t('extra.incidents.noResolutionNotes')}
                </p>
              </div>

              {/* Timeline list */}
              <div className="flex-1 relative pr-1 overflow-y-auto custom-scrollbar pl-2 space-y-4 min-h-[120px]">
                <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-zinc-800 pointer-events-none" />
                
                {activeIncident.logs.map((log, index) => (
                  <div key={index} className="relative pl-6 space-y-1.5">
                    <div className={`absolute left-[3px] top-1.5 w-2 h-2 rounded-full ${
                      index === activeIncident.logs.length - 1 ? 'bg-indigo-400 ring-4 ring-indigo-500/15' : 'bg-zinc-600'
                    }`} />
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-zinc-300">{log.user}</span>
                        <span className="text-[9px] text-zinc-500 font-semibold">{log.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-normal pt-0.5">{translateLogText(log.text)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Log message input form */}
              <form onSubmit={handleAddLog} className="shrink-0 border-t border-white/[0.04] pt-3 mt-1 flex gap-2">
                <input 
                  type="text" 
                  value={newLogText}
                  onChange={e => setNewLogText(e.target.value)}
                  placeholder={t('extra.incidents.addCommentPlaceholder')}
                  className="flex-1 bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                />
                <button 
                  type="submit" 
                  className="px-3 bg-zinc-800 hover:bg-zinc-700 border border-white/5 hover:border-white/10 rounded-xl text-zinc-200 font-bold text-xs transition cursor-pointer"
                >
                  Log
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 py-12">
              <Eye className="w-8 h-8 opacity-25 mb-2" />
              <span className="text-xs font-bold">{t('extra.incidents.selectAuditDetail')}</span>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD INCIDENT */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={t('extra.incidents.addTitle')}>
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs text-left">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.incidents.descLabel')}</label>
            <input 
              type="text" 
              required 
              value={formDesc} 
              onChange={e => setFormDesc(e.target.value)} 
              placeholder={t('extra.incidents.descPlaceholder')} 
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-100" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.incidents.severityFormLabel')}</label>
              <select 
                value={formSeverity} 
                onChange={e => setFormSeverity(e.target.value as 'Low' | 'Medium' | 'High' | 'Critical')}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-300"
              >
                <option value="Low">{t('extra.incidents.lowPill')}</option>
                <option value="Medium">{t('extra.incidents.mediumPill')}</option>
                <option value="High">{t('extra.incidents.highPill')}</option>
                <option value="Critical">{t('extra.incidents.criticalPill')}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.incidents.categoryFormLabel')}</label>
              <select 
                value={formCategory} 
                onChange={e => setFormCategory(e.target.value as 'Software' | 'Engineering' | 'Hardware' | '3rd party')}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-300"
              >
                <option value="Software">Software</option>
                <option value="Engineering">Engineering</option>
                <option value="Hardware">Hardware</option>
                <option value="3rd party">3rd party</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.incidents.reporterLabel')}</label>
              <input 
                type="text" 
                required 
                value={formReporter} 
                onChange={e => setFormReporter(e.target.value)} 
                placeholder="Ex: Tiffany" 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-100" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.incidents.periodLabel')}</label>
              <input 
                type="text" 
                value={formPeriod} 
                onChange={e => setFormPeriod(e.target.value)} 
                placeholder={t('extra.incidents.periodPlaceholder')} 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-100" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('financial.status')}</label>
              <select 
                value={formStatus} 
                onChange={e => setFormStatus(e.target.value as 'Active' | 'Resolved')}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-300"
              >
                <option value="Active">{t('extra.incidents.activeStatus')}</option>
                <option value="Resolved">{t('extra.incidents.resolvedStatus')}</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.incidents.resolutionNotesLabel')}</label>
            <textarea 
              rows={2} 
              value={formResolution} 
              onChange={e => setFormResolution(e.target.value)} 
              placeholder={t('extra.incidents.resolutionPlaceholder')}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-100 resize-none" 
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white border border-white/5 bg-zinc-900/50 rounded-xl hover:bg-zinc-800 transition cursor-pointer">{t('extra.incidents.cancelBtn')}</button>
            <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">{t('extra.incidents.saveBtn')}</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT INCIDENT */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditId(null); }} title={t('extra.incidents.editTitle')}>
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs text-left">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.incidents.descLabel')}</label>
            <input 
              type="text" 
              required 
              value={formDesc} 
              onChange={e => setFormDesc(e.target.value)} 
              placeholder={t('extra.incidents.descPlaceholder')} 
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-100" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.incidents.severityFormLabel')}</label>
              <select 
                value={formSeverity} 
                onChange={e => setFormSeverity(e.target.value as 'Low' | 'Medium' | 'High' | 'Critical')}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-300"
              >
                <option value="Low">{t('extra.incidents.lowPill')}</option>
                <option value="Medium">{t('extra.incidents.mediumPill')}</option>
                <option value="High">{t('extra.incidents.highPill')}</option>
                <option value="Critical">{t('extra.incidents.criticalPill')}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.incidents.categoryFormLabel')}</label>
              <select 
                value={formCategory} 
                onChange={e => setFormCategory(e.target.value as 'Software' | 'Engineering' | 'Hardware' | '3rd party')}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-300"
              >
                <option value="Software">Software</option>
                <option value="Engineering">Engineering</option>
                <option value="Hardware">Hardware</option>
                <option value="3rd party">3rd party</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.incidents.reporterLabel')}</label>
              <input 
                type="text" 
                required 
                value={formReporter} 
                onChange={e => setFormReporter(e.target.value)} 
                placeholder="Ex: Tiffany" 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-100" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.incidents.periodLabel')}</label>
              <input 
                type="text" 
                value={formPeriod} 
                onChange={e => setFormPeriod(e.target.value)} 
                placeholder={t('extra.incidents.periodPlaceholder')} 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-100" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('financial.status')}</label>
              <select 
                value={formStatus} 
                onChange={e => setFormStatus(e.target.value as 'Active' | 'Resolved')}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-300"
              >
                <option value="Active">{t('extra.incidents.activeStatus')}</option>
                <option value="Resolved">{t('extra.incidents.resolvedStatus')}</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.incidents.resolutionNotesLabel')}</label>
            <textarea 
              rows={2} 
              value={formResolution} 
              onChange={e => setFormResolution(e.target.value)} 
              placeholder={t('extra.incidents.resolutionPlaceholder')}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-100 resize-none" 
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => { setShowEditModal(false); setEditId(null); }} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white border border-white/5 bg-zinc-900/50 rounded-xl hover:bg-zinc-800 transition cursor-pointer">{t('extra.incidents.cancelBtn')}</button>
            <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">{t('extra.incidents.saveBtn')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
});
