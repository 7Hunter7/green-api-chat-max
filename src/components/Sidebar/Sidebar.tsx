import { useMemo, useState } from "react";
import { Button, Icon, Input, Menu, MenuItem } from "../../ui";
import { FindByPhoneModal } from "../FindByPhoneModal/FindByPhoneModal";
import type { Conversation } from "../../types";
import { formatTime } from "../../utils/time";
import "./Sidebar.css";

interface Props {
  conversations: Conversation[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  onAdd: (phone: string) => void | Promise<void>;
  onRemove: (chatId: string) => void;
  onClearHistory?: (chatId: string) => void;
  onMarkUnread?: (chatId: string) => void;
}

export function Sidebar({
  conversations,
  activeChatId,
  onSelect,
  onAdd,
  onRemove,
  onClearHistory,
  onMarkUnread,
}: Props) {
  const [findModalOpen, setFindModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.phone.toLowerCase().includes(q) ||
        (c.lastMessage ?? "").toLowerCase().includes(q),
    );
  }, [conversations, search]);

  // Заглушки для новых действий
  const handleCreateGroup = () => {
    alert('Создать группу — в разработке');
  };
  const handleCreateChannel = () => {
    alert('Создать канал — в разработке');
  };
  const handleCreateCall = () => {
    alert('Создать групповой звонок — в разработке');
  };
  const handleFindByPhone = () => {
    setFindModalOpen(true);
  };
  const handleModalSubmit = async (phone: string) => {
    await onAdd(phone);
  };
  const handleInviteByLink = () => {
    alert('Пригласить по ссылке — в разработке');
  };

  return (
    <aside className="sidebar">
      <header className="sidebar__header">
        <h2 className="sidebar__title">Чаты</h2>

        <Menu
          align="end"
          trigger={
            <Button
              variant="primary"
              size="xsmall"
              icon={<Icon name="plus" size={20} />}
              aria-label="Создать"
            />
          }
        >
          <MenuItem
            icon={<Icon name="users" size={20} />}
            onClick={handleCreateGroup}
          >
            Создать группу
          </MenuItem>
          <MenuItem
            icon={<Icon name="megaphone" size={20} />}
            onClick={handleCreateChannel}
          >
            Создать канал
          </MenuItem>
          <MenuItem
            icon={<Icon name="call" size={20} />}
            onClick={handleCreateCall}
          >
            Создать групповой звонок
          </MenuItem>
          <MenuItem
            icon={<Icon name="search" size={20} />}
            onClick={handleFindByPhone}
          >
            Найти по номеру
          </MenuItem>
          <MenuItem
            icon={<Icon name="link" size={20} />}
            onClick={handleInviteByLink}
          >
            Пригласить по ссылке
          </MenuItem>
        </Menu>
      </header>

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
            {search ? "Ничего не найдено" : "Нет чатов. Нажмите «+»"}
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
                <Menu
                  align="end"
                  trigger={
                    <button
                      type="button"
                      className="chat-item__menu-button"
                      aria-label="Еще"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Icon name="dots_horizontal_mini" size={16} />
                    </button>
                  }
                >
                  <MenuItem
                    icon={<Icon name="folder_add_to" size={20} />}
                    submenu={[
                      {
                        icon: <Icon name="folder" size={20} />,
                        children: "Новые",
                        onClick: () =>
                          alert("Добавлено в «Новые» — в разработке"),
                      },
                      {
                        icon: <Icon name="folder" size={20} />,
                        children: "Каналы",
                        onClick: () =>
                          alert("Добавлено в «Каналы» — в разработке"),
                      },
                      {
                        icon: <Icon name="plus" size={20} />,
                        children: "Создать папку",
                        onClick: () => alert("Создать папку — в разработке"),
                      },
                    ]}
                  >
                    Добавить в папку
                  </MenuItem>

                  <MenuItem
                    icon={<Icon name="launch" size={20} />}
                    onClick={() => onSelect(c.chatId)}
                  >
                    Открыть
                  </MenuItem>

                  <MenuItem
                    icon={<Icon name="message_unread" size={20} />}
                    onClick={() => onMarkUnread?.(c.chatId)}
                  >
                    Отметить непрочитанным
                  </MenuItem>

                  <MenuItem
                    icon={<Icon name="notifications_crossed" size={20} />}
                    submenu={[
                      {
                        children: "На 1 час",
                        onClick: () =>
                          alert(
                            "Уведомления отключены на 1 час — в разработке",
                          ),
                      },
                      {
                        children: "На 4 часа",
                        onClick: () =>
                          alert(
                            "Уведомления отключены на 4 часа — в разработке",
                          ),
                      },
                      {
                        children: "На 1 день",
                        onClick: () =>
                          alert(
                            "Уведомления отключены на 1 день — в разработке",
                          ),
                      },
                      {
                        children: "Навсегда",
                        danger: true,
                        onClick: () =>
                          alert(
                            "Уведомления отключены навсегда — в разработке",
                          ),
                      },
                    ]}
                  >
                    Отключить уведомления
                  </MenuItem>

                  <MenuItem
                    icon={<Icon name="clear_history" size={20} />}
                    onClick={() => {
                      if (confirm("Стереть переписку в этом чате?")) {
                        onClearHistory?.(c.chatId);
                      }
                    }}
                  >
                    Стереть переписку
                  </MenuItem>

                  <MenuItem
                    icon={<Icon name="eye_crossed" size={20} />}
                    onClick={() =>
                      alert("Скрыть истории автора — в разработке")
                    }
                  >
                    Скрыть истории автора
                  </MenuItem>

                  <MenuItem
                    icon={<Icon name="block" size={20} />}
                    danger
                    onClick={() => {
                      if (confirm("Заблокировать пользователя?")) {
                        alert("Заблокировать — в разработке");
                      }
                    }}
                  >
                    Заблокировать
                  </MenuItem>

                  <MenuItem
                    icon={<Icon name="delete" size={20} />}
                    danger
                    onClick={() => {
                      if (confirm("Удалить чат?")) {
                        onRemove(c.chatId);
                      }
                    }}
                  >
                    Удалить чат
                  </MenuItem>
                </Menu>
              </div>
            </div>
          );
        })}
      </div>

      <FindByPhoneModal
        open={findModalOpen}
        onClose={() => setFindModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </aside>
  );
}