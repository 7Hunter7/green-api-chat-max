import { useCallback, useMemo, useState } from 'react';
import { LoginForm } from './components/LoginForm/LoginForm';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ChatWindow } from './components/ChatWindow/ChatWindow';
import { useChatPolling } from './hooks/useChatPolling';
import { useConversations } from './hooks/useConversations';
import { useMessagesStorage } from './hooks/useMessagesStorage';
import type { ChatMessage, Credentials } from './types';
import './App.css';

export default function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const { conversations, addOrGet, remove, touch, markRead } = useConversations();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const {
    messagesByChat,
    setMessagesByChat,
    clearAll: clearAllMessages,
  } = useMessagesStorage();

  // Входящие — от polling, раскладываем по чатам
  const handleIncoming = useCallback(
    (msg: ChatMessage) => {
      setMessagesByChat((prev) => ({
        ...prev,
        [msg.chatId]: [...(prev[msg.chatId] ?? []), msg],
      }));
      // Если входящий в неактивный чат — увеличиваем badge
      const isActive = msg.chatId === activeChatId;
      touch(msg.chatId, msg, isActive);
    },
    [activeChatId, touch],
  );

  useChatPolling({
    credentials,
    enabled: !!credentials,
    onMessage: handleIncoming,
  });

  const activeMessages = useMemo(
    () => (activeChatId ? messagesByChat[activeChatId] ?? [] : []),
    [activeChatId, messagesByChat],
  );

  const handleAdd = (phone: string) => {
    try {
      const c = addOrGet(phone);
      setActiveChatId(c.chatId);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Некорректный номер');
    }
  };

  const handleSelect = (chatId: string) => {
    setActiveChatId(chatId);
    markRead(chatId);
  };

  const handleRemove = (chatId: string) => {
    remove(chatId);
    setMessagesByChat((prev) => {
      const next = { ...prev };
      delete next[chatId];
      return next;
    });
    if (activeChatId === chatId) setActiveChatId(null);
  };

  const handleLogout = () => {
    clearAllMessages();
    setCredentials(null);
    setActiveChatId(null);
    setMessagesByChat({});
  };

  const handleMessageSent = (msg: ChatMessage) => {
    setMessagesByChat((prev) => ({
      ...prev,
      [msg.chatId]: [...(prev[msg.chatId] ?? []), msg],
    }));
    touch(msg.chatId, msg, true);
  };

  const handleMessageConfirmed = (localId: string, serverId: string) => {
    if (!activeChatId) return;
    setMessagesByChat((prev) => {
      const list = prev[activeChatId] ?? [];
      return {
        ...prev,
        [activeChatId]: list.map((m) =>
          m.id === localId ? { ...m, id: serverId } : m,
        ),
      };
    });
  };

  const handleMessageFailed = (localId: string) => {
    if (!activeChatId) return;
    setMessagesByChat((prev) => ({
      ...prev,
      [activeChatId]: (prev[activeChatId] ?? []).filter(
        (m) => m.id !== localId,
      ),
    }));
  };

  if (!credentials) {
    return <LoginForm onLogin={setCredentials} />;
  }

  return (
    <div className="app">
      <Sidebar
        conversations={conversations}
        activeChatId={activeChatId}
        onSelect={handleSelect}
        onAdd={handleAdd}
        onRemove={handleRemove}
        onLogout={handleLogout}
      />
      <main className="app__main">
        {activeChatId ? (
          <ChatWindow
            credentials={credentials}
            chatId={activeChatId}
            messages={activeMessages}
            onMessageSent={handleMessageSent}
            onMessageConfirmed={handleMessageConfirmed}
            onMessageFailed={handleMessageFailed}
          />
        ) : (
          <div className="app__placeholder">
            <div className="app__placeholder-text">
              Выберите чат или создайте новый
            </div>
          </div>
        )}
      </main>
    </div>
  );
}