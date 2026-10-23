import React, { useState } from 'react';
import {
  MessageSquare,
  ShieldCheck,
  Headphones,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Server,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginPage: React.FC = () => {
  const { login, users } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Silakan masukkan alamat email akun Anda.');
      return;
    }
    const success = login(email);
    if (!success) {
      setError('Email tidak terdaftar dalam sistem. Gunakan tombol demo di bawah.');
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    login(demoEmail);
  };

  const superAdmin = users.find((u) => u.role === 'super_admin');
  const callCenter = users.find((u) => u.role === 'call_center');

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-xl shadow-emerald-900/40 mb-4">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          OmniWatsApp Surveillance
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Enterprise Multi-Session WhatsApp Gateway & Surveillance Hub
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-800 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <span className="font-semibold">Perhatian:</span>
              <span>{error}</span>
            </div>
          )}

          {/* Quick 1-Click Role Login Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Quick 1-Click Role Login
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">Ready to test</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Super Admin Card */}
              {superAdmin && (
                <button
                  type="button"
                  onClick={() => handleQuickLogin(superAdmin.email)}
                  className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-950/20 hover:bg-purple-900/30 text-left transition group hover:border-purple-500/50"
                >
                  <div className="flex items-center space-x-2.5 mb-2">
                    <img
                      src={superAdmin.avatar}
                      alt={superAdmin.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500/40"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-bold text-white truncate">
                          {superAdmin.name}
                        </span>
                      </div>
                      <span className="inline-flex items-center text-[10px] text-purple-300 font-semibold px-1.5 py-0.2 rounded bg-purple-500/20">
                        <ShieldCheck className="w-3 h-3 mr-0.5" /> Super Admin
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                    Akses penuh: Tambah/hapus user, scan QR WhatsApp, konfigurasi automasi & semua channel.
                  </p>
                  <div className="mt-2.5 flex items-center text-xs font-semibold text-purple-400 group-hover:text-purple-300">
                    <span>Masuk sebagai Super Admin</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              )}

              {/* Call Center Agent Card */}
              {callCenter && (
                <button
                  type="button"
                  onClick={() => handleQuickLogin(callCenter.email)}
                  className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/30 text-left transition group hover:border-emerald-500/50"
                >
                  <div className="flex items-center space-x-2.5 mb-2">
                    <img
                      src={callCenter.avatar}
                      alt={callCenter.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/40"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-bold text-white truncate">
                          {callCenter.name}
                        </span>
                      </div>
                      <span className="inline-flex items-center text-[10px] text-emerald-300 font-semibold px-1.5 py-0.2 rounded bg-emerald-500/20">
                        <Headphones className="w-3 h-3 mr-0.5" /> Call Center
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                    Antrian pesan pelanggan, kirim voice note & media, catatan internal agen & quick replies.
                  </p>
                  <div className="mt-2.5 flex items-center text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
                    <span>Masuk sebagai Call Center</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              )}
            </div>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-3 text-slate-500 font-medium">
                Atau Masuk Dengan Akun Email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Perusahaan
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@omnichat.io"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
              <div className="flex items-center space-x-2 mt-1.5 text-[11px] text-slate-400">
                <span>Contoh:</span>
                <button
                  type="button"
                  onClick={() => setEmail('admin@omnichat.io')}
                  className="text-purple-400 hover:underline cursor-pointer"
                >
                  admin@omnichat.io
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setEmail('sarah.agent@omnichat.io')}
                  className="text-emerald-400 hover:underline cursor-pointer"
                >
                  sarah.agent@omnichat.io
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">
                  Password Keamanan
                </label>
                <span className="text-[11px] text-slate-500">Default: password123</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-900/30 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Masuk ke Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Features Highlights */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-400">
            <div className="flex flex-col items-center">
              <Server className="w-4 h-4 text-emerald-400 mb-1" />
              <span>Multi-Device QR</span>
            </div>
            <div className="flex flex-col items-center">
              <Zap className="w-4 h-4 text-emerald-400 mb-1" />
              <span>Real-Time Sync</span>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1" />
              <span>Auto-Reply Bots</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
