import { useCallback, useEffect, useMemo, useState } from 'react';
import { LoginForm } from './components/LoginForm/LoginForm';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ChatWindow } from './components/ChatWindow/ChatWindow';
import { getStateInstance, checkAccount } from './api/greenApi';
import { useChatPolling } from './hooks/useChatPolling';
import { useConversations } from './hooks/useConversations';
import { useMessagesStorage } from './hooks/useMessagesStorage';
import type { ChatMessage, Credentials, InstanceState } from './types';
import './App.css';

const CREDENTIALS_KEY = 'green-api-chat-credentials';

function loadCredentials(): Credentials | null {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    return raw ? (JSON.parse(raw) as Credentials) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(() =>
    loadCredentials(),
  );
  const [restoring, setRestoring] = useState<boolean>(() => !!loadCredentials());

  const { conversations, addOrGet, remove, touch, markRead } = useConversations();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const {
    messagesByChat,
    setMessagesByChat,
    clearAll: clearAllMessages,
  } = useMessagesStorage();

  // Восстановление сессии при перезагрузке
  useEffect(() => {
    if (!restoring) return;
    let cancelled = false;
    (async () => {
      const saved = loadCredentials();
      if (!saved) {
        if (!cancelled) setRestoring(false);
        return;
      }
      try {
        const state = (await getStateInstance(saved)) as InstanceState;
        if (cancelled) return;
        if (state === 'authorized') {
          setCredentials(saved);
        } else {
          localStorage.removeItem(CREDENTIALS_KEY);
          setCredentials(null);
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem(CREDENTIALS_KEY);
          setCredentials(null);
        }
      } finally {
        if (!cancelled) setRestoring(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [restoring]);

  // Сохранение/удаление credentials при изменении
  useEffect(() => {
    if (credentials) {
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
    } else {
      localStorage.removeItem(CREDENTIALS_KEY);
    }
  }, [credentials]);
  
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
    [activeChatId, touch, setMessagesByChat],
  );

  const handleStatus = useCallback(
    (idMessage: string, status: ChatMessage['status'], description?: string) => {
      setMessagesByChat((prev) => {
        // Ищем во всех чатах — idMessage уникален
        const next: typeof prev = {};
        for (const [chatId, list] of Object.entries(prev)) {
          const has = list.some((m) => m.id === idMessage);
          next[chatId] = has
            ? list.map((m) => (m.id === idMessage ? { ...m, status, error: description } : m))
            : list;
        }
        return next;
      });
    },
    [setMessagesByChat],
  );

  useChatPolling({
    credentials,
    enabled: !!credentials,
    onMessage: handleIncoming,
    onStatus: handleStatus,
  });

  const activeMessages = useMemo(
    () => (activeChatId ? messagesByChat[activeChatId] ?? [] : []),
    [activeChatId, messagesByChat],
  );

  const handleAdd = async (phone: string) => {
    try {
      const res = await checkAccount(credentials!, phone);
      if (!res.exist || !res.chatId) {
        alert('На этом номере нет аккаунта MAX');
        return;
      }
      const c = addOrGet(res.chatId, phone);
      setActiveChatId(c.chatId);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка проверки номера');
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
    setCredentials(null);
    setActiveChatId(null);
    clearAllMessages();
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

  const activeConversation = useMemo(
    () => conversations.find((c) => c.chatId === activeChatId),
    [conversations, activeChatId],
  );

  if (restoring) {
    return (
      <div className="app__placeholder">
        <div className="app__placeholder-text">Загрузка…</div>
      </div>
    );
  }

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
        {activeChatId && activeConversation ? (
          <ChatWindow
            key={activeChatId}
            credentials={credentials}
            chatId={activeChatId}
            conversation={activeConversation}
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