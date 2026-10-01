import { useState } from 'react';
import type { Conversation } from '../../types';
import { formatTime } from '../../utils/time';
import './Sidebar.css';

interface Props {
  conversations: Conversation[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  onAdd: (phone: string) => void;
  onRemove: (chatId: string) => void;
  onLogout: () => void;
}

export function Sidebar({
  conversations,
  activeChatId,
  onSelect,
  onAdd,
  onRemove,
  onLogout,
}: Props) {
  const [newPhone, setNewPhone] = useState('');
  const [adding, setAdding] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = newPhone.trim();
    if (!p) return;
    onAdd(p);
    setNewPhone('');
    setAdding(false);
  };

  return (
    <aside className="sidebar">
      <header className="sidebar__header">
        <h2 className="sidebar__title">Чаты</h2>
        <button
          className="sidebar__add"
          onClick={() => setAdding((v) => !v)}
          aria-label="Новый чат"
        >
          {adding ? '×' : '+'}
        </button>
      </header>

      {adding && (
        <form className="sidebar__new" onSubmit={submit}>
          <input
            autoFocus
            placeholder="+7 999 123-45-67"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
          />
          <button type="submit">Начать</button>
        </form>
      )}

      <div className="sidebar__list">
        {conversations.length === 0 && (
          <div className="sidebar__empty">Нет чатов. Нажмите «+»</div>
        )}
        {conversations.map((c) => {
          const active = c.chatId === activeChatId;
          return (
            <div
              key={c.chatId}
              className={`chat-item ${active ? 'chat-item--active' : ''}`}
              onClick={() => onSelect(c.chatId)}
            >
              <div className="chat-item__avatar">
                {c.phone.slice(-2)}
              </div>
              <div className="chat-item__body">
                <div className="chat-item__row">
                  <span className="chat-item__name">{c.phone}</span>
                  {c.lastTimestamp && (
                    <span className="chat-item__time">
                      {formatTime(c.lastTimestamp)}
                    </span>
                  )}
                </div>
                <div className="chat-item__row">
                  <span className="chat-item__preview">
                    {c.lastMessage ?? 'Нет сообщений'}
                  </span>
                  {c.unreadCount > 0 && (
                    <span className="chat-item__badge">{c.unreadCount}</span>
                  )}
                </div>
              </div>
              <button
                className="chat-item__remove"
                aria-label="Удалить чат"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(c.chatId);
                }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      <footer className="sidebar__footer">
        <button className="sidebar__logout" onClick={onLogout}>
          Выйти
        </button>
      </footer>
    </aside>
  );
}