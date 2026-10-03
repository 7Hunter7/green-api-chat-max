import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Icon } from "../../ui";
import "./MessageInput.css";

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
  /** Максимальная высота textarea в строках (по умолчанию 8) */
  maxRows?: number;
}

export function MessageInput({ onSend, disabled = false, maxRows = 8 }: Props) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasText = text.trim().length > 0;

  // Автовысота
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = 20; // из CSS
    const maxHeight = lineHeight * maxRows;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [text, maxRows]);

  const submit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  }, [text, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="composer">
      {/* Кнопка «прикрепить файл» */}
      <div className="composer__action">
        <Button
          variant="ghost"
          size="small"
          icon={<Icon name="attachment" size={24} />}
          aria-label="Загрузить файл"
          disabled={disabled}
        />
      </div>

      {/* Поле ввода с авторесайзом */}
      <div className="composer__field">
        <textarea
          ref={textareaRef}
          className="composer__textarea"
          placeholder="Сообщение"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
        />
      </div>

      {/* Правые экшены: если есть текст — «отправить», иначе — стикер/видео/микрофон */}
      {hasText ? (
        <div className="composer__action">
          <Button
            variant="primary"
            size="small"
            icon={<Icon name="send" size={20} />}
            aria-label="Отправить"
            onClick={submit}
            disabled={disabled}
          />
        </div>
      ) : (
        <>
          <div className="composer__action">
            <Button
              variant="ghost"
              size="small"
              icon={<Icon name="sticker" size={24} />}
              aria-label="Открыть меню стикеров"
              disabled={disabled}
            />
          </div>
          <div className="composer__action">
            <Button
              variant="ghost"
              size="small"
              icon={<Icon name="video_message" size={24} />}
              aria-label="Записать видеосообщение"
              disabled={disabled}
            />
          </div>
          <div className="composer__action">
            <Button
              variant="ghost"
              size="small"
              icon={<Icon name="microphone" size={24} />}
              aria-label="Записать голосовое сообщение"
              disabled={disabled}
            />
          </div>
        </>
      )}
    </div>
  );
}