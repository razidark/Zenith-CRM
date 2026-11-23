import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCRM } from '../hooks/useCRM';
import { Globe, Database, Download, Trash2 } from 'lucide-react';
import { readJson } from '../lib/storage';


export const SettingsView = memo(function SettingsView() {
  const { t, i18n: i18nHook } = useTranslation();
  const { loadDemoData, clearData } = useCRM();

  const changeLang = (lng: string) => {
    i18nHook.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const exportData = () => {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('crm_')) {
        // A corrupt value would throw and abort the whole export.
        data[key] = readJson<unknown>(key, []);
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'zenith-backup.json';
    a.click(); URL.revokeObjectURL(url);
  };

  const clearCRMData = () => {
    if (window.confirm(t('settings.clearConfirm'))) {
      clearData();
      window.location.reload();
    }
  };

  const getClassForLanguage = (code: string) => {
    const base = 'py-3 px-4 rounded-xl border font-semibold text-sm transition hover:bg-zinc-700';
    const selected = 'border-indigo-500 bg-indigo-500/10 text-indigo-400';
    const defaultClass = 'border-zinc-700 bg-zinc-800 text-zinc-400';
    return i18nHook.language === code ? `${base} ${selected}` : `${base} ${defaultClass}`;
  };

  const handleChangeLang = (lng: string) => {
    changeLang(lng);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">{t('settings.title')}</h1>
        <p className="text-sm text-zinc-500 mt-1">{t('settings.desc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="font-bold text-zinc-100 flex items-center space-x-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              <span>{t('settings.language.title')}</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-1">{t('settings.language.desc')}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { code: 'en', label: 'English' },
              { code: 'pt', label: 'Português' },
              { code: 'es', label: 'Español' },
            ].map(l => (
               <button key={l.code} onClick={() => handleChangeLang(l.code)}
                 className={getClassForLanguage(l.code)}>{l.label}</button>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="font-bold text-zinc-100 flex items-center space-x-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <span>{t('settings.data.title')}</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-1">{t('settings.data.desc')}</p>
          </div>
          <div className="space-y-3">
            <button onClick={exportData}
              className="flex w-full items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 p-4 rounded-xl font-semibold text-sm transition">
              <Download className="w-5 h-5 text-indigo-400" />
              <span>{t('settings.export')}</span>
            </button>
            <button onClick={loadDemoData}
              className="flex w-full items-center space-x-2 bg-amber-600/10 hover:bg-amber-600 text-amber-400 hover:text-white border border-amber-500/20 p-4 rounded-xl font-semibold text-sm transition">
              <Database className="w-5 h-5" />
              <span>{t('settings.loadDemo')}</span>
            </button>
            <button onClick={clearCRMData}
              className="flex w-full items-center space-x-2 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 p-4 rounded-xl font-semibold text-sm transition">
              <Trash2 className="w-5 h-5" />
              <span>{t('settings.clear')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});