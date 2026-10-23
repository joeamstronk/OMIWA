export type UserRole = 'super_admin' | 'call_center';

export type UserStatus = 'online' | 'busy' | 'offline';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone: string;
  status: UserStatus;
  assignedChannels: string[]; // WhatsApp session IDs or ['all']
  totalChatsHandled: number;
  avgResponseTimeMin: number;
  rating: number; // e.g., 4.9
  lastActive: string;
}

export type WhatsAppSessionStatus =
  | 'qr_ready'
  | 'pairing'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'banned';

export interface WhatsAppSession {
  id: string;
  name: string;
  phoneNumber: string;
  status: WhatsAppSessionStatus;
  qrCodeData: string; // QR code raw or base64 data URL
  pairingCode?: string; // 8-digit mobile pairing code
  deviceInfo: {
    platform: string; // e.g. "WhatsApp Business iOS"
    osVersion: string;
    model: string;
    battery: number;
    isCharging: boolean;
  };
  pushName: string;
  unreadCount: number;
  totalReceivedToday: number;
  totalSentToday: number;
  linkedAt: string | null;
  lastActive: string;
  webhookUrl?: string;
}

export type MessageType =
  | 'text'
  | 'image'
  | 'audio'
  | 'document'
  | 'location'
  | 'template'
  | 'note';

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export type SenderType = 'customer' | 'agent' | 'bot' | 'system';

export interface Message {
  id: string;
  chatId: string;
  channelId: string; // WhatsApp session ID
  senderId: string;
  senderName: string;
  senderType: SenderType;
  messageType: MessageType;
  content: string;
  mediaUrl?: string;
  mediaFileName?: string;
  mediaFileSize?: string;
  mediaDuration?: number; // for audio voice notes (in seconds)
  locationData?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  templateData?: {
    templateId: string;
    title: string;
    variables: Record<string, string>;
  };
  status: MessageStatus;
  timestamp: string; // ISO
  agentId?: string;
  agentName?: string;
  isInternalNote?: boolean; // Yellow background note for internal team
  quotedMessage?: {
    id: string;
    senderName: string;
    content: string;
  };
}

export type ChatStatus = 'active' | 'pending' | 'resolved' | 'bot_handling';

export interface ChatConversation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAvatar: string;
  channelId: string; // Connected WhatsApp number ID
  channelPhone: string;
  channelName: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  status: ChatStatus;
  unreadCount: number;
  tags: string[];
  notesCount: number;
  lastMessage: Message;
  createdAt: string;
  updatedAt: string;
}

export type AutoResponseTrigger =
  | 'greeting'
  | 'away'
  | 'keyword'
  | 'default_fallback';

export interface AutoResponseRule {
  id: string;
  title: string;
  triggerType: AutoResponseTrigger;
  keywords: string[];
  matchType: 'exact' | 'contains' | 'starts_with';
  responseText: string;
  mediaUrl?: string;
  mediaName?: string;
  isActive: boolean;
  channelIds: string[]; // 'all' or specific WhatsApp IDs
  businessHoursOnly?: boolean;
  businessHoursStart?: string; // '08:00'
  businessHoursEnd?: string; // '18:00'
}

export interface MessageTemplate {
  id: string;
  title: string;
  category: 'customer_support' | 'sales' | 'marketing' | 'notifications';
  language: string;
  headerText?: string;
  bodyText: string;
  footerText?: string;
  variables: string[]; // ['name', 'order_id', 'date']
  quickReplies?: string[];
  status: 'approved' | 'pending' | 'rejected';
  usageCount: number;
  lastUsedAt?: string;
}

export type ActivePage =
  | 'dashboard'
  | 'users'
  | 'whatsapp-channels'
  | 'chat'
  | 'settings';
