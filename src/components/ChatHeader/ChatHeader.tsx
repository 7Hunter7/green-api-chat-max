import { Button, Icon } from '../../ui';
import type { Conversation } from '../../types';
import { formatPhone } from '../../utils/chatId';
import './ChatHeader.css';

interface Props {
  conversation: Conversation;
  onBack?: () => void;
  onSearch?: () => void;
  onMore?: () => void;
}

export function ChatHeader({
  conversation,
  onBack,
  onSearch,
  onMore,
}: Props) {
  const phone = conversation.phone;
  const avatarText = phone.replace(/\D/g, '').slice(-2) || '??';

  return (
    <header className="chat-header">
      {onBack && (
        <Button
          variant="ghost"
          size="small"
          aria-label="Назад"
          onClick={onBack}
          icon={<Icon name="arrow_left" size={24} />}
        />
      )}

      <button
        type="button"
        className="chat-header__main"
        aria-label={`Открыть профиль ${formatPhone(phone)}`}
      >
        <div className="chat-header__avatar">{avatarText}</div>
        <div className="chat-header__content">
          <span className="chat-header__name">{formatPhone(phone)}</span>
          <span className="chat-header__subtitle">Личный чат</span>
        </div>
      </button>

      <div className="chat-header__actions">
        {onSearch && (
          <Button
            variant="ghost"
            size="small"
            aria-label="Поиск сообщений"
            onClick={onSearch}
            icon={<Icon name="search" size={24} />}
          />
        )}
        {onMore && (
          <Button
            variant="ghost"
            size="small"
            aria-label="Ещё"
            onClick={onMore}
            icon={<Icon name="dots_vertical" size={24} />}
          />
        )}
      </div>
    </header>
  );
}