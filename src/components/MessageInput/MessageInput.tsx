import { useState } from 'react';
import './MessageInput.css';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit(e);
    }
  };

  return (
    <form className="composer" onSubmit={submit}>
      <textarea
        className="composer__input"
        placeholder="Сообщение"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        disabled={disabled}
      />
      <button
        type="submit"
        className="composer__send"
        disabled={disabled || !text.trim()}
        aria-label="Отправить"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M5.29 11.705a1 1 0 0 1 .005-1.415l6.015-5.97a1 1 0 0 1 1.41.001l5.987 5.972a1 1 0 0 1-1.412 1.416l-4.28-4.27v11.533a1 1 0 1 1-2 0V7.43l-4.31 4.279a1 1 0 0 1-1.414-.005"
            fill="currentColor"
          />
        </svg>
      </button>
    </form>
  );
}