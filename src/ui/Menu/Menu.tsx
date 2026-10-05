import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import "./Menu.css";

export interface MenuProps {
  /** Триггер — любой кликабельный элемент (обычно Button) */
  trigger: ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
  /** Пункты меню (MenuItem) */
  children: ReactNode;
  /** Выравнивание меню относительно триггера */
  align?: "start" | "end";
  /** Отступ от триггера в пикселях */
  offset?: number;
}

interface Position {
  top: number;
  left: number;
}

export function Menu({
  trigger,
  children,
  align = "start",
  offset = 4,
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Клик по триггеру — открыть/закрыть
  const handleTriggerClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((v) => !v);
  }, []);

  // Закрытие по клику вне меню
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  // Расчёт позиции при открытии и при ресайзе/скролле
  useEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const menuRect = menuRef.current?.getBoundingClientRect();

      let left: number;
      if (align === "end") {
        // Правый край меню = правый край триггера
        const menuWidth = menuRect?.width ?? 0;
        left = rect.right - menuWidth;
      } else {
        left = rect.left;
      }

      // top — под триггером
      const top = rect.bottom + offset;

      // Не вылезаем за правый край экрана
      const menuWidth = menuRect?.width ?? 240;
      if (left + menuWidth > window.innerWidth - 8) {
        left = window.innerWidth - menuWidth - 8;
      }
      // Не вылезаем за левый край
      if (left < 8) left = 8;

      setPosition({ top, left });
    };

    // Первый расчёт — после рендера меню (чтобы знать его размеры)
    requestAnimationFrame(updatePosition);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, align, offset]);

  // Клонируем триггер, чтобы повесить ref и onClick
  const triggerWithProps = isValidElement(trigger)
    ? cloneElement(trigger, {
        ref: triggerRef,
        onClick: handleTriggerClick,
        "aria-haspopup": "menu",
        "aria-expanded": open,
      } as Record<string, unknown>)
    : trigger;

  return (
    <>
      {triggerWithProps}
      {open &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            className="menu"
            role="menu"
            style={{ top: position.top, left: position.left }}
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  );
}
