import { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCRM } from '../hooks/useCRM';
import { useToast } from '../context/ToastContext';
import { Modal } from './Modal';
import { 
  Search, Plus, Building, Mail, Phone, MapPin, 
  Trash2, Pencil, Calendar, Users, MessageSquare, Filter, ArrowUpDown, DollarSign, Briefcase
} from 'lucide-react';

export const Customers = memo(function Customers() {
  const { t, i18n } = useTranslation();
  const { accounts, deleteAccount, addAccount, updateAccount, meetings, addMeeting, deleteMeeting } = useCRM();
  const { addToast } = useToast();
  
  // Helpers for size and status translation
  const translateSize = (sizeVal?: string) => {
    if (!sizeVal) return '';
    if (sizeVal === 'Pequeno') return t('extra.customers.sizeSmall');
    if (sizeVal === 'Médio') return t('extra.customers.sizeMedium');
    if (sizeVal === 'Grande') return t('extra.customers.sizeLarge');
    return sizeVal; // Enterprise
  };

  const translateStatus = (statusVal?: string) => {
    const s = statusVal || 'Lead';
    if (s === 'Cliente Ativo' || s === 'Active Customer') return t('extra.customers.statusActiveCustomer');
    if (s === 'Prospect') return 'Prospect';
    if (s === 'Parceiro' || s === 'Partner') return t('extra.customers.statusPartner');
    if (s === 'Inativo' || s === 'Inactive') return t('extra.customers.statusInactive');
    return 'Lead';
  };

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('ALL');
  const [sizeFilter, setSizeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NAME_ASC');
  
  const [selected, setSelected] = useState<string | null>(null);
  
  // Modals States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  
  // Account Form States
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [size, setSize] = useState('Médio');
  const [revenue, setRevenue] = useState('');
  const [status, setStatus] = useState('Lead');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  // Meeting Form States
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [meetingAttendees, setMeetingAttendees] = useState('');
  const [meetingSummary, setMeetingSummary] = useState('');

  // Extract unique industries for filter dropdown
  const industries = useMemo(() => {
    const list = accounts.map(a => a.industry).filter(Boolean);
    return ['ALL', ...Array.from(new Set(list))];
  }, [accounts]);

  // Filter & Sort Logic
  const filtered = useMemo(() => {
    return accounts
      .filter(a => {
        const matchesSearch = 
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.industry.toLowerCase().includes(search.toLowerCase()) ||
          (a.location && a.location.toLowerCase().includes(search.toLowerCase()));
          
        const matchesIndustry = industryFilter === 'ALL' || a.industry === industryFilter;
        const matchesSize = sizeFilter === 'ALL' || a.size === sizeFilter;
        const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
        
        return matchesSearch && matchesIndustry && matchesSize && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
        if (sortBy === 'NAME_DESC') return b.name.localeCompare(a.name);
        if (sortBy === 'NEWEST') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return 0;
      });
  }, [accounts, search, industryFilter, sizeFilter, statusFilter, sortBy]);

  const current = accounts.find(a => a.id === selected) || filtered[0] || null;

  // Selected Account Meetings
  const currentMeetings = useMemo(() => {
    if (!current) return [];
    return meetings
      .filter(m => m.accountId === current.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [meetings, current]);

  const openEdit = (id: string) => {
    const a = accounts.find(acc => acc.id === id);
    if (!a) return;
    setEditId(a.id);
    setName(a.name);
    setIndustry(a.industry);
    setWebsite(a.website);
    setEmail(a.email || '');
    setPhone(a.phone || '');
    setLocation(a.location || '');
    setSize(a.size || 'Médio');
    setRevenue(a.revenue || '');
    setStatus(a.status || 'Lead');
    setDescription(a.description || '');
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !name || !industry || !website) return;
    updateAccount(editId, { 
      name, industry, website, 
      email: email || undefined, 
      phone: phone || undefined, 
      location: location || undefined,
      size,
      revenue,
      status,
      description
    });
    addToast(t('extra.customers.saveSuccess'), 'success');
    resetForm();
    setShowEditModal(false);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !industry || !website) return;
    addAccount({ 
      name, industry, website, 
      email: email || undefined, 
      phone: phone || undefined, 
      location: location || undefined,
      size,
      revenue,
      status,
      description
    });
    addToast(t('extra.customers.registerSuccess'), 'success');
    resetForm();
    setShowAddModal(false);
  };

  const handleAddMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!current || !meetingTitle || !meetingDate || !meetingSummary) return;
    addMeeting({
      accountId: current.id,
      title: meetingTitle,
      date: meetingDate,
      summary: meetingSummary,
      attendees: meetingAttendees || t('extra.customers.nobodySpecified')
    });
    addToast(t('extra.customers.meetingRecorded'), 'success');
    setMeetingTitle('');
    setMeetingSummary('');
    setMeetingAttendees('');
    setShowMeetingModal(false);
  };

  const resetForm = () => {
    setEditId(null);
    setName('');
    setIndustry('');
    setWebsite('');
    setEmail('');
    setPhone('');
    setLocation('');
    setSize('Médio');
    setRevenue('');
    setStatus('Lead');
    setDescription('');
  };

  const getStatusBadgeStyle = (statusVal?: string) => {
    const s = statusVal || 'Lead';
    if (s === 'Cliente Ativo' || s === 'Active Customer') return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    if (s === 'Prospect') return 'bg-sky-500/10 border-sky-500/20 text-sky-400';
    if (s === 'Parceiro' || s === 'Partner') return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
    if (s === 'Inativo' || s === 'Inactive') return 'bg-zinc-800 border-zinc-700 text-zinc-500';
    return 'bg-amber-500/10 border-amber-500/20 text-amber-400'; // Lead
  };

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      {/* Upper Navigation Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>{t('extra.customers.titleHub')}</span>
            <span className="text-[10px] font-bold text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/15 px-2 py-0.5 rounded-full uppercase tracking-wider">Apex</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {t('extra.customers.desc')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Search */}
          <div className="relative group">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3 group-focus-within:text-fuchsia-400 transition-colors" />
            <input type="text" placeholder={t('customers.search')} value={search} onChange={e => setSearch(e.target.value)}
              className="glass-panel focus:outline-none focus:border-fuchsia-500 rounded-xl py-2.5 pl-9 pr-4 text-xs w-48 sm:w-56 text-zinc-200 transition-all focus:ring-2 focus:ring-fuchsia-500/20 border border-white/[0.04]" />
          </div>

          {/* Add Company Trigger Button */}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="flex items-center space-x-2 bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-indigo-500 hover:from-fuchsia-500 hover:to-indigo-400 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>{t('customers.add')}</span>
          </motion.button>
        </div>
      </div>

      {/* Advanced Filter Controls Toolbar */}
      <div className="glass-panel border border-white/[0.04] p-3 rounded-2xl flex flex-wrap items-center gap-4 shrink-0 text-xs text-zinc-400">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <span className="font-bold uppercase tracking-wider text-[10px] text-zinc-500">{t('extra.customers.filtersLabel')}</span>
        </div>

        {/* Industry filter */}
        <div className="flex items-center space-x-2">
          <span>{t('extra.customers.industryLabel')}</span>
          <select value={industryFilter} onChange={e => setIndustryFilter(e.target.value)}
            className="bg-zinc-900 border border-white/5 rounded-lg p-1.5 text-zinc-300 focus:outline-none focus:border-indigo-500">
            <option value="ALL">{t('extra.customers.allIndustries')}</option>
            {industries.filter(ind => ind !== 'ALL').map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        {/* Company Size filter */}
        <div className="flex items-center space-x-2">
          <span>{t('extra.customers.sizeLabel')}</span>
          <select value={sizeFilter} onChange={e => setSizeFilter(e.target.value)}
            className="bg-zinc-900 border border-white/5 rounded-lg p-1.5 text-zinc-300 focus:outline-none focus:border-indigo-500">
            <option value="ALL">{t('extra.customers.allSizes')}</option>
            <option value="Pequeno">{t('extra.customers.sizeSmall')}</option>
            <option value="Médio">{t('extra.customers.sizeMedium')}</option>
            <option value="Grande">{t('extra.customers.sizeLarge')}</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>

        {/* Status filter */}
        <div className="flex items-center space-x-2">
          <span>Status:</span>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-zinc-900 border border-white/5 rounded-lg p-1.5 text-zinc-300 focus:outline-none focus:border-indigo-500">
            <option value="ALL">{t('extra.customers.allStatuses')}</option>
            <option value="Lead">Lead</option>
            <option value="Prospect">Prospect</option>
            <option value="Cliente Ativo">{t('extra.customers.statusActiveCustomer')}</option>
            <option value="Parceiro">{t('extra.customers.statusPartner')}</option>
            <option value="Inativo">{t('extra.customers.statusInactive')}</option>
          </select>
        </div>

        {/* Sort by dropdown */}
        <div className="flex items-center space-x-2 ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
          <span>{t('extra.customers.sortLabel')}</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="bg-zinc-900 border border-white/5 rounded-lg p-1.5 text-zinc-300 focus:outline-none focus:border-indigo-500">
            <option value="NAME_ASC">{t('extra.customers.sortNameAsc')}</option>
            <option value="NAME_DESC">{t('extra.customers.sortNameDesc')}</option>
            <option value="NEWEST">{t('extra.customers.sortNewest')}</option>
          </select>
        </div>
      </div>

      {/* Main Double Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Left Side: Companies List */}
        <div className="glass-card-accent rounded-2xl p-4 flex flex-col space-y-3 h-full overflow-y-auto custom-scrollbar card-highlight border border-white/[0.04]">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 block">
            {t('customers.listTitle')} <span className="text-zinc-600 font-normal">({filtered.length})</span>
          </span>
          <div className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar pr-1">
            {filtered.map(a => {
              const isSelected = current?.id === a.id;
              return (
                <motion.div key={a.id} whileHover={{ scale: 1.01 }}
                  onClick={() => setSelected(a.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected 
                      ? 'border-fuchsia-500/40 bg-fuchsia-500/[0.05] shadow-lg shadow-fuchsia-500/[0.02]' 
                      : 'border-white/[0.04] bg-zinc-900/30 hover:bg-zinc-800/40 hover:border-fuchsia-500/20'
                  }`}>
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                      isSelected ? 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/20' : 'bg-zinc-800 text-zinc-400 border-white/5'
                    }`}>
                      <Building className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-zinc-200 truncate">{a.name}</h4>
                      <p className="text-xs text-zinc-500 truncate flex items-center gap-1">
                        <span>{a.industry}</span>
                        {a.size && <span className="text-[9px] text-zinc-600 bg-zinc-950/60 px-1.5 py-0.2 rounded border border-white/5 font-semibold">{translateSize(a.size)}</span>}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${getStatusBadgeStyle(a.status)}`}>
                    {translateStatus(a.status)}
                  </span>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-xs text-zinc-500">
                <Building className="w-8 h-8 mx-auto mb-3 opacity-20 text-indigo-400" />
                {t('customers.empty')}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Account details panel */}
        <div className="glass-card-accent rounded-2xl lg:col-span-2 flex flex-col h-full overflow-hidden border border-white/[0.04] card-highlight">
          {current ? (
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
              {/* Cover Gradient */}
              <div className="h-28 bg-gradient-to-r from-fuchsia-900/40 via-indigo-950/30 to-zinc-900/20 relative shrink-0 border-b border-white/[0.02]" />
              
              {/* Header Profile Section */}
              <div className="px-6 pb-6 border-b border-white/[0.04] relative bg-zinc-900/20 shrink-0">
                <div className="flex justify-between items-end -mt-10 mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border-4 border-zinc-950 flex items-center justify-center text-fuchsia-400 shadow-xl relative z-10">
                    <Building className="w-8 h-8" />
                  </div>
                  <div className="flex space-x-2">
                    <motion.button whileHover={{ scale: 1.02 }}
                      onClick={() => openEdit(current.id)}
                      className="flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 rounded-xl bg-indigo-500/5 font-bold transition cursor-pointer">
                      <Pencil className="w-3.5 h-3.5" />
                      <span>{t('customers.edit')}</span>
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        if (!window.confirm(t('extra.customers.deleteConfirm'))) return;
                        deleteAccount(current.id);
                        addToast(t('extra.customers.deleteSuccess'), 'info');
                        setSelected(null);
                      }}
                      className="flex items-center space-x-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl bg-red-500/5 font-bold transition cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('customers.delete')}</span>
                    </motion.button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                    <h2 className="text-2xl font-bold text-zinc-100">{current.name}</h2>
                    <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{current.industry}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusBadgeStyle(current.status)}`}>
                      {translateStatus(current.status)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">{t('customers.since')} {new Date(current.createdAt).toLocaleDateString(i18n.language)}.</p>
                </div>

                {/* Primary specs row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 p-4 rounded-xl bg-zinc-950/40 border border-white/[0.03]">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block">{t('extra.customers.sizeTitle')}</span>
                    <span className="text-xs font-semibold text-zinc-300 mt-1 block">{translateSize(current.size) || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block">{t('extra.customers.revenueTitle')}</span>
                    <span className="text-xs font-semibold text-emerald-400 mt-1 block flex items-center gap-0.5">
                      <DollarSign className="w-3.5 h-3.5" /> {current.revenue || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block">{t('extra.customers.industryTitle')}</span>
                    <span className="text-xs font-semibold text-zinc-300 mt-1 block flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> {current.industry}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block">Website</span>
                    <a href={`https://${current.website}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-fuchsia-400 hover:underline mt-1 block truncate">
                      {current.website}
                    </a>
                  </div>
                </div>

                {/* Contact data row */}
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-400">
                  {current.email && (
                    <div className="flex items-center space-x-1.5 bg-zinc-800/40 px-3 py-1.5 rounded-lg border border-white/[0.03]">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{current.email}</span>
                    </div>
                  )}
                  {current.phone && (
                    <div className="flex items-center space-x-1.5 bg-zinc-800/40 px-3 py-1.5 rounded-lg border border-white/[0.03]">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{current.phone}</span>
                    </div>
                  )}
                  {current.location && (
                    <div className="flex items-center space-x-1.5 bg-zinc-800/40 px-3 py-1.5 rounded-lg border border-white/[0.03]">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>{current.location}</span>
                    </div>
                  )}
                </div>

                {/* Description Text */}
                {current.description && (
                  <div className="mt-5 text-xs text-zinc-400 leading-relaxed border-t border-white/[0.03] pt-4">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">{t('extra.customers.aboutTitle')}</span>
                    <p>{current.description}</p>
                  </div>
                )}
              </div>

              {/* Company Interactive Meeting History Logs */}
              <div className="p-6 bg-zinc-950/20 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.03]">
                  <h3 className="font-bold text-sm text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-fuchsia-400" />
                    <span>{t('extra.customers.notesMeetingsTitle')}</span>
                    <span className="text-xs text-zinc-500 font-semibold">({currentMeetings.length})</span>
                  </h3>
                  
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowMeetingModal(true)}
                    className="flex items-center space-x-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-bold px-3 py-1.5 rounded-lg text-[10px] transition cursor-pointer">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{t('extra.customers.logMeetingBtn')}</span>
                  </motion.button>
                </div>

                {/* Meetings Timeline */}
                <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1">
                  {currentMeetings.map(meeting => (
                    <motion.div key={meeting.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-zinc-900/40 border border-white/[0.03] flex justify-between items-start gap-4 hover:border-indigo-500/10 transition-colors">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-bold text-xs text-zinc-200">{meeting.title}</span>
                          <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-semibold">
                            <Calendar className="w-3 h-3 text-fuchsia-400" /> 
                            {new Date(meeting.date).toLocaleDateString(i18n.language)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">{meeting.summary}</p>
                        <div className="text-[10px] text-zinc-500 flex items-center gap-1 font-medium pt-1">
                          <Users className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{t('extra.customers.attendeesLabel')}</span>
                          <span className="text-zinc-400">{meeting.attendees}</span>
                        </div>
                      </div>

                      {/* Delete Meeting button */}
                      <button onClick={() => {
                        if (window.confirm(t('extra.customers.removeMeetingConfirm'))) {
                          deleteMeeting(meeting.id);
                          addToast(t('extra.customers.removeMeetingSuccess'), 'info');
                        }
                      }}
                        className="text-zinc-600 hover:text-red-400 p-1.5 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition-colors cursor-pointer shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}

                  {currentMeetings.length === 0 && (
                    <div className="text-center py-12 text-zinc-500 flex flex-col items-center justify-center">
                      <MessageSquare className="w-8 h-8 opacity-20 mb-2 text-zinc-400" />
                      <p className="text-xs font-semibold">{t('extra.customers.noMeetings')}</p>
                      <p className="text-[10px] text-zinc-600 mt-1">{t('extra.customers.noMeetingsDesc')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800/30 flex items-center justify-center text-zinc-600 mb-4 border border-white/[0.04]">
                <Building className="w-8 h-8 opacity-40" />
              </div>
              <h3 className="font-bold text-zinc-400">{t('customers.noSelection')}</h3>
              <p className="text-sm text-zinc-600 mt-1">{t('customers.noSelectionDesc')}</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD COMPANY */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={t('customers.newCompany')}>
        <form onSubmit={handleAddSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('customers.orgName')}</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Globex LTDA" 
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('customers.industry')}</label>
              <input type="text" required value={industry} onChange={e => setIndustry(e.target.value)} placeholder="Ex: Tecnologia" 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('customers.website')}</label>
              <input type="text" required value={website} onChange={e => setWebsite(e.target.value)} placeholder="Ex: globex.com" 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.customers.sizeTitle')}</label>
              <select value={size} onChange={e => setSize(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-300">
                <option value="Pequeno">{t('extra.customers.sizeSmall')}</option>
                <option value="Médio">{t('extra.customers.sizeMedium')}</option>
                <option value="Grande">{t('extra.customers.sizeLarge')}</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.customers.revenueTitle')}</label>
              <input type="text" value={revenue} onChange={e => setRevenue(e.target.value)} placeholder="Ex: R$ 1.500.000" 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('customers.email')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('customers.emailOptional')} 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-300">
                <option value="Lead">Lead</option>
                <option value="Prospect">Prospect</option>
                <option value="Cliente Ativo">{t('extra.customers.statusActiveCustomer')}</option>
                <option value="Parceiro">{t('extra.customers.statusPartner')}</option>
                <option value="Inativo">{t('extra.customers.statusInactive')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('customers.phone')}</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder={t('customers.phoneOptional')} 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('customers.location')}</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder={t('customers.locationOptional')} 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.customers.companyBioLabel')}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder={t('extra.customers.companyBioPlaceholder')}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100 resize-none" />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2.5 text-xs font-bold text-zinc-400 hover:text-white border border-white/5 bg-zinc-900/50 rounded-xl transition hover:bg-zinc-800 cursor-pointer">{t('customers.cancel')}</button>
            <button type="submit" className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-fuchsia-600 to-indigo-500 hover:from-fuchsia-500 hover:to-indigo-400 rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">{t('customers.save')}</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT COMPANY */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditId(null); }} title={t('customers.editCompany')}>
        <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('customers.orgName')}</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Globex LTDA" 
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('customers.industry')}</label>
              <input type="text" required value={industry} onChange={e => setIndustry(e.target.value)} placeholder="Ex: Tecnologia" 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('customers.website')}</label>
              <input type="text" required value={website} onChange={e => setWebsite(e.target.value)} placeholder="Ex: globex.com" 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.customers.sizeTitle')}</label>
              <select value={size} onChange={e => setSize(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-300">
                <option value="Pequeno">{t('extra.customers.sizeSmall')}</option>
                <option value="Médio">{t('extra.customers.sizeMedium')}</option>
                <option value="Grande">{t('extra.customers.sizeLarge')}</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.customers.revenueTitle')}</label>
              <input type="text" value={revenue} onChange={e => setRevenue(e.target.value)} placeholder="Ex: R$ 1.500.000" 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('customers.email')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('customers.emailOptional')} 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-300">
                <option value="Lead">Lead</option>
                <option value="Prospect">Prospect</option>
                <option value="Cliente Ativo">{t('extra.customers.statusActiveCustomer')}</option>
                <option value="Parceiro">{t('extra.customers.statusPartner')}</option>
                <option value="Inativo">{t('extra.customers.statusInactive')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('customers.phone')}</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder={t('customers.phoneOptional')} 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('customers.location')}</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder={t('customers.locationOptional')} 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.customers.companyBioLabel')}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder={t('extra.customers.companyBioPlaceholder')}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100 resize-none" />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => { setShowEditModal(false); setEditId(null); }} className="px-4 py-2.5 text-xs font-bold text-zinc-400 hover:text-white border border-white/5 bg-zinc-900/50 rounded-xl transition hover:bg-zinc-800 cursor-pointer">{t('customers.cancel')}</button>
            <button type="submit" className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-fuchsia-600 to-indigo-500 hover:from-fuchsia-500 hover:to-indigo-400 rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">{t('customers.saveEdit')}</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD MEETING LOG */}
      <Modal isOpen={showMeetingModal} onClose={() => setShowMeetingModal(false)} title={t('extra.customers.logMeetingTitle')}>
        <form onSubmit={handleAddMeetingSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.customers.meetingSubjectLabel')}</label>
            <input type="text" required value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)} placeholder="Ex: Alinhamento de SLA e Contrato" 
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.customers.meetingDateLabel')}</label>
              <input type="date" required value={meetingDate} onChange={e => setMeetingDate(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-300" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.customers.meetingAttendeesLabel')}</label>
              <input type="text" value={meetingAttendees} onChange={e => setMeetingAttendees(e.target.value)} placeholder="Ex: João, Maria, Razid" 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.customers.meetingSummaryLabel')}</label>
            <textarea required value={meetingSummary} onChange={e => setMeetingSummary(e.target.value)} rows={4} placeholder={t('extra.customers.meetingSummaryPlaceholder')}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-zinc-100 resize-none" />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => setShowMeetingModal(false)} className="px-4 py-2.5 text-xs font-bold text-zinc-400 hover:text-white border border-white/5 bg-zinc-900/50 rounded-xl transition hover:bg-zinc-800 cursor-pointer">{t('customers.cancel')}</button>
            <button type="submit" className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-fuchsia-600 to-indigo-500 hover:from-fuchsia-500 hover:to-indigo-400 rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">{t('extra.customers.logBtn')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
});