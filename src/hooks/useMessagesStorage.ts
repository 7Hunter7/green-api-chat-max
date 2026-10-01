import { useCallback, useEffect, useState } from 'react';
import type { ChatMessage } from '../types';

const LS_KEY = 'green-api-chat-messages';

function load(): Record<string, ChatMessage[]> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function useMessagesStorage() {
  const [messagesByChat, setMessagesByChat] = useState<
    Record<string, ChatMessage[]>
  >(() => load());

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(messagesByChat));
  }, [messagesByChat]);

  const clearAll = useCallback(() => {
    setMessagesByChat({});
  }, []);

  // Стабильные ссылки для использования в useCallback зависимостях
  const updateMessages: typeof setMessagesByChat = useCallback(
    (action) => {
      setMessagesByChat(action);
    },
    [],
  );

  return {
    messagesByChat,
    setMessagesByChat: updateMessages,
    clearAll,
  };
}