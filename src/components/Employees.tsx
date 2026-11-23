import { useState, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext';
import { Modal } from './Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Users, Trash2, Pencil, CheckCircle2, XCircle, 
  Lock, ShieldAlert, Check, 
  Award, DollarSign, ExternalLink
} from 'lucide-react';
import { readJsonArray } from '../lib/storage';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  status: 'Active' | 'Inactive';
  years: number;
  salary?: number;
  position?: string;
}

const DEFAULT_EMPLOYEES: Employee[] = [
  { id: 'EMP001', firstName: 'Alfred', lastName: 'White', email: 'alfredwhite@zipper.com', department: 'Finance', status: 'Active', years: 3, salary: 5400, position: 'Analista Financeiro' },
  { id: 'EMP002', firstName: 'Alex', lastName: 'Reed', email: 'alexreed@zipper.com', department: 'HR', status: 'Active', years: 7, salary: 6200, position: 'Analista de DHO' },
  { id: 'EMP003', firstName: 'Blake', lastName: 'Cole', email: 'blakecole@zipper.com', department: 'Finance', status: 'Active', years: 2, salary: 5100, position: 'Assistente de Contas' },
  { id: 'EMP004', firstName: 'Claire', lastName: 'Hart', email: 'clairehart@zipper.com', department: 'Marketing', status: 'Active', years: 12, salary: 8900, position: 'Gerente de Branding' },
  { id: 'EMP005', firstName: 'Dave', lastName: 'Ross', email: 'daveross@zipper.com', department: 'HR', status: 'Active', years: 1, salary: 4200, position: 'Recrutador Técnico' },
  { id: 'EMP006', firstName: 'Emma', lastName: 'Lane', email: 'emmalane@zipper.com', department: 'Marketing', status: 'Active', years: 4, salary: 5800, position: 'Especialista em SEO' },
  { id: 'EMP007', firstName: 'Finn', lastName: 'Gray', email: 'finngray@zipper.com', department: 'Sales', status: 'Active', years: 3, salary: 5600, position: 'Executivo de Contas' },
  { id: 'EMP008', firstName: 'Grace', lastName: 'Kent', email: 'gracekent@zipper.com', department: 'Sales', status: 'Inactive', years: 1, salary: 4500, position: 'SDR' },
  { id: 'EMP009', firstName: 'Jack', lastName: 'Nyberg', email: 'jacknyberg@zipper.com', department: 'Engineering', status: 'Active', years: 10, salary: 12500, position: 'Tech Lead Backend' },
  { id: 'EMP010', firstName: 'Lily', lastName: 'Bell', email: 'lilybell@zipper.com', department: 'Engineering', status: 'Active', years: 4, salary: 8200, position: 'Engenheira Frontend' },
  { id: 'EMP011', firstName: 'Norah', lastName: 'Page', email: 'norahpage@zipper.com', department: 'HR', status: 'Inactive', years: 7, salary: 6500, position: 'Gerente de DHO' },
  { id: 'EMP012', firstName: 'Sam', lastName: 'Holt', email: 'samholt@zipper.com', department: 'Engineering', status: 'Inactive', years: 9, salary: 11000, position: 'Engenheiro Sênior' },
  { id: 'EMP013', firstName: 'Brian', lastName: 'Cranston', email: 'briancranston@zipper.com', department: 'Finance', status: 'Active', years: 11, salary: 9800, position: 'Controlador Geral' },
  { id: 'EMP014', firstName: 'Gerald', lastName: 'James', email: 'geraldjames@zipper.com', department: 'Marketing', status: 'Active', years: 8, salary: 7600, position: 'Designer UI/UX' },
];export const Employees = memo(function Employees() {
  const { t } = useTranslation();
  const { addToast } = useToast();

  // Sub-tab state: 'employees' | 'departments' | 'positions' | 'payroll'
  const [subTab, setSubTab] = useState<'employees' | 'departments' | 'positions' | 'payroll'>('employees');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Inactive'>('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Selected row checklist
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Local storage DB
  const [employees, setEmployees] = useState<Employee[]>(() => {
    // A corrupt stored value would throw during render and take the whole
    // app down, so it is treated as absent.
    const saved = readJsonArray<Employee>('zenith_employees', DEFAULT_EMPLOYEES);
    if (saved.length) return saved;
    localStorage.setItem('zenith_employees', JSON.stringify(DEFAULT_EMPLOYEES));
    return DEFAULT_EMPLOYEES;
  });

  const saveEmployees = (newEmployees: Employee[]) => {
    setEmployees(newEmployees);
    localStorage.setItem('zenith_employees', JSON.stringify(newEmployees));
  };

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [years, setYears] = useState(1);
  const [salary, setSalary] = useState(5000);
  const [position, setPosition] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  // Filter logic
  const filtered = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = 
        emp.firstName.toLowerCase().includes(search.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase()) ||
        emp.id.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;
      const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;

      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [employees, search, statusFilter, deptFilter]);

  // Departments stats
  const departmentsData = useMemo(() => {
    const map: { [key: string]: { count: number; totalSalary: number; lead: string } } = {
      Finance: { count: 0, totalSalary: 0, lead: 'Brian Cranston' },
      HR: { count: 0, totalSalary: 0, lead: 'Alex Reed' },
      Marketing: { count: 0, totalSalary: 0, lead: 'Claire Hart' },
      Sales: { count: 0, totalSalary: 0, lead: 'Finn Gray' },
      Engineering: { count: 0, totalSalary: 0, lead: 'Jack Nyberg' },
    };
    employees.forEach(emp => {
      if (map[emp.department]) {
        map[emp.department].count += 1;
        map[emp.department].totalSalary += emp.salary || 5000;
      }
    });
    return Object.entries(map).map(([name, stats]) => ({ name, ...stats }));
  }, [employees]);

  // Positions stats
  const positionsData = useMemo(() => {
    const list: { name: string; count: number; dept: string }[] = [];
    employees.forEach(emp => {
      const existing = list.find(p => p.name === emp.position);
      if (existing) {
        existing.count += 1;
      } else if (emp.position) {
        list.push({ name: emp.position, count: 1, dept: emp.department });
      }
    });
    return list;
  }, [employees]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !position) return;
    
    // Generate next EMP code
    const maxNum = employees.reduce((max, emp) => {
      const num = parseInt(emp.id.replace('EMP', ''));
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    const nextId = `EMP${String(maxNum + 1).padStart(3, '0')}`;

    const newEmp: Employee = {
      id: nextId,
      firstName,
      lastName,
      email,
      department,
      status,
      years,
      salary,
      position
    };

    const updated = [...employees, newEmp];
    saveEmployees(updated);
    addToast(t('extra.employees.addSuccess'), 'success');
    resetForm();
    setShowAddModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !firstName || !lastName || !email || !position) return;

    const updated = employees.map(emp => emp.id === editId ? {
      ...emp,
      firstName,
      lastName,
      email,
      department,
      status,
      years,
      salary,
      position
    } : emp);

    saveEmployees(updated);
    addToast(t('extra.employees.editSuccess'), 'success');
    resetForm();
    setShowEditModal(false);
  };

  const openEdit = (emp: Employee) => {
    setEditId(emp.id);
    setFirstName(emp.firstName);
    setLastName(emp.lastName);
    setEmail(emp.email);
    setDepartment(emp.department);
    setStatus(emp.status);
    setYears(emp.years);
    setSalary(emp.salary || 5000);
    setPosition(emp.position || '');
    setShowEditModal(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm(t('extra.employees.deleteConfirm'))) return;
    const updated = employees.filter(emp => emp.id !== id);
    saveEmployees(updated);
    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    addToast(t('extra.employees.deleteSuccess'), 'info');
  };

  const resetForm = () => {
    setEditId(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setDepartment('Engineering');
    setStatus('Active');
    setYears(1);
    setSalary(5000);
    setPosition('');
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(emp => emp.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Status badges colors
  const getDeptColor = (dept: string) => {
    switch (dept) {
      case 'Finance': return 'bg-emerald-500';
      case 'HR': return 'bg-amber-500';
      case 'Marketing': return 'bg-purple-500';
      case 'Sales': return 'bg-sky-500';
      case 'Engineering': return 'bg-indigo-500';
      default: return 'bg-zinc-500';
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      {/* Breadcrumbs Navigation & Header */}
      <div className="shrink-0 space-y-1">
        <div className="flex items-center space-x-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
          <span>Home</span>
          <span>&gt;</span>
          <span className="text-zinc-600">...</span>
          <span>&gt;</span>
          <span className="text-indigo-400">employee-management-system</span>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
          <div className="flex items-center gap-1 text-[9px] text-zinc-500 bg-zinc-900 border border-white/5 px-2 py-0.5 rounded-md">
            <Lock className="w-2.5 h-2.5 text-zinc-600" />
            <span>Private Database</span>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pt-1">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>{t('extra.employees.dashboardTitle')}</span>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/15 px-2 py-0.5 rounded-full uppercase tracking-wider">{t('extra.employees.tagRH')}</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              {t('extra.employees.desc')}
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tabs + Options Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.04] pb-2 gap-4 shrink-0">
        <div className="flex items-center space-x-1 bg-zinc-900/50 p-1 rounded-xl border border-white/[0.03]">
          {(['employees', 'departments', 'positions', 'payroll'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSubTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                subTab === tab 
                  ? 'bg-zinc-800 text-white shadow-sm border border-white/[0.04]' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab === 'employees' && t('extra.employees.tabEmployees')}
              {tab === 'departments' && t('extra.employees.tabDepartments')}
              {tab === 'positions' && t('extra.employees.tabPositions')}
              {tab === 'payroll' && t('extra.employees.tabPayroll')}
            </button>
          ))}
          <button 
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition border border-white/[0.04] cursor-pointer"
            title={t('extra.employees.addNewBtn')}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {subTab === 'employees' && (
          <div className="flex items-center gap-3">
            {/* Quick Search */}
            <div className="relative group">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text" 
                placeholder={t('extra.employees.searchPlaceholder')} 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="bg-zinc-900/80 border border-white/5 focus:outline-none focus:border-indigo-500 rounded-xl py-1.5 pl-9 pr-4 text-xs w-48 sm:w-56 text-zinc-200 focus:ring-2 focus:ring-indigo-500/10" 
              />
            </div>

            {/* Department filter selection */}
            <select 
              value={deptFilter} 
              onChange={e => setDeptFilter(e.target.value)}
              className="bg-zinc-900 border border-white/5 rounded-xl p-1.5 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 h-8"
            >
              <option value="ALL">{t('extra.employees.deptsFilterPlaceholder')}</option>
              <option value="Finance">Finance</option>
              <option value="HR">HR</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Engineering">Engineering</option>
            </select>

            {/* Status filters */}
            <div className="flex border border-white/5 rounded-xl bg-zinc-900 p-0.5 h-8">
              {(['ALL', 'Active', 'Inactive'] as const).map(statusOpt => (
                <button
                  key={statusOpt}
                  onClick={() => setStatusFilter(statusOpt)}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    statusFilter === statusOpt 
                      ? 'bg-zinc-800 text-indigo-400 border border-white/[0.03]' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {statusOpt === 'ALL' && t('tasks.all')}
                  {statusOpt === 'Active' && t('extra.employees.statusActive')}
                  {statusOpt === 'Inactive' && t('extra.employees.statusInactive')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Double Grid layout: Table (Left) + Timeline sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Left Columns - Content Tabs */}
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
              {subTab === 'employees' && (
                <div className="glass-panel border border-white/[0.04] rounded-2xl overflow-hidden flex flex-col h-full min-h-0 bg-zinc-900/30">
                  <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.04] bg-zinc-950/20 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-4 w-12 text-center">
                            <input 
                              type="checkbox" 
                              checked={filtered.length > 0 && selectedIds.length === filtered.length}
                              onChange={handleToggleSelectAll}
                              className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-0 cursor-pointer"
                            />
                          </th>
                          <th className="py-3 px-4">{t('extra.employees.colEmployee')}</th>
                          <th className="py-3 px-4">{t('extra.employees.colDepartment')}</th>
                          <th className="py-3 px-4">{t('extra.employees.colEmail')}</th>
                          <th className="py-3 px-4">{t('extra.employees.colEmployment')}</th>
                          <th className="py-3 px-4 text-center">{t('extra.employees.colYears')}</th>
                          <th className="py-3 px-4">{t('extra.employees.colFirstName')}</th>
                          <th className="py-3 px-4 text-center w-24">{t('extra.employees.colActions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(emp => {
                          const isSelected = selectedIds.includes(emp.id);
                          return (
                            <tr 
                              key={emp.id}
                              className={`border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors ${
                                isSelected ? 'bg-indigo-500/[0.02]' : ''
                              }`}
                            >
                              <td className="py-3.5 px-4 text-center">
                                <input 
                                  type="checkbox" 
                                  checked={isSelected}
                                  onChange={() => handleToggleSelectRow(emp.id)}
                                  className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-0 cursor-pointer"
                                />
                              </td>
                              <td className="py-3.5 px-4 font-semibold text-zinc-100 flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center text-[10px] text-zinc-400 font-mono tracking-tight shadow-inner">
                                  {emp.id}
                                </div>
                                <span className="truncate">{emp.firstName} {emp.lastName}</span>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center space-x-2">
                                  <span className={`w-2 h-2 rounded-full ${getDeptColor(emp.department)}`} />
                                  <span className="text-zinc-300 font-semibold">{emp.department}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-zinc-400 font-medium select-text">{emp.email}</td>
                              <td className="py-3.5 px-4">
                                {emp.status === 'Active' ? (
                                  <span className="flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold text-[10px] w-fit">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>{t('extra.employees.statusActive')}</span>
                                  </span>
                                ) : (
                                  <span className="flex items-center space-x-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-bold text-[10px] w-fit">
                                    <XCircle className="w-3 h-3" />
                                    <span>{t('extra.employees.statusInactive')}</span>
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-center text-zinc-300 font-semibold">{emp.years}</td>
                              <td className="py-3.5 px-4 text-zinc-300 font-semibold">{emp.firstName}</td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center space-x-1.5">
                                  <button 
                                    onClick={() => openEdit(emp)}
                                    className="p-1 hover:bg-indigo-500/15 border border-transparent hover:border-indigo-500/25 rounded-md text-zinc-500 hover:text-indigo-400 transition cursor-pointer"
                                    title={t('extra.employees.editTitle')}
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(emp.id)}
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
                        {filtered.length === 0 && (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-zinc-500">
                              <Users className="w-8 h-8 mx-auto mb-2 opacity-25 text-zinc-400" />
                              <p className="font-semibold text-xs">{t('extra.employees.noEmployees')}</p>
                              <p className="text-[10px] text-zinc-600 mt-1">{t('extra.employees.noEmployeesDesc')}</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {subTab === 'departments' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {departmentsData.map(dept => (
                    <div key={dept.name} className="glass-panel border border-white/[0.04] p-5 rounded-2xl bg-zinc-900/30 flex flex-col justify-between space-y-4 hover:border-indigo-500/10 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${getDeptColor(dept.name)}`} />
                            <h3 className="font-bold text-base text-zinc-100">{dept.name}</h3>
                          </div>
                          <p className="text-xs text-zinc-500">{t('extra.employees.operationsMgmt')}</p>
                        </div>
                        <span className="text-[10px] bg-zinc-800 border border-white/5 text-zinc-400 font-extrabold px-2.5 py-0.5 rounded-md uppercase">
                          {dept.count} {dept.count === 1 ? t('extra.employees.member') : t('extra.employees.members')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 border-t border-white/[0.03] pt-4 text-xs">
                        <div>
                          <span className="text-zinc-500 block">{t('extra.employees.deptHead')}</span>
                          <span className="font-bold text-zinc-300 mt-0.5 block">{dept.lead}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">{t('extra.employees.monthlyPayroll')}</span>
                          <span className="font-bold text-emerald-400 mt-0.5 block flex items-center gap-0.5">
                            <DollarSign className="w-3.5 h-3.5" /> R$ {dept.totalSalary.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {subTab === 'positions' && (
                <div className="glass-panel border border-white/[0.04] rounded-2xl bg-zinc-900/30 p-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2 px-1">{t('extra.employees.corporatePositions')}</span>
                    {positionsData.map(pos => (
                      <div key={pos.name} className="flex justify-between items-center p-3 rounded-xl bg-zinc-950/20 border border-white/[0.02]">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-indigo-400">
                            <Award className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-zinc-200">{pos.name}</h4>
                            <span className="text-[10px] text-zinc-500">{pos.dept}</span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold px-2 py-0.5 rounded-full">
                          {pos.count} {pos.count === 1 ? t('extra.employees.member') : t('extra.employees.members')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {subTab === 'payroll' && (
                <div className="glass-panel border border-white/[0.04] rounded-2xl bg-zinc-900/30 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.04] bg-zinc-950/20 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-4">{t('extra.employees.colCode')}</th>
                          <th className="py-3 px-4">{t('extra.employees.colName')}</th>
                          <th className="py-3 px-4">{t('extra.employees.colRole')}</th>
                          <th className="py-3 px-4">{t('extra.employees.colSalary')}</th>
                          <th className="py-3 px-4">{t('extra.employees.colStatus')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map(emp => (
                          <tr key={emp.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-zinc-500">{emp.id}</td>
                            <td className="py-3 px-4 font-bold text-zinc-200">{emp.firstName} {emp.lastName}</td>
                            <td className="py-3 px-4 text-zinc-400">{emp.position || t('extra.employees.member')}</td>
                            <td className="py-3 px-4 font-bold text-emerald-400">R$ {(emp.salary || 5000).toLocaleString()}</td>
                            <td className="py-3 px-4">
                              <span className="flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold text-[9px] w-fit">
                                <Check className="w-2.5 h-2.5" />
                                <span>{t('extra.employees.paidStatus')}</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Sidebar - Branch Activity timeline */}
        <div className="glass-panel border border-white/[0.04] rounded-2xl bg-zinc-900/20 p-5 flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar">
          <div className="shrink-0 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {t('extra.employees.branchedProposal')}
              </span>
              <button className="text-zinc-500 hover:text-zinc-200 transition cursor-pointer">
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
            <h2 className="text-lg font-extrabold text-white pt-1">{t('extra.employees.proposalActivity')}</h2>
          </div>

          {/* Pending Info alert */}
          <div className="mt-4 p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/15 flex items-start space-x-2.5 shrink-0">
            <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-zinc-400 leading-normal font-medium">
              {t('extra.employees.pendingReviewDesc')}
            </p>
          </div>

          {/* Timeline events container */}
          <div className="mt-6 flex-1 relative pr-1 overflow-y-auto custom-scrollbar pl-2 space-y-5">
            {/* Timeline vertical bar */}
            <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-zinc-800 pointer-events-none" />

            {/* Event 1 */}
            <div className="relative pl-6 space-y-2">
              {/* Point circle indicator */}
              <div className="absolute left-[3px] top-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/15" />
              
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-zinc-200">
                  {t('extra.employees.proposalSubmittedTitle')}
                </h4>
                <p className="text-[9px] text-zinc-500 font-semibold">{t('extra.employees.today')}, 2:13pm | 4 {t('extra.employees.hoursAgo')}</p>
              </div>

              {/* Detail box */}
              <div className="p-3 rounded-xl bg-zinc-900 border border-white/[0.03] space-y-2 text-[10px]">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center font-bold text-[8px] text-indigo-400 uppercase shadow-inner">
                    AS
                  </div>
                  <div>
                    <span className="text-zinc-500 font-medium">{t('extra.employees.submittedBy')} </span>
                    <span className="font-bold text-zinc-300">Andy Smith</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-white/5 text-[9px] font-bold">{t('extra.employees.tabEmployees')}</span>
                  <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-white/5 text-[9px] font-bold">EMP008</span>
                </div>

                <p className="text-zinc-400 leading-normal pt-0.5">
                  {t('extra.employees.proposalSubmittedDesc')}
                </p>

                <button 
                  onClick={() => setShowProposalModal(true)}
                  className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer pt-1 hover:underline text-[9px]"
                >
                  {t('extra.employees.readProposalDetails')} ↗
                </button>
              </div>
            </div>

            {/* Event 2 */}
            <div className="relative pl-6 space-y-2">
              <div className="absolute left-[4px] top-1.5 w-1.5 h-1.5 rounded-full bg-zinc-600" />
              
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-zinc-300">
                  {t('extra.employees.dataAccuracyTitle')}
                </h4>
                <p className="text-[9px] text-zinc-500 font-semibold">Mar 15, 4:26pm | 2 {t('extra.employees.daysAgo')}</p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-white/[0.03] space-y-2 text-[10px]">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-950 flex items-center justify-center font-bold text-[8px] text-zinc-400">AM</div>
                    <div className="w-5 h-5 rounded-full bg-zinc-700 border border-zinc-950 flex items-center justify-center font-bold text-[8px] text-zinc-300">MY</div>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-medium">{t('extra.employees.contributors')} </span>
                    <span className="font-bold text-zinc-300">Andy, Maya</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-white/5 text-[9px] font-bold">{t('extra.employees.tabEmployees')}</span>
                  <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-white/5 text-[9px] font-bold">EMP008</span>
                </div>

                <p className="text-zinc-400 leading-normal pt-0.5">
                  {t('extra.employees.dataAccuracyDesc')}
                </p>

                <button 
                  onClick={() => setShowNotesModal(true)}
                  className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer pt-1 hover:underline text-[9px]"
                >
                  {t('extra.employees.readMeetingNotes')} ↗
                </button>
              </div>
            </div>

            {/* Event 3 */}
            <div className="relative pl-6 space-y-1">
              <div className="absolute left-[4px] top-1.5 w-1.5 h-1.5 rounded-full bg-zinc-600" />
              
              <h4 className="text-xs font-bold text-zinc-400">
                {t('extra.employees.securityAuditTitle')}
              </h4>
              <p className="text-[9px] text-zinc-500 font-semibold">Mar 10, 12:32pm | 7 {t('extra.employees.daysAgo')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ADD EMPLOYEE */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={t('extra.employees.addTitle')}>
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.employees.firstNameLabel')}</label>
              <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Ex: Alfred" 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.employees.lastNameLabel')}</label>
              <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Ex: White" 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">E-mail</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="exemplo@zipper.com" 
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-100" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.employees.roleLabel')}</label>
              <input type="text" required value={position} onChange={e => setPosition(e.target.value)} placeholder="Ex: Designer Sênior" 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.employees.colDepartment')}</label>
              <select value={department} onChange={e => setDepartment(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-300">
                <option value="Finance">Finance</option>
                <option value="HR">HR</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Engineering">Engineering</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.employees.salaryLabel')}</label>
              <input type="number" required value={salary} onChange={e => setSalary(+e.target.value)} 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.employees.yearsLabel')}</label>
              <input type="number" required value={years} onChange={e => setYears(+e.target.value)} 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as 'Active' | 'Inactive')}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-300">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white border border-white/5 bg-zinc-900/50 rounded-xl hover:bg-zinc-800 transition cursor-pointer">{t('extra.employees.cancelBtn')}</button>
            <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">{t('extra.employees.saveBtn')}</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT EMPLOYEE */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditId(null); }} title={t('extra.employees.editFormTitle')}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.employees.firstNameLabel')}</label>
              <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Ex: Alfred" 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.employees.lastNameLabel')}</label>
              <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Ex: White" 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">E-mail</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="exemplo@zipper.com" 
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-100" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.employees.roleLabel')}</label>
              <input type="text" required value={position} onChange={e => setPosition(e.target.value)} placeholder="Ex: Designer Sênior" 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.employees.colDepartment')}</label>
              <select value={department} onChange={e => setDepartment(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-300">
                <option value="Finance">Finance</option>
                <option value="HR">HR</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Engineering">Engineering</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.employees.salaryLabel')}</label>
              <input type="number" required value={salary} onChange={e => setSalary(+e.target.value)} 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('extra.employees.yearsLabel')}</label>
              <input type="number" required value={years} onChange={e => setYears(+e.target.value)} 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as 'Active' | 'Inactive')}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-zinc-300">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => { setShowEditModal(false); setEditId(null); }} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white border border-white/5 bg-zinc-900/50 rounded-xl hover:bg-zinc-800 transition cursor-pointer">{t('extra.employees.cancelBtn')}</button>
            <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">{t('extra.employees.saveChangesBtn')}</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: PROPOSAL DETAILS */}
      <Modal isOpen={showProposalModal} onClose={() => setShowProposalModal(false)} title={t('extra.employees.proposalDetailsTitle')}>
        <div className="space-y-4 text-xs text-zinc-300">
          <div className="p-3 bg-zinc-950/40 rounded-xl border border-white/[0.03] space-y-1.5">
            <div className="flex justify-between">
              <span className="font-bold text-zinc-400">Proposal ID:</span>
              <span className="font-mono text-indigo-400 font-bold">PROP-2026-08A</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-zinc-400">{t('extra.employees.targetEntity')}</span>
              <span className="font-semibold text-zinc-200">Grace Kent (EMP008)</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-zinc-400">{t('financial.status')}</span>
              <span className="text-indigo-400 font-extrabold uppercase text-[9px] bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/15">{t('extra.employees.pendingReview')}</span>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-zinc-400 uppercase tracking-wider text-[9px]">{t('extra.employees.contractModifications')}</h4>
            <ul className="space-y-2 bg-zinc-900 border border-white/[0.02] p-3 rounded-xl leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{t('extra.employees.mod1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{t('extra.employees.mod2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{t('extra.employees.mod3')}</span>
              </li>
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="button" 
              onClick={() => setShowProposalModal(false)} 
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition cursor-pointer"
            >
              {t('extra.close')}
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: MEETING NOTES */}
      <Modal isOpen={showNotesModal} onClose={() => setShowNotesModal(false)} title={t('extra.employees.meetingNotesTitle')}>
        <div className="space-y-4 text-xs text-zinc-300">
          <div className="p-3 bg-zinc-950/40 rounded-xl border border-white/[0.03] space-y-1.5">
            <div className="flex justify-between">
              <span className="font-bold text-zinc-400">{t('financial.date')}</span>
              <span className="font-semibold text-zinc-200">March 15, 2026 - 4:26 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-zinc-400">{t('extra.customers.attendeesLabel')}</span>
              <span className="font-semibold text-zinc-200">Andy Smith, Maya Lin, Kyle R.</span>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-zinc-400 uppercase tracking-wider text-[9px]">{t('extra.employees.meetingMinutes')}</h4>
            <div className="bg-zinc-900 border border-white/[0.02] p-3.5 rounded-xl space-y-2 leading-relaxed">
              <p>{t('extra.employees.notesScope')}</p>
              <p>{t('extra.employees.notesResolved')}</p>
              <p>{t('extra.employees.notesNextSteps')}</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="button" 
              onClick={() => setShowNotesModal(false)} 
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition cursor-pointer"
            >
              {t('extra.close')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
});

