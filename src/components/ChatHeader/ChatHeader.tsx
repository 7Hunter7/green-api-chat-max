import { useState } from "react";
import { Button, Icon, Input, Menu, MenuItem } from "../../ui";
import type { Conversation } from "../../types";
import { formatPhone } from "../../utils/chatId";
import "./ChatHeader.css";

interface Props {
  conversation: Conversation;
  onBack?: () => void;
  onMore?: () => void;
  onProfileClick?: () => void;
}

const noop = () => {};

export function ChatHeader({
  conversation,
  onBack = noop,
  onMore = noop,
  onProfileClick = noop,
}: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const phone = conversation.phone;
  const avatarText = phone.replace(/\D/g, "").slice(-2) || "??";

  const handleSearchToggle = () => {
    setSearchOpen((v) => !v);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setQuery("");
  };

  return (
    <header className="chat-header" role="banner">
      <h2 className="sr-only" id="chat-header-title">
        Окно чата с {formatPhone(phone)}
      </h2>
      <Button
        variant="ghost"
        size="small"
        className="chat-header__icon-button"
        aria-label="Назад"
        onClick={onBack}
        icon={<Icon name="arrow_left" size={24} />}
      />

      <button
        type="button"
        className="chat-header__main"
        aria-label={`Открыть профиль ${formatPhone(phone)}`}
        onClick={onProfileClick}
      >
        <div className="chat-header__avatar" aria-hidden="true">
          {avatarText}
        </div>
        <div className="chat-header__content">
          <span className="chat-header__name">{formatPhone(phone)}</span>
          <span className="chat-header__subtitle">Личный чат</span>
        </div>
      </button>

      <div className="chat-header__actions">
        <Button
          variant="ghost"
          size="small"
          className="chat-header__icon-button"
          aria-label="Открыть поиск сообщений"
          aria-pressed={searchOpen}
          onClick={handleSearchToggle}
          icon={<Icon name="search" size={24} />}
        />
      </div>

      <Menu
        align="end"
        trigger={
          <Button
            variant="ghost"
            size="small"
            className="chat-header__icon-button"
            aria-label="Ещё"
            aria-haspopup="dialog"
            aria-expanded={false}
            onClick={onMore}
            icon={<Icon name="dots_vertical" size={24} />}
          />
        }
      >
        <MenuItem
          icon={<Icon name="notifications_crossed" size={20} />}
          submenu={[
            { children: "На 1 час", onClick: () => alert("1 час") },
            { children: "На 4 часа", onClick: () => alert("4 часа") },
            { children: "На 1 день", onClick: () => alert("1 день") },
            {
              children: "Навсегда",
              danger: true,
              onClick: () => alert("навсегда"),
            },
          ]}
        >
          Отключить уведомления
        </MenuItem>

        <MenuItem
          icon={<Icon name="folder_add_to" size={20} />}
          submenu={[
            {
              icon: <Icon name="folder" size={20} />,
              children: "Новые",
              onClick: () => alert("Новые"),
            },
            {
              icon: <Icon name="folder" size={20} />,
              children: "Каналы",
              onClick: () => alert("Каналы"),
            },
            {
              icon: <Icon name="plus" size={20} />,
              children: "Создать папку",
              onClick: () => alert("Создать папку"),
            },
          ]}
        >
          Добавить в папку
        </MenuItem>
      </Menu>

      <div
        className={`chat-header__search${searchOpen ? " chat-header__search--open" : ""}`}
        aria-hidden={!searchOpen}
      >
        <div className="chat-header__search-inner">
          <Input
            size="compact"
            className="chat-header__search-input"
            placeholder="Поиск"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            clearable
            leftSlot={<Icon name="search" size={16} />}
            tabIndex={searchOpen ? 0 : -1}
          />
          <Button
            variant="ghost"
            size="small"
            onClick={handleSearchClose}
            tabIndex={searchOpen ? 0 : -1}
          >
            Закрыть
          </Button>
        </div>
      </div>
    </header>
  );
}