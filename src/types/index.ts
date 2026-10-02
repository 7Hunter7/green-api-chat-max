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
  status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  error?: string;
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

export interface GreenApiNotification {
  receiptId: number;
  body: {
    typeWebhook: string;
    timestamp: number;
    idMessage?: string;
    status?: string;
    chatId?: string;
    senderData?: {
      chatId: string;
      sender: string;
      senderName?: string;
    };
    messageData?: {
      typeMessage: string;
      textMessageData?: {
        textMessage: string;
      };
    };
    instanceData?: {
      idInstance: number;
      wid: string;
      typeInstance: string;
    };
    description?: string;
  };
}