import { useEffect, useState } from 'react';
import { sendMessage } from '../../api/greenApi';
import { useChatPolling } from '../../hooks/useChatPolling';
import { toChatId, fromChatId } from '../../utils/chatId';
import type { ChatMessage, Credentials } from '../../types';
import { MessageList } from '../MessageList/MessageList';
import { MessageInput } from '../MessageInput/MessageInput';
import './ChatWindow.css';

interface Props {
  credentials: Credentials;
  phone: string;
  onLogout: () => void;
}

export function ChatWindow({ credentials, phone, onLogout }: Props) {
  const chatId = toChatId(phone);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);

  // Входящие из polling — только по нашему chatId
  useChatPolling({
    credentials,
    enabled: true,
    onMessage: (msg) => {
      if (msg.chatId !== chatId) return;
      setMessages((prev) => [...prev, msg]);
    },
  });

  // Сброс истории при смене чата
  useEffect(() => {
    setMessages([]);
  }, [chatId]);

  const handleSend = async (text: string) => {
    if (!text.trim() || sending) return;
    setSending(true);

    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      chatId,
      text,
      timestamp: Date.now(),
      isOutgoing: true,
      status: 'sent',
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const { idMessage } = await sendMessage(credentials, chatId, text);
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? { ...m, id: idMessage } : m)),
      );
    } catch (e) {
      console.error('sendMessage failed:', e);
      setMessages((prev) =>
        prev.filter((m) => m.id !== optimistic.id),
      );
      alert('Не удалось отправить сообщение');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-window">
      <header className="chat-header">
        <div className="chat-header__avatar">
          {fromChatId(chatId).slice(-2)}
        </div>
        <div className="chat-header__info">
          <div className="chat-header__name">{fromChatId(chatId)}</div>
          <div className="chat-header__status">личный чат</div>
        </div>
        <button className="chat-header__logout" onClick={onLogout}>
          Выйти
        </button>
      </header>

      <MessageList messages={messages} />

      <MessageInput onSend={handleSend} disabled={sending} />
    </div>
  );
}