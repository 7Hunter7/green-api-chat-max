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
              <span className={`bubble__status bubble__status--${m.status}`}>
                {m.status === 'read' ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}