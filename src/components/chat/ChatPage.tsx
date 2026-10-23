import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Filter,
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Mic,
  MapPin,
  Bot,
  User as UserIcon,
  Check,
  CheckCheck,
  Clock,
  MoreVertical,
  ChevronDown,
  Phone,
  Sparkles,
  Zap,
  Play,
  Pause,
  Tag,
  StickyNote,
  X,
  MessageSquare,
  Smile,
  ShieldAlert,
  Headphones,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatConversation, Message, MessageType } from '../../types';
import { MediaViewerModal } from './MediaViewerModal';

export const ChatPage: React.FC = () => {
  const {
    chats,
    messages,
    sessions,
    users,
    currentUser,
    selectedChatId,
    setSelectedChatId,
    sendMessage,
    simulateIncomingCustomerMessage,
    assignAgentToChat,
    updateChatStatus,
    markChatAsRead,
    templates,
  } = useApp();

  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'assigned_me' | 'pending' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active chat state
  const [inputText, setInputText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);

  // Audio playing simulation
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Lightbox
  const [previewMedia, setPreviewMedia] = useState<{ url: string; name?: string } | null>(null);

  // Auto scroll to bottom of chat
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find((c) => c.id === selectedChatId) || chats[0];

  useEffect(() => {
    if (activeChat && activeChat.unreadCount > 0) {
      markChatAsRead(activeChat.id);
    }
  }, [activeChat?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChatId]);

  // Audio simulator toggle
  const togglePlayAudio = (msgId: string) => {
    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(msgId);
      setTimeout(() => {
        setPlayingAudioId(null);
      }, 5000); // Stop after 5s simulation
    }
  };

  // Filter conversations
  const filteredChats = chats.filter((chat) => {
    // Channel filter
    if (channelFilter !== 'all' && chat.channelId !== channelFilter) return false;

    // Status filter
    if (statusFilter === 'unread' && chat.unreadCount === 0) return false;
    if (statusFilter === 'assigned_me' && chat.assignedAgentId !== currentUser?.id) return false;
    if (statusFilter === 'pending' && chat.status !== 'pending') return false;
    if (statusFilter === 'resolved' && chat.status !== 'resolved') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = chat.customerName.toLowerCase().includes(q);
      const matchPhone = chat.customerPhone.includes(q);
      const matchLastMsg = chat.lastMessage?.content?.toLowerCase().includes(q);
      return matchName || matchPhone || matchLastMsg;
    }

    return true;
  });

  // Messages for active chat
  const chatMessages = messages.filter((m) => m.chatId === activeChat?.id);

  // Handle Send text message or internal note
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const text = inputText.trim();
    setInputText('');

    await sendMessage(activeChat.id, text, {
      isInternalNote,
      messageType: isInternalNote ? 'note' : 'text',
    });
  };

  // Handle quick media sends
  const handleSendMedia = async (type: MessageType) => {
    if (!activeChat) return;
    setShowAttachmentMenu(false);

    if (type === 'image') {
      await sendMessage(activeChat.id, 'Berikut foto katalog produk dan spesifikasi resminya 📸', {
        messageType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        mediaFileName: 'katalog_produk_terbaru.jpg',
        mediaFileSize: '1.2 MB',
      });
    } else if (type === 'audio') {
      await sendMessage(activeChat.id, 'Voice note dari agen (0:12s)', {
        messageType: 'audio',
        mediaDuration: 12,
        mediaUrl: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
      });
    } else if (type === 'document') {
      await sendMessage(activeChat.id, 'Dokumen Penawaran Resmi PT Omni Multi Solusi.pdf', {
        messageType: 'document',
        mediaFileName: 'Proposal_Penawaran_Resmi_2026.pdf',
        mediaFileSize: '2.4 MB',
        mediaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      });
    } else if (type === 'location') {
      await sendMessage(activeChat.id, 'Lokasi Layanan Customer Care SCBD', {
        messageType: 'location',
        locationData: {
          latitude: -6.2244,
          longitude: 106.8097,
          name: 'OmniWatsApp Surveillance Customer Experience Center',
          address: 'SCBD Sudirman District 8, Lt. 24, Jakarta Selatan',
        },
      });
    }
  };

  // Handle sending approved template
  const handleSendTemplate = async (templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl || !activeChat) return;

    let content = tpl.bodyText
      .replace(/{{customer_name}}/g, activeChat.customerName)
      .replace(/{{order_id}}/g, 'ORD-99120')
      .replace(/{{courier_name}}/g, 'J&T Express')
      .replace(/{{issue_topic}}/g, 'Koneksi Server')
      .replace(/{{agent_name}}/g, currentUser?.name || 'Call Center')
      .replace(/{{period}}/g, 'Oktober 2026')
      .replace(/{{amount}}/g, '1.490.000')
      .replace(/{{due_date}}/g, '28 Okt 2026');

    setShowTemplatePicker(false);

    await sendMessage(activeChat.id, content, {
      messageType: 'template',
      templateData: {
        templateId: tpl.id,
        title: tpl.title,
        variables: { customer_name: activeChat.customerName },
      },
    });
  };

  // Simulate customer replying to this active chat
  const handleSimulateCustomerReply = async () => {
    if (!activeChat) return;
    const sampleReplies = [
      'Terima kasih infonya min, sangat jelas sekali! 🙏',
      'Baik saya coba transfer sekarang ya kak.',
      'Berapa lama estimasi sampai ke alamat kantor kami di Bandung?',
      'Bisa tolong minta invoice format PDF dikirimkan ke email juga?',
      'Halo, apakah saya bisa bicara langsung dengan supervisor agen?',
    ];
    const reply = sampleReplies[Math.floor(Math.random() * sampleReplies.length)];

    await simulateIncomingCustomerMessage({
      senderName: activeChat.customerName,
      senderPhone: activeChat.customerPhone,
      text: reply,
      avatar: activeChat.customerAvatar,
      channelId: activeChat.channelId,
    });
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-slate-950">
      {/* Lightbox for Image Preview */}
      {previewMedia && (
        <MediaViewerModal
          mediaUrl={previewMedia.url}
          fileName={previewMedia.name}
          onClose={() => setPreviewMedia(null)}
        />
      )}

      {/* Left Sidebar: Conversations List */}
      <div className="w-80 md:w-96 border-r border-slate-800 bg-slate-900/90 flex flex-col shrink-0">
        {/* Channel Selector Header */}
        <div className="p-3 border-b border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Saluran WhatsApp
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">
              {filteredChats.length} Chat
            </span>
          </div>

          <div className="relative">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">🌐 Semua Saluran WhatsApp ({sessions.length})</option>
              {sessions.map((sess) => (
                <option key={sess.id} value={sess.id}>
                  📱 {sess.name} ({sess.phoneNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pelanggan, nomor, atau pesan..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'unread', label: 'Belum Dibaca' },
              { id: 'assigned_me', label: 'Tugas Saya' },
              { id: 'pending', label: 'Pending' },
              { id: 'resolved', label: 'Selesai' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  statusFilter === tab.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat List Scroll Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
          {filteredChats.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
              <p>Tidak ada percakapan yang cocok dengan filter.</p>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isSelected = activeChat?.id === chat.id;
              const session = sessions.find((s) => s.id === chat.channelId);

              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`p-3.5 flex items-start space-x-3 cursor-pointer transition relative group ${
                    isSelected
                      ? 'bg-emerald-950/40 border-l-4 border-emerald-500'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={chat.customerAvatar}
                      alt={chat.customerName}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-800"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                        chat.status === 'active'
                          ? 'bg-emerald-500'
                          : chat.status === 'pending'
                          ? 'bg-amber-500'
                          : 'bg-slate-500'
                      }`}
                    />
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-xs font-bold text-white truncate max-w-[130px]">
                        {chat.customerName}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(chat.updatedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 mb-1">
                      <span className="text-[10px] text-emerald-400 font-mono font-medium">
                        {chat.customerPhone}
                      </span>
                      <span className="text-[9px] bg-slate-800 px-1 rounded text-slate-400 truncate max-w-[80px]">
                        {session?.phoneNumber || 'WA'}
                      </span>
                    </div>

                    {/* Last message preview */}
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-slate-400 truncate max-w-[170px] flex items-center">
                        {chat.lastMessage?.senderType === 'agent' && (
                          <span className="text-emerald-400 mr-1 font-semibold">Anda:</span>
                        )}
                        {chat.lastMessage?.senderType === 'bot' && (
                          <span className="text-teal-400 mr-1 font-semibold">Bot:</span>
                        )}
                        {chat.lastMessage?.messageType === 'image' && '📷 Foto'}
                        {chat.lastMessage?.messageType === 'audio' && '🎤 Voice note'}
                        {chat.lastMessage?.messageType === 'document' && '📄 Dokumen'}
                        {chat.lastMessage?.messageType === 'location' && '📍 Lokasi'}
                        {chat.lastMessage?.messageType === 'note' && '📝 Catatan internal'}
                        {(chat.lastMessage?.messageType === 'text' ||
                          chat.lastMessage?.messageType === 'template') &&
                          chat.lastMessage?.content}
                      </p>

                      {/* Unread badge */}
                      {chat.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 animate-pulse">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Agent Assigned Tag */}
                    {chat.assignedAgentName && (
                      <div className="mt-1 flex items-center space-x-1 text-[10px] text-purple-300">
                        <Headphones className="w-2.5 h-2.5" />
                        <span className="truncate max-w-[120px]">{chat.assignedAgentName}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Center: Live Chat Window */}
      {activeChat ? (
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
          {/* Chat Header */}
          <div className="h-16 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3 min-w-0">
              <img
                src={activeChat.customerAvatar}
                alt={activeChat.customerName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
              />
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm text-white truncate">
                    {activeChat.customerName}
                  </h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      activeChat.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : activeChat.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {activeChat.status}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span className="font-mono text-emerald-400">{activeChat.customerPhone}</span>
                  <span>•</span>
                  <span className="truncate">Via {activeChat.channelName}</span>
                </div>
              </div>
            </div>

            {/* Header Right Controls */}
            <div className="flex items-center space-x-2">
              {/* Simulate Inbound Message button */}
              <button
                onClick={handleSimulateCustomerReply}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs px-3 py-1.5 rounded-xl border border-slate-700 transition"
                title="Simulasi pelanggan membalas pesan ini langsung ke server"
              >
                <Zap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Simulasi Balasan Pelanggan</span>
              </button>

              {/* Status Selector */}
              <select
                value={activeChat.status}
                onChange={(e) => updateChatStatus(activeChat.id, e.target.value as any)}
                className="text-xs bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="active">Status: Active</option>
                <option value="pending">Status: Pending</option>
                <option value="resolved">Status: Resolved</option>
              </select>

              {/* Assigned Agent Selector */}
              <select
                value={activeChat.assignedAgentId || ''}
                onChange={(e) => assignAgentToChat(activeChat.id, e.target.value)}
                className="text-xs bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer hidden md:block"
              >
                <option value="">Belum Ditugaskan</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    Tugaskan: {u.name} ({u.role === 'super_admin' ? 'Admin' : 'Call Center'})
                  </option>
                ))}
              </select>

              {/* Customer Profile Drawer Toggle */}
              <button
                onClick={() => setShowInfoDrawer(!showInfoDrawer)}
                className={`p-2 rounded-xl border transition ${
                  showInfoDrawer
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                }`}
                title="Info Pelanggan & Catatan CRM"
              >
                <UserIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Message Stream Area with WhatsApp Dotted/Wall Motif */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b141a] bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-slate-900/40 to-slate-950">
            {/* Encryption & Security Banner */}
            <div className="text-center py-1">
              <span className="inline-flex items-center text-[10px] text-amber-200/80 bg-amber-950/40 border border-amber-800/40 px-3 py-1 rounded-lg">
                🔒 Pesan dan panggilan terenkripsi end-to-end melalui OmniWatsApp Surveillance Gateway Server SCBD
              </span>
            </div>

            {chatMessages.map((msg) => {
              const isMe = msg.senderType === 'agent';
              const isBot = msg.senderType === 'bot';
              const isNote = msg.isInternalNote;

              // Internal Note rendering
              if (isNote) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <div className="max-w-md bg-amber-500/15 border border-amber-500/30 text-amber-200 px-4 py-2.5 rounded-xl text-xs space-y-1 shadow-sm">
                      <div className="flex items-center space-x-1.5 font-bold text-amber-300">
                        <StickyNote className="w-3.5 h-3.5" />
                        <span>Catatan Internal ({msg.senderName}):</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">{msg.content}</p>
                      <span className="text-[9px] text-amber-400/70 block text-right">
                        Hanya terlihat oleh agen call center & admin
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-lg rounded-2xl px-3.5 py-2.5 text-xs shadow-md space-y-1 relative ${
                      isMe
                        ? 'bg-emerald-700 text-white rounded-tr-none'
                        : isBot
                        ? 'bg-slate-800 border border-teal-500/40 text-slate-100 rounded-tl-none'
                        : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/60'
                    }`}
                  >
                    {/* Header for Bot or Agent */}
                    {(isBot || (isMe && msg.senderName)) && (
                      <div className="flex items-center space-x-1 text-[10px] font-semibold opacity-80 mb-0.5">
                        {isBot ? (
                          <span className="text-teal-300 flex items-center">
                            <Bot className="w-3 h-3 mr-0.5" /> {msg.senderName}
                          </span>
                        ) : (
                          <span className="text-emerald-200">{msg.senderName}</span>
                        )}
                      </div>
                    )}

                    {/* Media Types */}
                    {/* 1. Image */}
                    {msg.messageType === 'image' && msg.mediaUrl && (
                      <div className="space-y-1.5 pt-0.5">
                        <div
                          onClick={() =>
                            setPreviewMedia({ url: msg.mediaUrl!, name: msg.mediaFileName })
                          }
                          className="rounded-xl overflow-hidden cursor-pointer group relative"
                        >
                          <img
                            src={msg.mediaUrl}
                            alt="Attachment"
                            className="max-h-60 w-full object-cover rounded-xl group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] bg-black/70 text-white px-2 py-1 rounded">
                              Klik untuk perbesar
                            </span>
                          </div>
                        </div>
                        {msg.content && <p className="leading-relaxed">{msg.content}</p>}
                      </div>
                    )}

                    {/* 2. Audio Voice Note */}
                    {msg.messageType === 'audio' && (
                      <div className="flex items-center space-x-3 py-1 min-w-[220px]">
                        <button
                          onClick={() => togglePlayAudio(msg.id)}
                          className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition shrink-0"
                        >
                          {playingAudioId === msg.id ? (
                            <Pause className="w-4 h-4 fill-white" />
                          ) : (
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          )}
                        </button>

                        <div className="flex-1 space-y-1">
                          {/* Animated Waveform */}
                          <div className="flex items-center space-x-0.5 h-4">
                            {[12, 18, 8, 22, 14, 26, 18, 10, 24, 16, 20, 12, 28, 14].map((h, i) => (
                              <span
                                key={i}
                                style={{ height: `${h}px` }}
                                className={`w-1 rounded-full transition-all ${
                                  playingAudioId === msg.id
                                    ? 'bg-white animate-pulse'
                                    : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="flex justify-between text-[10px] opacity-80 font-mono">
                            <span>{playingAudioId === msg.id ? 'Memutar...' : 'Voice Note'}</span>
                            <span>{msg.mediaDuration ? `0:${msg.mediaDuration}s` : '0:14s'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. Document PDF */}
                    {msg.messageType === 'document' && (
                      <div className="p-2.5 bg-black/20 rounded-xl border border-white/10 flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs truncate">
                            {msg.mediaFileName || msg.content}
                          </p>
                          <span className="text-[10px] opacity-75">{msg.mediaFileSize || '1.8 MB'} • PDF</span>
                        </div>
                        <a
                          href={msg.mediaUrl || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 hover:bg-white/10 rounded text-white"
                          title="Download Dokumen"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    )}

                    {/* 4. Location Pin */}
                    {msg.messageType === 'location' && msg.locationData && (
                      <div className="rounded-xl overflow-hidden bg-black/20 border border-white/10 space-y-2 pb-2">
                        <div className="h-28 bg-emerald-950 flex items-center justify-center relative">
                          <MapPin className="w-8 h-8 text-rose-400 animate-bounce" />
                          <span className="absolute bottom-1 right-2 text-[9px] bg-black/60 px-1.5 rounded text-slate-300">
                            Lat: {msg.locationData.latitude}, Lng: {msg.locationData.longitude}
                          </span>
                        </div>
                        <div className="px-2">
                          <h5 className="font-bold text-xs">{msg.locationData.name}</h5>
                          <p className="text-[10px] opacity-80">{msg.locationData.address}</p>
                        </div>
                      </div>
                    )}

                    {/* Standard Text or Template text */}
                    {(msg.messageType === 'text' || msg.messageType === 'template') && (
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    )}

                    {/* Meta info: Timestamp & Status Checkmarks */}
                    <div className="flex items-center justify-end space-x-1 text-[9px] opacity-75 pt-0.5">
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isMe && (
                        <span>
                          {msg.status === 'pending' && <Clock className="w-3 h-3 text-white/70" />}
                          {msg.status === 'sent' && <Check className="w-3 h-3 text-white/70" />}
                          {msg.status === 'delivered' && (
                            <CheckCheck className="w-3.5 h-3.5 text-white/70" />
                          )}
                          {msg.status === 'read' && (
                            <CheckCheck className="w-3.5 h-3.5 text-sky-300 font-bold" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Action / Send Input Bar */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2">
            {/* Top Toolbar: Mode Switch (Customer vs Internal Note) & Quick Templates */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsInternalNote(false)}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    !isInternalNote
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Kirim ke Pelanggan
                </button>
                <button
                  type="button"
                  onClick={() => setIsInternalNote(true)}
                  className={`px-3 py-1 rounded-lg font-medium flex items-center space-x-1 transition ${
                    isInternalNote
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                  }`}
                >
                  <StickyNote className="w-3 h-3" />
                  <span>Catatan Internal Agen</span>
                </button>
              </div>

              {/* Template Picker Toggle */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTemplatePicker(!showTemplatePicker)}
                  className="flex items-center space-x-1 text-slate-300 hover:text-emerald-400 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pilih Template ({templates.length})</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showTemplatePicker && (
                  <div className="absolute right-0 bottom-full mb-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 space-y-1 max-h-64 overflow-y-auto">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                      WhatsApp Quick Templates
                    </div>
                    {templates.map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => handleSendTemplate(tpl.id)}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-700 text-xs transition"
                      >
                        <div className="font-semibold text-white">{tpl.title}</div>
                        <p className="text-[10px] text-slate-400 truncate">{tpl.bodyText}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Input & Attachments Form */}
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2 relative">
              {/* Attachment Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                  title="Lampirkan Media (Foto, Dokumen, Voice Note, Lokasi)"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                {showAttachmentMenu && (
                  <div className="absolute left-0 bottom-full mb-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 space-y-1">
                    <button
                      type="button"
                      onClick={() => handleSendMedia('image')}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-700 rounded-lg"
                    >
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      <span>Kirim Gambar / Foto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMedia('audio')}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-700 rounded-lg"
                    >
                      <Mic className="w-4 h-4 text-purple-400" />
                      <span>Kirim Voice Note</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMedia('document')}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-700 rounded-lg"
                    >
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>Kirim Dokumen PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMedia('location')}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-700 rounded-lg"
                    >
                      <MapPin className="w-4 h-4 text-rose-400" />
                      <span>Kirim Pin Lokasi</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isInternalNote
                    ? 'Tulis catatan internal (hanya terlihat oleh tim agen)...'
                    : 'Ketik pesan balasan WhatsApp ke pelanggan...'
                }
                className={`flex-1 px-4 py-2.5 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
                  isInternalNote
                    ? 'bg-amber-950/20 border border-amber-500/40 focus:ring-amber-500'
                    : 'bg-slate-800 border border-slate-700 focus:ring-emerald-500'
                }`}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim()}
                className={`p-2.5 rounded-xl font-bold transition flex items-center justify-center ${
                  isInternalNote
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-40'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40'
                }`}
                title="Kirim (Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
          <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
          <h3 className="text-base font-bold text-slate-300">Pilih Percakapan untuk Memulai</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Gunakan panel kiri untuk memilih pesan pelanggan dari antrian WhatsApp server.
          </p>
        </div>
      )}

      {/* Right Drawer: Customer CRM Metadata */}
      {showInfoDrawer && activeChat && (
        <div className="w-72 border-l border-slate-800 bg-slate-900/95 p-4 flex flex-col shrink-0 space-y-5 overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Profil Pelanggan
            </h4>
            <button
              onClick={() => setShowInfoDrawer(false)}
              className="p-1 text-slate-400 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center space-y-2">
            <img
              src={activeChat.customerAvatar}
              alt={activeChat.customerName}
              className="w-16 h-16 rounded-full mx-auto object-cover ring-2 ring-emerald-500/40"
            />
            <div>
              <h5 className="font-bold text-sm text-white">{activeChat.customerName}</h5>
              <p className="text-xs font-mono text-emerald-400">{activeChat.customerPhone}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 block">Saluran Terhubung</span>
              <span className="font-semibold text-slate-200 block">{activeChat.channelName}</span>
              <span className="text-[10px] font-mono text-slate-400">{activeChat.channelPhone}</span>
            </div>

            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 block">Agen Ditugaskan</span>
              <span className="font-semibold text-purple-300 block">
                {activeChat.assignedAgentName || 'Belum ada agen'}
              </span>
            </div>

            {/* Tags */}
            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-500 font-semibold block flex items-center">
                <Tag className="w-3 h-3 mr-1 text-emerald-400" /> Label Percakapan (Tags):
              </span>
              <div className="flex flex-wrap gap-1">
                {activeChat.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
