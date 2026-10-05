import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import "./Modal.css";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Кнопки в футере */
  actions?: ReactNode;
  /** Ширина карточки (по умолчанию 400px) */
  width?: number;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  actions,
  width = 400,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Закрытие по Escape
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);
    // Блокируем скролл body
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  // Закрытие по клику вне карточки
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!open) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={contentRef}
        className="modal-content"
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal__header">
          <h2 id="modal-title" className="modal__title">
            {title}
          </h2>
        </div>

        <div className="modal__body">{children}</div>

        {actions && <div className="modal__actions">{actions}</div>}
      </div>
    </div>,
    document.body,
  );
}
