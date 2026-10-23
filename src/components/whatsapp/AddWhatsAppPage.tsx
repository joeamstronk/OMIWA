import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Smartphone,
  PlusCircle,
  RefreshCw,
  PowerOff,
  BatteryCharging,
  BatteryMedium,
  CheckCircle2,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Radio,
  Send,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WhatsAppSession } from '../../types';

export const AddWhatsAppPage: React.FC = () => {
  const {
    sessions,
    createWhatsAppSession,
    simulateScanPairing,
    simulatePairingCodeLink,
    refreshSessionQR,
    disconnectSession,
    reconnectSession,
    deleteSession,
    currentUser,
    setActivePage,
  } = useApp();

  // Modal / Wizard for Connecting New Session
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+62 8');
  const [activeTab, setActiveTab] = useState<'qr' | 'code'>('qr');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // QR Refresh Countdown timer (20s)
  const [qrCountdown, setQrCountdown] = useState(20);
  const [isScanning, setIsScanning] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Active session being paired in modal
  const targetSession = sessions.find((s) => s.id === selectedSessionId) || sessions[sessions.length - 1];

  // Auto decrement countdown
  useEffect(() => {
    if (!isConnectModalOpen || targetSession?.status === 'connected') return;

    const timer = setInterval(() => {
      setQrCountdown((prev) => {
        if (prev <= 1) {
          if (targetSession) {
            refreshSessionQR(targetSession.id);
          }
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isConnectModalOpen, targetSession]);

  const handleStartConnectNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionName || !phoneNumber) return;

    const newId = await createWhatsAppSession(sessionName, phoneNumber);
    setSelectedSessionId(newId);
    setQrCountdown(20);
  };

  const handleSimulateScan = async (sessionId: string) => {
    setIsScanning(true);
    await simulateScanPairing(sessionId);
    setIsScanning(false);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Tautkan Nomor WhatsApp (Multi-Device Gateway)
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              {sessions.filter((s) => s.status === 'connected').length} Terhubung
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pindai kode QR WhatsApp Web untuk menghubungkan nomor WhatsApp bisnis Anda langsung ke server.
            Mendukung multi-nomor secara simultan.
          </p>
        </div>

        <button
          onClick={() => {
            setSessionName(`WhatsApp Line #${sessions.length + 1}`);
            setPhoneNumber(`+62 81${Math.floor(Math.random() * 89 + 10)}-${Math.floor(Math.random() * 8999 + 1000)}`);
            setSelectedSessionId(null);
            setIsConnectModalOpen(true);
          }}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-medium text-xs shadow-lg shadow-emerald-900/30 transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tambah Nomor WhatsApp Baru</span>
        </button>
      </div>

      {/* Main Grid: Connected Sessions & QR Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Configured WhatsApp Sessions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Daftar Sesi WhatsApp Terdaftar di Server ({sessions.length})</span>
            </h2>
            <span className="text-[11px] text-slate-400">Multi-Channel Active</span>
          </div>

          <div className="space-y-4">
            {sessions.map((session) => {
              const isConnected = session.status === 'connected';
              const isPairing = session.status === 'pairing';
              const isReady = session.status === 'qr_ready';

              return (
                <div
                  key={session.id}
                  className={`p-5 rounded-2xl bg-slate-900 border transition relative ${
                    isConnected
                      ? 'border-slate-800 hover:border-slate-700'
                      : 'border-amber-500/40 bg-slate-900/90 shadow-md ring-1 ring-amber-500/20'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start space-x-3.5">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          isConnected
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {isConnected ? (
                          <Smartphone className="w-6 h-6" />
                        ) : (
                          <QrCode className="w-6 h-6 animate-pulse" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-base text-white">{session.name}</h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              isConnected
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : isPairing
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {session.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm font-mono text-emerald-400 font-semibold mt-0.5">
                          {session.phoneNumber}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Nama Profil WA: <strong className="text-slate-200">{session.pushName}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Quick Status / Actions */}
                    <div className="flex items-center space-x-2 sm:self-center">
                      {isConnected ? (
                        <>
                          <button
                            onClick={() => setActivePage('chat')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
                          >
                            Buka Chat
                          </button>
                          <button
                            onClick={() => disconnectSession(session.id)}
                            className="p-2 text-slate-400 hover:text-amber-400 rounded-xl hover:bg-slate-800 transition"
                            title="Putuskan Sesi WhatsApp (Disconnect)"
                          >
                            <PowerOff className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedSessionId(session.id);
                            setIsConnectModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-1"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Pindai QR Sekarang</span>
                        </button>
                      )}

                      <button
                        onClick={() => deleteSession(session.id)}
                        className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition"
                        title="Hapus Sesi dari Server"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Device Metadata Info */}
                  <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Sistem Operasi</span>
                      <span className="font-semibold text-slate-200 truncate block">
                        {session.deviceInfo.platform}
                      </span>
                    </div>

                    <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Baterai Perangkat</span>
                      <span className="font-semibold text-slate-200 flex items-center">
                        {session.deviceInfo.isCharging ? (
                          <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                        ) : (
                          <BatteryMedium className="w-3.5 h-3.5 text-slate-400 mr-1" />
                        )}
                        {session.deviceInfo.battery}%
                      </span>
                    </div>

                    <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Pesan Masuk Hari Ini</span>
                      <span className="font-semibold text-emerald-400">
                        {session.totalReceivedToday} Pesan
                      </span>
                    </div>

                    <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Pesan Keluar Hari Ini</span>
                      <span className="font-semibold text-teal-400">
                        {session.totalSentToday} Pesan
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Column: Quick Interactive Scanner Preview Box */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>Quick Scan Simulator</span>
              </h2>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                Live Gateway
              </span>
            </div>

            {targetSession ? (
              <div className="space-y-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
                  {targetSession.status === 'connected' ? (
                    <div className="py-8 space-y-3">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Perangkat Telah Terhubung!</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {targetSession.name} ({targetSession.phoneNumber})
                        </p>
                      </div>
                      <button
                        onClick={() => disconnectSession(targetSession.id)}
                        className="text-xs text-rose-400 hover:underline pt-2"
                      >
                        Uji Putuskan Sesi (Test Re-scan)
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="relative p-2 bg-white rounded-xl shadow-inner">
                        <img
                          src={targetSession.qrCodeData}
                          alt="WhatsApp Web QR Code"
                          className="w-48 h-48 rounded object-contain"
                        />
                        {isScanning && (
                          <div className="absolute inset-0 bg-emerald-900/80 backdrop-blur-xs rounded flex flex-col items-center justify-center text-white">
                            <RefreshCw className="w-7 h-7 animate-spin text-emerald-400 mb-2" />
                            <span className="text-xs font-semibold">Menghubungkan HP...</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex items-center space-x-1.5 text-xs text-slate-400">
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                        <span>Refresh otomatis dalam: </span>
                        <strong className="text-white font-mono">{qrCountdown}s</strong>
                      </div>

                      <button
                        onClick={() => handleSimulateScan(targetSession.id)}
                        disabled={isScanning}
                        className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-900/30 transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Simulasi Pindai QR di Ponsel</span>
                      </button>
                    </>
                  )}
                </div>

                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                  <div className="font-semibold text-slate-300 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Petunjuk Menghubungkan:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 pl-1">
                    <li>Buka aplikasi WhatsApp di HP</li>
                    <li>Ketuk Menu ⋮ atau Settings ⚙️</li>
                    <li>Pilih <strong>Perangkat Tertaut (Linked Devices)</strong></li>
                    <li>Arahkan kamera ke kode QR di atas</li>
                  </ol>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Pilih sesi untuk melihat kode QR.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Connect New WhatsApp Session Wizard */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl p-6 relative">
            <button
              onClick={() => setIsConnectModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {!selectedSessionId ? (
              // Step 1: Input Session Details
              <form onSubmit={handleStartConnectNew} className="space-y-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Tautkan Nomor WhatsApp Baru</h3>
                    <p className="text-xs text-slate-400">
                      Masukkan identitas nomor yang ingin diintegrasikan ke server.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nama Saluran / Departemen
                  </label>
                  <input
                    type="text"
                    required
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="Contoh: Customer Care VIP Line #2"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nomor WhatsApp (dengan kode negara)
                  </label>
                  <input
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+62 812-3456-7890"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsConnectModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/30 flex items-center space-x-1.5"
                  >
                    <span>Lanjut ke Kode QR</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              // Step 2: Show QR Code / Pairing Code
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white">Hubungkan WhatsApp</h3>
                    <p className="text-xs text-emerald-400 font-mono">
                      {targetSession?.name} ({targetSession?.phoneNumber})
                    </p>
                  </div>
                  <div className="flex bg-slate-800 p-1 rounded-xl text-xs">
                    <button
                      onClick={() => setActiveTab('qr')}
                      className={`px-3 py-1 rounded-lg font-medium transition ${
                        activeTab === 'qr' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Pindai QR
                    </button>
                    <button
                      onClick={() => setActiveTab('code')}
                      className={`px-3 py-1 rounded-lg font-medium transition ${
                        activeTab === 'code' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Kode Pairing
                    </button>
                  </div>
                </div>

                {targetSession?.status === 'connected' ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>
                    <h4 className="text-lg font-bold text-white">
                      Berhasil Terhubung ke Server!
                    </h4>
                    <p className="text-xs text-slate-300 max-w-sm mx-auto">
                      Nomor {targetSession.phoneNumber} kini aktif dan siap menerima serta membalas
                      pesan WhatsApp dari pelanggan.
                    </p>
                    <div className="pt-3">
                      <button
                        onClick={() => {
                          setIsConnectModalOpen(false);
                          setActivePage('chat');
                        }}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/40"
                      >
                        Buka Live Chat Inbox Sekarang
                      </button>
                    </div>
                  </div>
                ) : activeTab === 'qr' ? (
                  <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
                    {/* QR Preview */}
                    <div className="p-3 bg-white rounded-2xl shadow-xl shrink-0 relative">
                      <img
                        src={targetSession?.qrCodeData}
                        alt="WhatsApp QR"
                        className="w-52 h-52 rounded object-contain"
                      />
                      {isScanning && (
                        <div className="absolute inset-0 bg-emerald-900/80 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center text-white">
                          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mb-2" />
                          <span className="text-xs font-semibold">Tautan Diproses...</span>
                        </div>
                      )}
                    </div>

                    {/* Step Guide & Simulation Action */}
                    <div className="space-y-3 text-xs text-slate-300">
                      <h4 className="font-bold text-white text-sm">Langkah Tautan di Ponsel:</h4>
                      <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                        <li>Buka WhatsApp di ponsel Anda</li>
                        <li>Buka Menu <strong>Linked Devices</strong> (Perangkat Tertaut)</li>
                        <li>Ketuk tombol <strong>Link a Device</strong></li>
                        <li>Arahkan kamera ke kode QR ini</li>
                      </ol>

                      <div className="pt-2">
                        <button
                          onClick={() => handleSimulateScan(targetSession!.id)}
                          disabled={isScanning}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/40 transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Zap className="w-4 h-4" />
                          <span>Simulasi Pindai QR Sekarang</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Pairing Code Tab (8-character pairing code)
                  <div className="py-4 space-y-4 text-center">
                    <p className="text-xs text-slate-400">
                      Masukkan kode pairing ini di aplikasi WhatsApp Anda (Linked Devices &gt; Link with phone number instead):
                    </p>
                    <div className="flex items-center justify-center space-x-3">
                      <span className="font-mono text-3xl font-extrabold tracking-widest text-emerald-400 bg-slate-950 px-6 py-3 rounded-2xl border border-slate-800">
                        {targetSession?.pairingCode || '9482-1102'}
                      </span>
                      <button
                        onClick={() => handleCopyCode(targetSession?.pairingCode || '9482-1102')}
                        className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                        title="Salin Kode"
                      >
                        {copiedCode ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>

                    <button
                      onClick={() => simulatePairingCodeLink(targetSession!.id, targetSession?.pairingCode || '')}
                      className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
                    >
                      Konfirmasi Kode di HP (Simulasi)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
