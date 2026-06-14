import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Settings as SettingsIcon, Save, Percent, Bell, Globe, Shield, Trash2, AlertTriangle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

export default function AdminSettings() {
  const qc = useQueryClient();
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetResult, setResetResult] = useState(null);

  const resetMutation = useMutation({
    mutationFn: () => api.post('/admin/reset-test-data'),
    onSuccess: (res) => {
      setResetResult(res.data.data);
      setResetConfirm(false);
      toast.success('Të dhënat e testit u fshinë!');
    },
    onError: () => toast.error('Ndodhi një gabim gjatë fshirjes.'),
  });

  const { data: settings } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => api.get('/admin/settings').then((r) => r.data.data),
  });

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => { if (settings) reset(settings); }, [settings, reset]);

  const saveMutation = useMutation({
    mutationFn: (data) => api.patch('/admin/settings', data),
    onSuccess: () => { qc.invalidateQueries(['admin', 'settings']); toast.success('Cilësimet u ruajtën!'); },
    onError: () => toast.error('Ndodhi një gabim.'),
  });

  const sections = [
    {
      icon: Percent, title: 'Komisionet',
      fields: [
        { name: 'commission.defaultRate', label: 'Komision Bazë (%)', type: 'number', step: '0.1', min: 0, max: 50 },
        { name: 'commission.minRate', label: 'Komision Min (%)', type: 'number', step: '0.1' },
        { name: 'commission.maxRate', label: 'Komision Max (%)', type: 'number', step: '0.1' },
      ],
    },
    {
      icon: Globe, title: 'Platforma',
      fields: [
        { name: 'platform.name', label: 'Emri Platformës', type: 'text' },
        { name: 'platform.supportEmail', label: 'Email Supporti', type: 'email' },
        { name: 'platform.maxDealsPerBusiness', label: 'Max Deal/Biznes', type: 'number' },
        { name: 'platform.reviewCooldownDays', label: 'Koha e Fshehtë Recension (ditë)', type: 'number' },
      ],
    },
    {
      icon: Shield, title: 'Siguria',
      fields: [
        { name: 'security.maxLoginAttempts', label: 'Max Tentativa Login', type: 'number' },
        { name: 'security.lockoutDurationMinutes', label: 'Kohëzgjatja Bllokimit (min)', type: 'number' },
        { name: 'security.sessionTimeoutHours', label: 'Skadimi Sesioni (orë)', type: 'number' },
      ],
    },
    {
      icon: Bell, title: 'Njoftimet',
      fields: [
        { name: 'notifications.dealExpiryReminderDays', label: 'Kujtues para Skadimit (ditë)', type: 'number' },
        { name: 'notifications.adminEmailRecipients', label: 'Email Admin (ndarë me presje)', type: 'text' },
      ],
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center">
          <SettingsIcon size={20} className="text-gray-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Cilësimet e Platformës</h1>
          <p className="text-gray-500 text-sm">Konfigurimet globale të Zbritje.al</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-5">
        {sections.map(({ icon: Icon, title, fields }) => (
          <div key={title} className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-5">
              <Icon size={18} className="text-brand-400" />
              <h3 className="font-bold text-gray-100">{title}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(({ name, label, type, step, min, max }) => (
                <div key={name}>
                  <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
                  <input type={type} step={step} min={min} max={max} {...register(name)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-500 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <button type="submit" disabled={saveMutation.isPending} className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors">
            {saveMutation.isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={16} />Ruaj Cilësimet</>}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="mt-8 bg-red-950/40 rounded-2xl p-6 border border-red-800/50">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={18} className="text-red-400" />
          <h3 className="font-bold text-red-300">Zona e Rrezikshme</h3>
        </div>
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-red-200">Fshi të gjitha të dhënat e testit</p>
            <p className="text-xs text-red-400 mt-1">
              Fshin: përdorues, biznese, deal-e, vouchers, transaksione, recensione, njoftime.<br />
              Mbetet vetëm: admini (<span className="font-mono">oreldishehu007@gmail.com</span>) + kategoritë.
            </p>
          </div>
          {!resetConfirm ? (
            <button
              onClick={() => setResetConfirm(true)}
              className="flex-shrink-0 flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              <Trash2 size={15} /> Reset Test Data
            </button>
          ) : (
            <div className="flex-shrink-0 flex flex-col items-end gap-2">
              <p className="text-xs text-red-300 font-semibold">Je i sigurt? Ky veprim është i pakthyeshëm.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setResetConfirm(false)}
                  className="px-3 py-2 text-xs text-gray-400 hover:text-gray-200 bg-gray-700 rounded-lg transition-colors"
                >
                  Anulo
                </button>
                <button
                  onClick={() => resetMutation.mutate()}
                  disabled={resetMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-60"
                >
                  {resetMutation.isPending
                    ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Trash2 size={13} />}
                  Po, fshi gjithçka
                </button>
              </div>
            </div>
          )}
        </div>

        {resetResult && (
          <div className="mt-4 p-3 bg-red-900/30 rounded-xl border border-red-800/40 text-xs text-red-300 grid grid-cols-3 gap-2">
            {Object.entries(resetResult).map(([key, count]) => (
              <span key={key} className="flex justify-between gap-2 bg-red-950/40 px-2 py-1 rounded-lg">
                <span className="text-red-400">{key}</span>
                <span className="font-bold text-red-200">{count} fshirë</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
