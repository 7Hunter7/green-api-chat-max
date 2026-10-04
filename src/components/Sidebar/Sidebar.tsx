import { useMemo, useState } from 'react';
import { Button, Icon, Input } from '../../ui';
import type { Conversation } from '../../types';
import { formatTime } from '../../utils/time';
import './Sidebar.css';

interface Props {
  conversations: Conversation[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  onAdd: (phone: string) => void | Promise<void>;
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
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.phone.toLowerCase().includes(q) ||
        (c.lastMessage ?? '').toLowerCase().includes(q),
    );
  }, [conversations, search]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = newPhone.trim();
    if (!p) return;
    await onAdd(p);
    setNewPhone('');
    setAdding(false);
  };

  return (
    <aside className="sidebar">
      <header className="sidebar__header">
        <h2 className="sidebar__title">Чаты</h2>
        <Button
          variant="primary"
          size="xsmall"
          icon={<Icon name="plus" size={20} />}
          aria-label="Новый чат"
          onClick={() => setAdding((v) => !v)}
        />
      </header>

      {adding && (
        <form className="sidebar__new" onSubmit={submit}>
          <Input
            autoFocus
            placeholder="+7 999 123-45-67"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
          />
          <Button type="submit" variant="primary" size="medium">
            Начать
          </Button>
        </form>
      )}

      <div className="sidebar__search">
        <Input
          size="compact"
          placeholder="Найти"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          clearable
          leftSlot={<Icon name="search" size={16} />}
        />
      </div>

      <div className="sidebar__list">
        {filtered.length === 0 && (
          <div className="sidebar__empty">
            {search ? 'Ничего не найдено' : 'Нет чатов. Нажмите «+»'}
          </div>
        )}
        {filtered.map((c) => {
          const active = c.chatId === activeChatId;
          return (
            <div
              key={c.chatId}
              className="chat-item">
              <button
                type="button"
                className={`chat-item__cell${active ? " chat-item__cell--selected" : ""}`}
                onClick={() => onSelect(c.chatId)}
              >
                <div className="chat-item__avatar">{c.phone.slice(-2)}</div>

                <h3 className="chat-item__title">
                  <span className="chat-item__name">{c.phone}</span>
                </h3>

                <span className="chat-item__text">
                  {c.lastMessage ?? "Нет сообщений"}
                </span>

                <div className="chat-item__meta">
                  {c.lastTimestamp && (
                    <span className="chat-item__time">
                      {formatTime(c.lastTimestamp)}
                    </span>
                  )}
                </div>

                <div className="chat-item__indicators">
                  {c.unreadCount > 0 && (
                    <span className="chat-item__badge">{c.unreadCount}</span>
                  )}
                </div>
              </button>

              <div className="chat-item__actions">
                <button
                  type="button"
                  className="chat-item__menu-button"
                  aria-label="Еще"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Удалить этот чат?")) {
                      onRemove(c.chatId);
                    }
                  }}
                >
                  <Icon name="dots_horizontal_mini" size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="sidebar__footer">
        <Button
          variant="secondary"
          size="medium"
          stretched
          icon={<Icon name="autorization_leave" size={20} />}
          onClick={onLogout}
        >
          Выйти
        </Button>
      </footer>
    </aside>
  );
}