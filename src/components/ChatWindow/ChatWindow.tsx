import { useState } from 'react';
import { sendMessage, GreenApiError } from '../../api/greenApi';
import type { ChatMessage, Conversation, Credentials } from '../../types';
import { ChatHeader } from '../ChatHeader/ChatHeader';
import { MessageList } from '../MessageList/MessageList';
import { MessageInput } from '../MessageInput/MessageInput';
import './ChatWindow.css';

interface Props {
  credentials: Credentials;
  chatId: string;
  conversation: Conversation;
  messages: ChatMessage[];
  onMessageSent: (msg: ChatMessage) => void;
  onMessageConfirmed: (localId: string, serverId: string) => void;
  onMessageFailed: (localId: string) => void;
  onBack: () => void;
}

export function ChatWindow({
  credentials,
  chatId,
  conversation,
  messages,
  onMessageSent,
  onMessageConfirmed,
  onMessageFailed,
  onBack,
}: Props) {
  const [sending, setSending] = useState(false);

  const handleSend = async (text: string) => {
    if (!text.trim() || sending) return;
    setSending(true);

    const localId = `local-${Date.now()}`;
    onMessageSent({
      id: localId,
      chatId,
      text,
      timestamp: Date.now(),
      isOutgoing: true,
      status: 'pending',
    });

    try {
      const { idMessage } = await sendMessage(credentials, chatId, text);
      onMessageConfirmed(localId, idMessage);
    } catch (e) {
      console.error('sendMessage failed:', e);
      let errorMessage = 'Не удалось отправить сообщение';
      
      if (e instanceof GreenApiError && e.status === 466) {
        errorMessage =
          'Превышен лимит тарифа «Разработчик»: доступно только 3 чата в месяц. ' +
          'Перейдите на тариф Business в личном кабинете GREEN-API.';
      } else if (e instanceof GreenApiError && e.status === 403) {
        errorMessage =
          'Ваш аккаунт временно ограничен. Отправка возможна только на номера из контактов.';
      } else if (e instanceof GreenApiError && e.status === 400) {
        errorMessage = 'Некорректный запрос. Проверьте chatId и текст сообщения.';
      }
      
      onMessageFailed(localId);
      alert(errorMessage);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-window">
      <ChatHeader 
        conversation={conversation} 
        onBack={onBack} 
      />
      <MessageList messages={messages} />

      <MessageInput onSend={handleSend} disabled={sending} />
    </div>
  );
}