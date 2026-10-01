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