import { useCallback, useState } from "react";
import type { ChatMessage, Conversation } from "../types";

const LS_KEY = "green-api-chat-conversations";

function loadFromStorage(): Conversation[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Conversation[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(list: Conversation[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    loadFromStorage(),
  );

  const persist = useCallback((next: Conversation[]) => {
    setConversations(next);
    saveToStorage(next);
  }, []);

  /**
   * chatId — внутренний id MAX (напр. "10000000"), получен через checkAccount.
   * phone — номер в виде "+7 999 123-45-67" для UI.
   */
  const addOrGet = useCallback(
    (chatId: string, phone: string): Conversation => {
      const existing = conversations.find((c) => c.chatId === chatId);
      if (existing) return existing;

      const conversation: Conversation = {
        chatId,
        phone,
        unreadCount: 0,
        lastTimestamp: Date.now(),
      };
      persist([conversation, ...conversations]);
      return conversation;
    },
    [conversations, persist],
  );

  const remove = useCallback(
    (chatId: string) => {
      persist(conversations.filter((c) => c.chatId !== chatId));
    },
    [conversations, persist],
  );

  const touch = useCallback(
    (chatId: string, msg: ChatMessage, markRead: boolean) => {
      const next = conversations.map((c) =>
        c.chatId !== chatId
          ? c
          : {
              ...c,
              lastMessage: msg.text,
              lastTimestamp: msg.timestamp,
              unreadCount: markRead
                ? 0
                : msg.isOutgoing
                  ? c.unreadCount
                  : c.unreadCount + 1,
            },
      );
      // поднимаем измененный чат наверх
      const idx = next.findIndex((c) => c.chatId === chatId);
      if (idx > 0) {
        const [moved] = next.splice(idx, 1);
        next.unshift(moved);
      }
      persist(next);
    },
    [conversations, persist],
  );

  const markRead = useCallback(
    (chatId: string) => {
      persist(
        conversations.map((c) =>
          c.chatId === chatId ? { ...c, unreadCount: 0 } : c,
        ),
      );
    },
    [conversations, persist],
  );

  /**
   * Пометить чат непрочитанным.
   * В MAX это ставит бейдж «1», а не инкремент — так пользователь видит,
   * что есть что-то непрочитанное, но не теряется в больших числах.
   */
  const markUnread = useCallback(
    (chatId: string) => {
      persist(
        conversations.map((c) =>
          c.chatId === chatId ? { ...c, unreadCount: 1 } : c,
        ),
      );
    },
    [conversations, persist],
  );

  /** Очистить превью чата (при «Стереть переписку» без удаления чата) */
  const clearPreview = useCallback(
    (chatId: string) => {
      persist(
        conversations.map((c) =>
          c.chatId === chatId
            ? { ...c, lastMessage: undefined, unreadCount: 0 }
            : c,
        ),
      );
    },
    [conversations, persist],
  );

  return {
    conversations,
    addOrGet,
    remove,
    touch,
    markRead,
    markUnread,
    clearPreview,
  };
}