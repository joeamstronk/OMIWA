import React, { useState } from 'react';
import {
  Bot,
  FileCode,
  PlusCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  Trash2,
  Edit2,
  Smartphone,
  Send,
  Zap,
  Info,
  X,
  Check,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AutoResponseRule, MessageTemplate } from '../../types';
import { WhatsAppGatewayService } from '../../services/whatsappGateway';

export const SettingsPage: React.FC = () => {
  const {
    autoResponses,
    addAutoResponseRule,
    updateAutoResponseRule,
    deleteAutoResponseRule,
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    sessions,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'auto_response' | 'templates'>('auto_response');

  // Modal State for Auto-Response Rule
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleFormData, setRuleFormData] = useState({
    title: '',
    triggerType: 'keyword' as AutoResponseRule['triggerType'],
    keywordsStr: '',
    matchType: 'contains' as AutoResponseRule['matchType'],
    responseText: '',
    isActive: true,
    channelIds: ['all'],
  });

  // Modal State for Message Template
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateFormData, setTemplateFormData] = useState({
    title: '',
    category: 'customer_support' as MessageTemplate['category'],
    language: 'id',
    headerText: '',
    bodyText: '',
    footerText: '',
    quickRepliesStr: '',
    status: 'approved' as MessageTemplate['status'],
  });

  // Interactive Auto-Response Sandbox Tester State
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<{
    matched: boolean;
    ruleTitle?: string;
    replyText?: string;
  } | null>(null);

  // Handle Testing Auto-Response
  const handleTestAutoResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    const evaluation = WhatsAppGatewayService.evaluateAutoResponse(
      testInput,
      autoResponses,
      'all',
      'Pelanggan Tester'
    );

    if (evaluation.matched && evaluation.replyText) {
      setTestResult({
        matched: true,
        ruleTitle: evaluation.rule?.title,
        replyText: evaluation.replyText,
      });
    } else {
      setTestResult({
        matched: false,
        replyText: 'Tidak ada aturan kata kunci yang cocok dengan teks tersebut.',
      });
    }
  };

  // Open Add Rule
  const handleOpenAddRule = () => {
    setEditingRuleId(null);
    setRuleFormData({
      title: '',
      triggerType: 'keyword',
      keywordsStr: '',
      matchType: 'contains',
      responseText: '',
      isActive: true,
      channelIds: ['all'],
    });
    setIsRuleModalOpen(true);
  };

  // Save Rule
  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    const keywords = ruleFormData.keywordsStr
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    if (editingRuleId) {
      updateAutoResponseRule(editingRuleId, {
        title: ruleFormData.title,
        triggerType: ruleFormData.triggerType,
        keywords,
        matchType: ruleFormData.matchType,
        responseText: ruleFormData.responseText,
        isActive: ruleFormData.isActive,
      });
    } else {
      addAutoResponseRule({
        title: ruleFormData.title,
        triggerType: ruleFormData.triggerType,
        keywords,
        matchType: ruleFormData.matchType,
        responseText: ruleFormData.responseText,
        isActive: ruleFormData.isActive,
        channelIds: ruleFormData.channelIds,
      });
    }
    setIsRuleModalOpen(false);
  };

  // Save Template
  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const quickReplies = templateFormData.quickRepliesStr
      .split(',')
      .map((q) => q.trim())
      .filter(Boolean);

    addTemplate({
      title: templateFormData.title,
      category: templateFormData.category,
      language: templateFormData.language,
      headerText: templateFormData.headerText || undefined,
      bodyText: templateFormData.bodyText,
      footerText: templateFormData.footerText || undefined,
      quickReplies,
      variables: ['customer_name', 'order_id'],
      status: 'approved',
    });
    setIsTemplateModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Pengaturan Otomasi & Template Pesan
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Konfigurasi respon otomatis bot cerdas (Auto-responder) dan template pesan terverifikasi
            WhatsApp untuk tim Call Center.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('auto_response')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'auto_response'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Respon Otomatis (Bot)</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'templates'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Template Pesan ({templates.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Automated Responses */}
      {activeTab === 'auto_response' && (
        <div className="space-y-6">
          {/* Top Actions & Sandbox Tester */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Auto Responder Rules List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span>Daftar Aturan Respon Otomatis ({autoResponses.length})</span>
                </h2>
                <button
                  onClick={handleOpenAddRule}
                  className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-md transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Tambah Aturan Baru</span>
                </button>
              </div>

              <div className="space-y-3">
                {autoResponses.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            rule.isActive
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-sm text-white">{rule.title}</h3>
                            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">
                              Tipe: {rule.triggerType}
                            </span>
                          </div>
                          {rule.triggerType === 'keyword' && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              <span className="text-[10px] text-slate-500">Kata kunci:</span>
                              {rule.keywords.map((kw, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 px-1.5 rounded font-mono"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Toggle & Delete */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            updateAutoResponseRule(rule.id, { isActive: !rule.isActive })
                          }
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                            rule.isActive
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {rule.isActive ? 'Aktif' : 'Nonaktif'}
                        </button>
                        <button
                          onClick={() => deleteAutoResponseRule(rule.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Response Text Box */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                      {rule.responseText}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 1 Col: Live Sandbox Tester */}
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Uji Respon Bot (Sandbox)</span>
                  </h3>
                  <span className="text-[10px] text-slate-500">Live Test</span>
                </div>
                <p className="text-xs text-slate-400">
                  Ketik kalimat pertanyaan pelanggan untuk melihat aturan auto-responder mana yang
                  cocok dan langsung membalas.
                </p>

                <form onSubmit={handleTestAutoResponse} className="space-y-3">
                  <input
                    type="text"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Contoh: halo min, berapa pricelist nya?"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    Uji Kecocokan Aturan
                  </button>
                </form>

                {/* Test Output Box */}
                {testResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs space-y-1.5 transition ${
                      testResult.matched
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>
                        {testResult.matched ? '✅ Aturan Ditemukan:' : '❌ Tidak Ada Aturan'}
                      </span>
                      {testResult.ruleTitle && (
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {testResult.ruleTitle}
                        </span>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed text-[11px] pt-1">
                      {testResult.replyText}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Message Templates */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>Katalog Template Pesan WhatsApp Quick Reply</span>
              </h2>
              <p className="text-xs text-slate-400">
                Template pre-approved untuk efisiensi komunikasi agen Call Center.
              </p>
            </div>
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Buat Template Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-sm text-white">{tpl.title}</h3>
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono text-emerald-400">
                        Kategori: {tpl.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                      {tpl.status}
                    </span>
                  </div>

                  {/* Header text if present */}
                  {tpl.headerText && (
                    <div className="text-xs font-bold text-slate-200 mb-1">
                      {tpl.headerText}
                    </div>
                  )}

                  {/* Body Box */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {tpl.bodyText}
                  </div>

                  {/* Quick Replies chips */}
                  {tpl.quickReplies && tpl.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tpl.quickReplies.map((reply, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 px-2.5 py-1 rounded-lg font-medium flex items-center"
                        >
                          ↩️ {reply}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-500">
                  <span>Digunakan {tpl.usageCount} kali</span>
                  <button
                    onClick={() => deleteTemplate(tpl.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                    title="Hapus template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Auto-Response Rule */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <button
              onClick={() => setIsRuleModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Tambah Aturan Respon Otomatis</h3>
            <p className="text-xs text-slate-400 mb-4">
              Pesan balasan akan otomatis dikirim saat pesan pelanggan mengandung kata kunci yang ditentukan.
            </p>

            <form onSubmit={handleSaveRule} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Judul Aturan</label>
                <input
                  type="text"
                  required
                  value={ruleFormData.title}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, title: e.target.value })}
                  placeholder="Misal: Info Jadwal Operasional & Lokasi"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Kata Kunci Pemicu (pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  required
                  value={ruleFormData.keywordsStr}
                  onChange={(e) =>
                    setRuleFormData({ ...ruleFormData, keywordsStr: e.target.value })
                  }
                  placeholder="lokasi, kantor, alamat, buka jam, operational"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Pesan Balasan Otomatis
                </label>
                <textarea
                  rows={4}
                  required
                  value={ruleFormData.responseText}
                  onChange={(e) =>
                    setRuleFormData({ ...ruleFormData, responseText: e.target.value })
                  }
                  placeholder="Gunakan {{customer_name}} untuk menyapa nama pelanggan."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md"
                >
                  Simpan Aturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Message Template */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <button
              onClick={() => setIsTemplateModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Buat Template Pesan Baru</h3>
            <p className="text-xs text-slate-400 mb-4">
              Dapat langsung disisipkan oleh agen Call Center saat percakapan berlangsung.
            </p>

            <form onSubmit={handleSaveTemplate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Judul Template</label>
                <input
                  type="text"
                  required
                  value={templateFormData.title}
                  onChange={(e) =>
                    setTemplateFormData({ ...templateFormData, title: e.target.value })
                  }
                  placeholder="Misal: Konfirmasi Pengiriman Pesanan"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Kategori</label>
                  <select
                    value={templateFormData.category}
                    onChange={(e) =>
                      setTemplateFormData({ ...templateFormData, category: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="customer_support">Customer Support</option>
                    <option value="sales">Sales & Leads</option>
                    <option value="marketing">Marketing</option>
                    <option value="notifications">Notifikasi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Header (Opsional)</label>
                  <input
                    type="text"
                    value={templateFormData.headerText}
                    onChange={(e) =>
                      setTemplateFormData({ ...templateFormData, headerText: e.target.value })
                    }
                    placeholder="📦 Notifikasi Pengiriman"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Isi Pesan (Body)</label>
                <textarea
                  rows={4}
                  required
                  value={templateFormData.bodyText}
                  onChange={(e) =>
                    setTemplateFormData({ ...templateFormData, bodyText: e.target.value })
                  }
                  placeholder="Halo {{customer_name}}, pesanan {{order_id}} sedang diproses."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Tombol Quick Replies (pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={templateFormData.quickRepliesStr}
                  onChange={(e) =>
                    setTemplateFormData({ ...templateFormData, quickRepliesStr: e.target.value })
                  }
                  placeholder="Lacak Paket, Hubungi Agen"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md"
                >
                  Simpan Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
