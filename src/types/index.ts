export interface Credentials {
  idInstance: string;
  apiTokenInstance: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  text: string;
  timestamp: number;
  isOutgoing: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

export interface GreenApiSendResponse {
  idMessage: string;
}

export type InstanceState =
  | 'authorized'
  | 'notAuthorized'
  | 'starting'
  | 'pendingPassword'
  | 'blocked'
  | 'suspended'
  | 'yellowCard'
  | 'redCard';

export interface Conversation {
  chatId: string;       // "79991234567@c.us"
  phone: string;        // "+79991234567" — отображается
  lastMessage?: string;
  lastTimestamp?: number;
  unreadCount: number;
}