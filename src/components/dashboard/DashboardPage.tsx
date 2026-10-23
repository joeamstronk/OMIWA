import React, { useState } from 'react';
import {
  Smartphone,
  MessageSquare,
  Send,
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
  BatteryCharging,
  BatteryMedium,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Headphones,
  Bot,
  Activity,
  PlusCircle,
  Play,
  RotateCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PerformanceMetricsWidget } from './PerformanceMetricsWidget';

export const DashboardPage: React.FC = () => {
  const {
    sessions,
    chats,
    messages,
    users,
    currentUser,
    setActivePage,
    setSelectedChatId,
    simulateIncomingCustomerMessage,
  } = useApp();

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationToast, setSimulationToast] = useState<string | null>(null);

  const connectedSessions = sessions.filter((s) => s.status === 'connected');
  const totalInboundToday = sessions.reduce((sum, s) => sum + s.totalReceivedToday, 0);
  const totalOutboundToday = sessions.reduce((sum, s) => sum + s.totalSentToday, 0);
  const onlineAgents = users.filter((u) => u.status === 'online' && u.role === 'call_center');
  const resolvedChatsCount = chats.filter((c) => c.status === 'resolved').length;
  const resolutionRate = chats.length > 0 ? Math.round((resolvedChatsCount / chats.length) * 100) : 92;

  // Handle instant simulation of incoming customer message
  const triggerSimulation = async () => {
    setIsSimulating(true);
    await simulateIncomingCustomerMessage();
    setIsSimulating(false);
    setSimulationToast('Pesan WhatsApp simulasi pelanggan berhasil diterima di server!');
    setTimeout(() => setSimulationToast(null), 4000);
  };

  // Recent 6 events across all messages
  const recentEvents = [...messages]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Alert */}
      {simulationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-bounce">
          <Zap className="w-4 h-4" />
          <span className="text-xs font-semibold">{simulationToast}</span>
        </div>
      )}

      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 border border-slate-700/60 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1.5"></span>
              Gateway Operational
            </span>
            <span className="text-xs text-slate-400">
              Role: <strong className="text-white capitalize">{currentUser?.role.replace('_', ' ')}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Selamat Datang, {currentUser?.name} 👋
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl">
            Pusat kendali gateway WhatsApp multi-nomor. Pantau pesan masuk & keluar, status perangkat,
            antrian chat agen call center, serta respon otomatis secara real-time.
          </p>
        </div>

        {/* Quick Simulator & Actions */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={triggerSimulation}
            disabled={isSimulating}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-medium text-xs shadow-lg shadow-emerald-900/40 transition cursor-pointer active:scale-95 disabled:opacity-50"
            title="Kirim pesan simulasi pelanggan masuk untuk menguji auto-reply & notifikasi"
          >
            {isSimulating ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>Simulasi Pesan Masuk</span>
          </button>

          <button
            onClick={() => setActivePage('whatsapp-channels')}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-3.5 py-2.5 rounded-xl font-medium text-xs transition"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Tambah WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: WhatsApp Connected Lines */}
        <div
          onClick={() => setActivePage('whatsapp-channels')}
          className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Nomor WhatsApp Aktif</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-white">
              {connectedSessions.length}
            </span>
            <span className="text-xs text-slate-400">/ {sessions.length} Nomor</span>
          </div>
          <div className="mt-2.5 flex items-center text-[11px] text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>Semua sesi tersinkronisasi via QR</span>
          </div>
        </div>

        {/* KPI 2: Messages Inbound Today */}
        <div
          onClick={() => setActivePage('chat')}
          className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Pesan Masuk Hari Ini</span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-white">
              {totalInboundToday}
            </span>
            <span className="text-xs text-slate-400">pesan inbound</span>
          </div>
          <div className="mt-2.5 flex items-center text-[11px] text-teal-400 font-medium">
            <Zap className="w-3.5 h-3.5 mr-1" />
            <span>Ditangani bot & agen</span>
          </div>
        </div>

        {/* KPI 3: Messages Outbound Today */}
        <div
          onClick={() => setActivePage('chat')}
          className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Pesan Keluar (Outbound)</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-white">
              {totalOutboundToday}
            </span>
            <span className="text-xs text-slate-400">pesan terkirim</span>
          </div>
          <div className="mt-2.5 flex items-center text-[11px] text-blue-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            <span>99.4% Delivery rate</span>
          </div>
        </div>

        {/* KPI 4: Active Call Center Agents */}
        <div
          onClick={() => setActivePage('users')}
          className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Agen Call Center Online</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Headphones className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-white">
              {onlineAgents.length}
            </span>
            <span className="text-xs text-slate-400">
              / {users.filter((u) => u.role === 'call_center').length} Agen Siap
            </span>
          </div>
          <div className="mt-2.5 flex items-center text-[11px] text-purple-400 font-medium">
            <Clock className="w-3.5 h-3.5 mr-1" />
            <span>Rata-rata respon ~48 detik</span>
          </div>
        </div>
      </div>

      {/* Connected WhatsApp Devices Health Cards */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Status Koneksi Perangkat WhatsApp (Server Sessions)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Setiap sesi terhubung langsung ke gateway server dan dapat menerima/mengirim pesan simultan.
            </p>
          </div>
          <button
            onClick={() => setActivePage('whatsapp-channels')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center"
          >
            Lihat Semua QR / Device <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {sessions.map((session) => {
            const isConn = session.status === 'connected';
            return (
              <div
                key={session.id}
                className={`p-4 rounded-xl border transition ${
                  isConn
                    ? 'bg-slate-800/40 border-slate-700/80 hover:border-emerald-500/50'
                    : 'bg-slate-800/20 border-dashed border-slate-700/60'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{session.name}</p>
                    <p className="text-xs font-mono text-emerald-400 font-medium">
                      {session.phoneNumber}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                      isConn
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {isConn ? 'Online' : 'Scan QR'}
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800">
                  <div className="flex justify-between items-center">
                    <span>Perangkat:</span>
                    <span className="text-slate-200 font-medium truncate max-w-[150px]">
                      {session.deviceInfo.model}
                    </span>
                  </div>
                  {isConn && (
                    <div className="flex justify-between items-center">
                      <span>Baterai:</span>
                      <span className="text-slate-200 font-medium flex items-center">
                        {session.deviceInfo.isCharging ? (
                          <BatteryCharging className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                        ) : (
                          <BatteryMedium className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        )}
                        {session.deviceInfo.battery}%
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span>Pesan Hari Ini:</span>
                    <span className="text-slate-200 font-medium">
                      {session.totalReceivedToday} In / {session.totalSentToday} Out
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2">
                  {isConn ? (
                    <button
                      onClick={() => {
                        setActivePage('chat');
                      }}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition"
                    >
                      Buka Inbox Channel
                    </button>
                  ) : (
                    <button
                      onClick={() => setActivePage('whatsapp-channels')}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition"
                    >
                      Scan QR WhatsApp Sekarang
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recharts Performance Metrics Widget (Daily Message Volume & Response Time Trends) */}
      <PerformanceMetricsWidget />

      {/* Two Column Layout: Message Volume Chart & Live Event Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Hourly Traffic Analysis */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Volume Trafik Percakapan Hari Ini (Per Jam)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Pola lonjakan pesan masuk dari pelanggan vs respon dari agen Call Center.
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center text-slate-300">
                <span className="w-3 h-3 rounded bg-emerald-500 mr-1.5"></span> Inbound
              </span>
              <span className="flex items-center text-slate-300">
                <span className="w-3 h-3 rounded bg-teal-400 mr-1.5"></span> Outbound
              </span>
            </div>
          </div>

          {/* Visual Traffic Bar Chart */}
          <div className="h-52 w-full pt-4 flex items-end justify-between gap-2 border-b border-slate-800 pb-2">
            {[
              { hour: '08:00', in: 18, out: 24 },
              { hour: '09:00', in: 34, out: 41 },
              { hour: '10:00', in: 52, out: 60 },
              { hour: '11:00', in: 48, out: 54 },
              { hour: '12:00', in: 26, out: 30 },
              { hour: '13:00', in: 64, out: 72 },
              { hour: '14:00', in: 78, out: 85 },
              { hour: '15:00', in: 55, out: 59 },
              { hour: '16:00', in: 42, out: 46 },
              { hour: '17:00', in: 30, out: 33 },
            ].map((col, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 h-36">
                  {/* Inbound Bar */}
                  <div
                    style={{ height: `${(col.in / 85) * 100}%` }}
                    className="w-3.5 bg-emerald-500 rounded-t-sm group-hover:brightness-120 transition-all relative"
                    title={`Pesan Masuk: ${col.in}`}
                  />
                  {/* Outbound Bar */}
                  <div
                    style={{ height: `${(col.out / 85) * 100}%` }}
                    className="w-3.5 bg-teal-400 rounded-t-sm group-hover:brightness-120 transition-all"
                    title={`Pesan Keluar: ${col.out}`}
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-2 font-mono">{col.hour}</span>
              </div>
            ))}
          </div>

          {/* Quick Metrics Footer */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Jam Puncak (Peak)</span>
              <span className="font-bold text-white text-sm">14:00 - 15:00</span>
            </div>
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Tingkat Penyelesaian</span>
              <span className="font-bold text-emerald-400 text-sm">{resolutionRate}% Resolved</span>
            </div>
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Respon Otomatis Bot</span>
              <span className="font-bold text-teal-400 text-sm">64 Terjawab Instan</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Activity Feed */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Live Feed Aktivitas Pesan</span>
              </h2>
              <span className="text-[11px] text-slate-500">Real-time</span>
            </div>

            <div className="space-y-3">
              {recentEvents.map((msg) => {
                const isCustomer = msg.senderType === 'customer';
                const isBot = msg.senderType === 'bot';
                return (
                  <div
                    key={msg.id}
                    onClick={() => {
                      setSelectedChatId(msg.chatId);
                      setActivePage('chat');
                    }}
                    className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 cursor-pointer transition text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 font-semibold">
                        {isCustomer ? (
                          <span className="text-emerald-400">👤 {msg.senderName}</span>
                        ) : isBot ? (
                          <span className="text-teal-400 flex items-center">
                            <Bot className="w-3 h-3 mr-0.5" /> AutoBot
                          </span>
                        ) : (
                          <span className="text-purple-400">🎧 {msg.senderName}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-300 line-clamp-1 text-[11px]">
                      {msg.content || `[${msg.messageType}]`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setActivePage('chat')}
            className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold text-xs rounded-xl border border-emerald-500/30 transition text-center mt-3"
          >
            Buka Live Chat Inbox →
          </button>
        </div>
      </div>
    </div>
  );
};
