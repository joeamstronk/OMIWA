import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  WhatsAppSession,
  ChatConversation,
  Message,
  AutoResponseRule,
  MessageTemplate,
  ActivePage,
  ChatStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_SESSIONS,
  INITIAL_CHATS,
  INITIAL_MESSAGES,
  INITIAL_AUTO_RESPONSES,
  INITIAL_TEMPLATES,
} from '../data/mockData';
import { WhatsAppGatewayService } from '../services/whatsappGateway';

interface SendMessageOptions {
  messageType?: Message['messageType'];
  mediaUrl?: string;
  mediaFileName?: string;
  mediaFileSize?: string;
  mediaDuration?: number;
  locationData?: Message['locationData'];
  templateData?: Message['templateData'];
  isInternalNote?: boolean;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  sessions: WhatsAppSession[];
  chats: ChatConversation[];
  messages: Message[];
  autoResponses: AutoResponseRule[];
  templates: MessageTemplate[];
  activePage: ActivePage;
  selectedChatId: string | null;
  activeChannelFilter: string;
  unreadTotal: number;

  // Navigation & User
  setActivePage: (page: ActivePage) => void;
  setSelectedChatId: (id: string | null) => void;
  setActiveChannelFilter: (channelId: string) => void;
  login: (email: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateUserStatus: (status: User['status']) => void;
  addUser: (user: Omit<User, 'id' | 'totalChatsHandled' | 'avgResponseTimeMin' | 'rating' | 'lastActive'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // WhatsApp Gateway Sessions
  createWhatsAppSession: (name: string, phoneNumber: string) => Promise<string>;
  simulateScanPairing: (sessionId: string) => Promise<void>;
  simulatePairingCodeLink: (sessionId: string, code: string) => Promise<boolean>;
  refreshSessionQR: (sessionId: string) => Promise<void>;
  disconnectSession: (sessionId: string) => void;
  reconnectSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;

  // Messaging & Chat
  sendMessage: (chatId: string, content: string, options?: SendMessageOptions) => Promise<void>;
  simulateIncomingCustomerMessage: (customScenario?: {
    senderName: string;
    senderPhone: string;
    text: string;
    avatar?: string;
    channelId?: string;
  }) => Promise<void>;
  assignAgentToChat: (chatId: string, agentId: string) => void;
  updateChatStatus: (chatId: string, status: ChatStatus) => void;
  markChatAsRead: (chatId: string) => void;

  // Settings
  addAutoResponseRule: (rule: Omit<AutoResponseRule, 'id'>) => void;
  updateAutoResponseRule: (id: string, updates: Partial<AutoResponseRule>) => void;
  deleteAutoResponseRule: (id: string) => void;
  addTemplate: (template: Omit<MessageTemplate, 'id' | 'usageCount'>) => void;
  updateTemplate: (id: string, updates: Partial<MessageTemplate>) => void;
  deleteTemplate: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'omni_wa_user',
  USERS: 'omni_wa_users',
  SESSIONS: 'omni_wa_sessions',
  CHATS: 'omni_wa_chats',
  MESSAGES: 'omni_wa_messages',
  AUTO_RESPONSES: 'omni_wa_auto_responses',
  TEMPLATES: 'omni_wa_templates',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // First page is Login Page: currentUser is null by default on startup
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [sessions, setSessions] = useState<WhatsAppSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [chats, setChats] = useState<ChatConversation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHATS);
    return saved ? JSON.parse(saved) : INITIAL_CHATS;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [autoResponses, setAutoResponses] = useState<AutoResponseRule[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTO_RESPONSES);
    return saved ? JSON.parse(saved) : INITIAL_AUTO_RESPONSES;
  });

  const [templates, setTemplates] = useState<MessageTemplate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });

  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [selectedChatId, setSelectedChatId] = useState<string | null>('chat-1');
  const [activeChannelFilter, setActiveChannelFilter] = useState<string>('all');

  // Sync to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTO_RESPONSES, JSON.stringify(autoResponses));
  }, [autoResponses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  }, [templates]);

  // Total unread count calculation
  const unreadTotal = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  // Authentication
  const login = (email: string): boolean => {
    const matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setCurrentUser(matched);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  const updateUserStatus = (status: User['status']) => {
    if (!currentUser) return;
    const updated = { ...currentUser, status };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
  };

  // User Management
  const addUser = (userData: Omit<User, 'id' | 'totalChatsHandled' | 'avgResponseTimeMin' | 'rating' | 'lastActive'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      totalChatsHandled: 0,
      avgResponseTimeMin: 1.0,
      rating: 5.0,
      lastActive: 'Just joined',
    };
    setUsers((prev) => [newUser, ...prev]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          if (currentUser?.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (currentUser?.id === id) {
      const remaining = users.filter((u) => u.id !== id);
      setCurrentUser(remaining[0] || null);
    }
  };

  // WhatsApp Sessions
  const createWhatsAppSession = async (name: string, phoneNumber: string): Promise<string> => {
    const sessionId = `wa-session-${Date.now()}`;
    const qrData = await WhatsAppGatewayService.generateSessionQR(sessionId, phoneNumber);
    const pairingCode = WhatsAppGatewayService.generatePairingCode();

    const newSession: WhatsAppSession = {
      id: sessionId,
      name,
      phoneNumber,
      status: 'qr_ready',
      qrCodeData: qrData,
      pairingCode,
      deviceInfo: {
        platform: 'Pending Pairing...',
        osVersion: '-',
        model: 'Awaiting QR Scan',
        battery: 100,
        isCharging: false,
      },
      pushName: name,
      unreadCount: 0,
      totalReceivedToday: 0,
      totalSentToday: 0,
      linkedAt: null,
      lastActive: 'Connecting...',
    };

    setSessions((prev) => [...prev, newSession]);
    return sessionId;
  };

  const refreshSessionQR = async (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;
    const newQR = await WhatsAppGatewayService.generateSessionQR(sessionId, session.phoneNumber);
    const newPairing = WhatsAppGatewayService.generatePairingCode();
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, qrCodeData: newQR, pairingCode: newPairing } : s))
    );
  };

  const simulateScanPairing = async (sessionId: string) => {
    // Step 1: Change to pairing
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: 'pairing',
              deviceInfo: {
                ...s.deviceInfo,
                platform: 'Negotiating Handshake...',
                model: 'WhatsApp Mobile Client',
              },
            }
          : s
      )
    );

    // Step 2: Transition to connected after brief authentic delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: 'connected',
              linkedAt: new Date().toISOString(),
              lastActive: 'Active now',
              deviceInfo: {
                platform: 'WhatsApp Business for Android/iOS',
                osVersion: 'v2.24.21.79',
                model: 'Connected Mobile Device',
                battery: Math.floor(Math.random() * 30) + 70,
                isCharging: true,
              },
            }
          : s
      )
    );
  };

  const simulatePairingCodeLink = async (sessionId: string, code: string): Promise<boolean> => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return false;
    await simulateScanPairing(sessionId);
    return true;
  };

  const disconnectSession = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: 'disconnected',
              lastActive: 'Disconnected',
            }
          : s
      )
    );
  };

  const reconnectSession = async (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;
    await refreshSessionQR(sessionId);
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'qr_ready' } : s))
    );
  };

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  // Messaging & Chat
  const sendMessage = async (
    chatId: string,
    content: string,
    options: SendMessageOptions = {}
  ) => {
    const targetChat = chats.find((c) => c.id === chatId);
    if (!targetChat) return;

    const isInternalNote = !!options.isInternalNote;

    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      chatId,
      channelId: targetChat.channelId,
      senderId: currentUser?.id || 'agent-system',
      senderName: currentUser?.name || 'Call Center Agent',
      senderType: isInternalNote ? 'agent' : 'agent',
      messageType: options.messageType || (isInternalNote ? 'note' : 'text'),
      content,
      mediaUrl: options.mediaUrl,
      mediaFileName: options.mediaFileName,
      mediaFileSize: options.mediaFileSize,
      mediaDuration: options.mediaDuration,
      locationData: options.locationData,
      templateData: options.templateData,
      status: 'pending',
      timestamp: new Date().toISOString(),
      agentId: currentUser?.id,
      agentName: currentUser?.name,
      isInternalNote,
    };

    // Add message immediately with 'pending'
    setMessages((prev) => [...prev, newMessage]);

    // Update conversation last message & time
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              lastMessage: newMessage,
              updatedAt: new Date().toISOString(),
              notesCount: isInternalNote ? c.notesCount + 1 : c.notesCount,
              status: c.status === 'resolved' ? 'active' : c.status,
            }
          : c
      )
    );

    // Update session outbound count
    setSessions((prev) =>
      prev.map((s) =>
        s.id === targetChat.channelId
          ? { ...s, totalSentToday: s.totalSentToday + 1 }
          : s
      )
    );

    // Simulate WhatsApp Gateway Delivery & Read receipt transitions
    if (!isInternalNote) {
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === newMessage.id ? { ...m, status: 'sent' } : m))
        );
      }, 400);

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === newMessage.id ? { ...m, status: 'delivered' } : m))
        );
      }, 1000);

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === newMessage.id ? { ...m, status: 'read' } : m))
        );
      }, 2200);
    } else {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMessage.id ? { ...m, status: 'sent' } : m))
      );
    }
  };

  const markChatAsRead = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const assignAgentToChat = (chatId: string, agentId: string) => {
    const agent = users.find((u) => u.id === agentId);
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              assignedAgentId: agentId,
              assignedAgentName: agent ? agent.name : undefined,
            }
          : c
      )
    );
  };

  const updateChatStatus = (chatId: string, status: ChatStatus) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, status } : c))
    );
  };

  // Simulate Incoming Customer Message and Auto-Responses
  const simulateIncomingCustomerMessage = async (customScenario?: {
    senderName: string;
    senderPhone: string;
    text: string;
    avatar?: string;
    channelId?: string;
  }) => {
    const connectedSession =
      sessions.find((s) => s.status === 'connected') || sessions[0];
    const scenarios = WhatsAppGatewayService.getSampleCustomerScenarios();
    const scenario =
      customScenario || scenarios[Math.floor(Math.random() * scenarios.length)];

    const channelId = customScenario?.channelId || connectedSession.id;
    const sessionObj = sessions.find((s) => s.id === channelId) || connectedSession;

    // Check if chat already exists for this customer phone
    let targetChat = chats.find((c) => c.customerPhone === scenario.senderPhone);
    let targetChatId = targetChat ? targetChat.id : `chat-${Date.now()}`;

    const newInboundMsg: Message = {
      id: `msg-in-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      chatId: targetChatId,
      channelId: channelId,
      senderId: `cust-${Date.now()}`,
      senderName: scenario.senderName,
      senderType: 'customer',
      messageType: 'text',
      content: scenario.text,
      status: 'delivered',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newInboundMsg]);

    if (targetChat) {
      setChats((prev) =>
        prev.map((c) =>
          c.id === targetChat!.id
            ? {
                ...c,
                lastMessage: newInboundMsg,
                unreadCount: c.id === selectedChatId ? 0 : c.unreadCount + 1,
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );
    } else {
      const newChat: ChatConversation = {
        id: targetChatId,
        customerName: scenario.senderName,
        customerPhone: scenario.senderPhone,
        customerAvatar:
          scenario.avatar ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        channelId: channelId,
        channelPhone: sessionObj.phoneNumber,
        channelName: sessionObj.name,
        assignedAgentId: undefined,
        assignedAgentName: undefined,
        status: 'active',
        unreadCount: 1,
        tags: ['New Message', 'Inbound'],
        notesCount: 0,
        lastMessage: newInboundMsg,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setChats((prev) => [newChat, ...prev]);
    }

    // Increment session incoming counter
    setSessions((prev) =>
      prev.map((s) =>
        s.id === channelId
          ? {
              ...s,
              totalReceivedToday: s.totalReceivedToday + 1,
              unreadCount: s.unreadCount + 1,
            }
          : s
      )
    );

    // Evaluate Auto-Responder Rules
    const autoEvaluation = WhatsAppGatewayService.evaluateAutoResponse(
      scenario.text,
      autoResponses,
      channelId,
      scenario.senderName
    );

    if (autoEvaluation.matched && autoEvaluation.replyText) {
      // Simulate Bot typing and sending response after 1.2s
      setTimeout(() => {
        const botMessage: Message = {
          id: `msg-bot-${Date.now()}`,
          chatId: targetChatId,
          channelId: channelId,
          senderId: 'bot-auto-responder',
          senderName: 'OmniWatsApp Surveillance Bot',
          senderType: 'bot',
          messageType: 'text',
          content: autoEvaluation.replyText!,
          status: 'delivered',
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, botMessage]);
        setChats((prev) =>
          prev.map((c) =>
            c.id === targetChatId
              ? {
                  ...c,
                  lastMessage: botMessage,
                  updatedAt: new Date().toISOString(),
                }
              : c
          )
        );
      }, 1200);
    }
  };

  // Auto Response Rules
  const addAutoResponseRule = (rule: Omit<AutoResponseRule, 'id'>) => {
    const newRule: AutoResponseRule = {
      ...rule,
      id: `rule-${Date.now()}`,
    };
    setAutoResponses((prev) => [...prev, newRule]);
  };

  const updateAutoResponseRule = (id: string, updates: Partial<AutoResponseRule>) => {
    setAutoResponses((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const deleteAutoResponseRule = (id: string) => {
    setAutoResponses((prev) => prev.filter((r) => r.id !== id));
  };

  // Templates
  const addTemplate = (template: Omit<MessageTemplate, 'id' | 'usageCount'>) => {
    const newTpl: MessageTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      usageCount: 0,
      lastUsedAt: 'Just created',
    };
    setTemplates((prev) => [...prev, newTpl]);
  };

  const updateTemplate = (id: string, updates: Partial<MessageTemplate>) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        sessions,
        chats,
        messages,
        autoResponses,
        templates,
        activePage,
        selectedChatId,
        activeChannelFilter,
        unreadTotal,

        setActivePage,
        setSelectedChatId,
        setActiveChannelFilter,
        login,
        logout,
        switchUser,
        updateUserStatus,
        addUser,
        updateUser,
        deleteUser,

        createWhatsAppSession,
        simulateScanPairing,
        simulatePairingCodeLink,
        refreshSessionQR,
        disconnectSession,
        reconnectSession,
        deleteSession,

        sendMessage,
        simulateIncomingCustomerMessage,
        assignAgentToChat,
        updateChatStatus,
        markChatAsRead,

        addAutoResponseRule,
        updateAutoResponseRule,
        deleteAutoResponseRule,
        addTemplate,
        updateTemplate,
        deleteTemplate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
