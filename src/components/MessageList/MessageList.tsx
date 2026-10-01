import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../../types';
import { formatTime } from '../../utils/time';
import './MessageList.css';

interface Props {
  messages: ChatMessage[];
}

export function MessageList({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="message-list message-list--empty">
        <div className="message-list__placeholder">
          Напишите первое сообщение
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`bubble ${m.isOutgoing ? 'bubble--out' : 'bubble--in'}`}
        >
          <div className="bubble__text">{m.text}</div>
          <div className="bubble__meta">
            <span>{formatTime(m.timestamp)}</span>
            {m.isOutgoing && m.status && (
              <span
                className={`bubble__status bubble__status--${m.status}`}
                aria-label={statusLabel(m.status)}
              >
                {statusGlyph(m.status)}
              </span>
            )}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

function statusGlyph(status: NonNullable<ChatMessage['status']>): string {
  switch (status) {
    case 'pending':
      return '...';
    case 'sent':
      return '✓';
    case 'delivered':
      return '✓✓';
    case 'read':
      return '✓✓';
    case 'failed':
      return '✕';
  }
}

function statusLabel(status: NonNullable<ChatMessage['status']>): string {
  switch (status) {
    case 'pending':
      return 'Отправляется';
    case 'sent':
      return 'Отправлено';
    case 'delivered':
      return 'Доставлено';
    case 'read':
      return 'Прочитано';
    case 'failed':
      return 'Не доставлено';
  }
}