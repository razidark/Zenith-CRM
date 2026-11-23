import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Users, Check, ChevronDown, Copy, Shield, Trash2, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { readJsonArray } from '../lib/storage';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'can edit' | 'can view';
  avatar?: string;
}

const DEFAULT_COLLABORATORS: Collaborator[] = [
  { id: '1', name: 'Tiffany White', email: 'tiffanyw@company.com', role: 'owner' },
  { id: '2', name: 'Michelle Myers', email: 'michellem@company.com', role: 'can edit' },
  { id: '3', name: 'Alexandra Joy', email: 'alexj@company.com', role: 'can edit' },
  { id: '4', name: 'Razid', email: 'razid@company.com', role: 'can edit' },
];

interface SharePopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SharePopover({ isOpen, onClose }: SharePopoverProps) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const popoverRef = useRef<HTMLDivElement>(null);
  
  // Collaborators State
  const [collaborators, setCollaborators] = useState<Collaborator[]>(() => {
    // A corrupt stored value would throw during render and take the whole
    // app down, so it is treated as absent.
    const saved = readJsonArray<Collaborator>('zenith_collaborators', DEFAULT_COLLABORATORS);
    if (saved.length) return saved;
    localStorage.setItem('zenith_collaborators', JSON.stringify(DEFAULT_COLLABORATORS));
    return DEFAULT_COLLABORATORS;
  });

  // Invite Input State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'can edit' | 'can view'>('can view');

  // General Access State: 'invited' | 'link'
  const [generalAccess, setGeneralAccess] = useState<'invited' | 'link'>(() => {
    const saved = localStorage.getItem('zenith_general_access');
    return (saved as 'invited' | 'link') || 'invited';
  });

  // UI state for dropdowns
  const [activeRoleDropdown, setActiveRoleDropdown] = useState<string | null>(null);
  const [showGeneralAccessDropdown, setShowGeneralAccessDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem('zenith_collaborators', JSON.stringify(collaborators));
  }, [collaborators]);

  useEffect(() => {
    localStorage.setItem('zenith_general_access', generalAccess);
  }, [generalAccess]);

  // Click outside to close popover & dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        // If they click outside the popover itself, close the popover
        const target = e.target as HTMLElement;
        if (target.closest('.share-trigger-btn')) {
          return; // Let the button click handler do the toggling
        }
        onClose();
      } else {
        // If they click inside but outside active role dropdowns, close them
        const target = e.target as HTMLElement;
        if (!target.closest('.role-selector-btn') && !target.closest('.role-dropdown-menu')) {
          setActiveRoleDropdown(null);
        }
        if (!target.closest('.general-access-btn') && !target.closest('.general-access-dropdown')) {
          setShowGeneralAccessDropdown(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    // Check if collaborator already exists
    if (collaborators.some(c => c.email.toLowerCase() === inviteEmail.toLowerCase())) {
      addToast(t('extra.sharePopover.alreadyHasAccess'), 'info');
      return;
    }

    // Parse name from email if possible
    const namePart = inviteEmail.split('@')[0];
    const name = namePart
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    const newCollaborator: Collaborator = {
      id: Date.now().toString(),
      name,
      email: inviteEmail.trim(),
      role: inviteRole,
    };

    setCollaborators([...collaborators, newCollaborator]);
    setInviteEmail('');
    addToast(t('extra.sharePopover.invitedSuccess', { name }), 'success');
  };

  const handleRoleChange = (id: string, role: 'can edit' | 'can view') => {
    setCollaborators(
      collaborators.map(c => (c.id === id ? { ...c, role } : c))
    );
    setActiveRoleDropdown(null);
    addToast(t('extra.sharePopover.roleUpdated'), 'success');
  };

  const handleRemoveCollaborator = (id: string) => {
    const coll = collaborators.find(c => c.id === id);
    if (coll?.role === 'owner') return;

    if (window.confirm(t('extra.sharePopover.revokeConfirm', { name: coll?.name || '' }))) {
      setCollaborators(collaborators.filter(c => c.id !== id));
      addToast(t('extra.sharePopover.accessRevoked'), 'info');
    }
  };

  const shareLink = 'https://datasystems.co/file/Hf45rlf';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    addToast(t('extra.sharePopover.linkCopied'), 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="absolute right-0 mt-2 w-96 glass-panel rounded-2xl p-4 shadow-2xl z-50 border border-white/[0.08] text-left text-xs bg-zinc-950/95 backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-2.5 mb-3.5">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span className="font-extrabold text-white text-sm tracking-tight">{t('extra.sharePopover.shareSettings')}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/[0.04] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Invite Form */}
          <form onSubmit={handleInvite} className="flex gap-2 mb-4">
            <div className="flex-1 flex bg-zinc-900 border border-white/5 rounded-xl overflow-hidden focus-within:border-indigo-500 transition-colors">
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder={t('extra.sharePopover.emailNamePlaceholder')}
                className="flex-1 bg-transparent px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
              <div className="border-l border-white/[0.04] px-1 flex items-center justify-center">
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as 'can edit' | 'can view')}
                  className="bg-transparent text-[10px] text-zinc-400 font-bold focus:outline-none cursor-pointer pr-4 border-none"
                >
                  <option value="can view" className="bg-zinc-900 text-zinc-300">{t('extra.sharePopover.canView')}</option>
                  <option value="can edit" className="bg-zinc-900 text-zinc-300">{t('extra.sharePopover.canEdit')}</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/15 active:scale-95 transition-all cursor-pointer text-xs"
            >
              {t('extra.sharePopover.inviteBtn')}
            </button>
          </form>

          {/* General Access */}
          <div className="mb-4">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">{t('extra.sharePopover.generalAccess')}</h4>
            
            <div className="relative">
              <button
                onClick={() => setShowGeneralAccessDropdown(!showGeneralAccessDropdown)}
                className="general-access-btn w-full p-2.5 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/60 border border-white/[0.03] hover:border-white/[0.06] flex items-center justify-between text-left transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400">
                    {generalAccess === 'invited' ? <Users className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-bold text-zinc-200 block text-xs">
                      {generalAccess === 'invited' ? t('extra.sharePopover.onlyInvited') : t('extra.sharePopover.linkAccess')}
                    </span>
                    <span className="text-[10px] text-zinc-500 block leading-tight mt-0.5">
                      {generalAccess === 'invited' 
                        ? t('extra.sharePopover.peopleHaveAccess', { count: collaborators.length }) 
                        : t('extra.sharePopover.onlyUsersLinkAccess')}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              <AnimatePresence>
                {showGeneralAccessDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="general-access-dropdown absolute w-full mt-1.5 bg-zinc-900 border border-white/[0.06] rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => { setGeneralAccess('invited'); setShowGeneralAccessDropdown(false); }}
                      className="w-full px-3 py-2.5 hover:bg-zinc-800 text-left flex items-center justify-between cursor-pointer border-b border-white/[0.02]"
                    >
                      <div>
                        <span className="font-bold text-zinc-200 block text-xs">{t('extra.sharePopover.onlyInvited')}</span>
                        <span className="text-[10px] text-zinc-500 block">{t('extra.sharePopover.onlyInvitedCanAccess')}</span>
                      </div>
                      {generalAccess === 'invited' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setGeneralAccess('link'); setShowGeneralAccessDropdown(false); }}
                      className="w-full px-3 py-2.5 hover:bg-zinc-800 text-left flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-zinc-200 block text-xs">{t('extra.sharePopover.linkAccess')}</span>
                        <span className="text-[10px] text-zinc-500 block">{t('extra.sharePopover.onlyUsersWithLinkAccess')}</span>
                      </div>
                      {generalAccess === 'link' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* People with Access */}
          <div className="mb-4">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">{t('extra.sharePopover.peopleWithAccess')}</h4>
            
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5 custom-scrollbar">
              {collaborators.map(c => (
                <div key={c.id} className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/20 border border-white/[0.02] hover:bg-zinc-900/40 transition-colors">
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/[0.06] flex items-center justify-center font-bold text-[10px] text-indigo-400 uppercase shrink-0 shadow-inner">
                      {getInitials(c.name)}
                    </div>
                    <div className="truncate">
                      <span className="font-bold text-zinc-200 block text-xs">{c.name}</span>
                      <span className="text-[10px] text-zinc-500 block leading-none mt-0.5">{c.email}</span>
                    </div>
                  </div>

                  {c.role === 'owner' ? (
                    <div className="flex items-center space-x-1 text-emerald-400 font-bold px-2 py-1 text-[10px] tracking-wide select-none">
                      <Shield className="w-3 h-3 text-emerald-400" />
                      <span>{t('extra.sharePopover.owner')}</span>
                    </div>
                  ) : (
                    <div className="relative flex items-center space-x-1">
                      <button
                        onClick={() => setActiveRoleDropdown(activeRoleDropdown === c.id ? null : c.id)}
                        className="role-selector-btn flex items-center space-x-1 text-zinc-400 hover:text-zinc-200 transition font-medium px-2 py-1 bg-zinc-900/50 hover:bg-zinc-900 rounded-lg border border-white/[0.04] cursor-pointer text-[10px]"
                      >
                        <span>{c.role === 'can edit' ? t('extra.sharePopover.canEdit') : t('extra.sharePopover.canView')}</span>
                        <ChevronDown className="w-3 h-3 text-zinc-500" />
                      </button>

                      <button
                        onClick={() => handleRemoveCollaborator(c.id)}
                        className="p-1 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-zinc-500 hover:text-red-400 rounded-lg transition cursor-pointer"
                        title={t('extra.sharePopover.removeUser')}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      <AnimatePresence>
                        {activeRoleDropdown === c.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="role-dropdown-menu absolute right-0 mt-6 w-28 bg-zinc-900 border border-white/[0.06] rounded-xl shadow-xl z-50 overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() => handleRoleChange(c.id, 'can view')}
                              className="w-full px-3 py-1.5 hover:bg-zinc-800 text-left text-[10px] font-bold text-zinc-300 flex items-center justify-between cursor-pointer"
                            >
                              <span>{t('extra.sharePopover.canView')}</span>
                              {c.role === 'can view' && <Check className="w-3 h-3 text-indigo-400" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRoleChange(c.id, 'can edit')}
                              className="w-full px-3 py-1.5 hover:bg-zinc-800 text-left text-[10px] font-bold text-zinc-300 flex items-center justify-between cursor-pointer"
                            >
                              <span>{t('extra.sharePopover.canEdit')}</span>
                              {c.role === 'can edit' && <Check className="w-3 h-3 text-indigo-400" />}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer share link */}
          <div className="flex items-center gap-2 border-t border-white/[0.04] pt-3 mt-3 bg-zinc-950">
            <input
              type="text"
              readOnly
              value={shareLink}
              className="flex-1 bg-zinc-900/80 border border-white/5 rounded-xl py-1.5 px-3 text-[10px] text-zinc-400 focus:outline-none select-all"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-zinc-850 hover:bg-zinc-800 border border-white/[0.06] text-zinc-200 hover:text-white font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer text-[10px]"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>{t('extra.sharePopover.copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>{t('extra.sharePopover.copyLink')}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
