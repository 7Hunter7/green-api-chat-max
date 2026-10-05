import {
  useCallback,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import "./Menu.css";

export interface MenuProps {
  /** Триггер — любой кликабельный элемент (обычно Button) */
  trigger: ReactElement;
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
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const [menuEl, setMenuEl] = useState<HTMLDivElement | null>(null);

  // Ссылка на актуальный "закрыть" — используется в слушателях
  const close = useCallback(() => setOpen(false), []);

  const toggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((v) => !v);
  }, []);

  // Закрытие по клику вне меню
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!menuEl?.contains(target) && !triggerEl?.contains(target)) {
        close();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, menuEl, triggerEl, close]);

  // Расчёт позиции при открытии и при ресайзе/скролле
  useEffect(() => {
    if (!open || !triggerEl) return;

    const updatePosition = () => {
      const rect = triggerEl.getBoundingClientRect();
      const menuRect = menuEl?.getBoundingClientRect();

      let left: number;
      if (align === "end") {
        // Правый край меню = правый край триггера
        const menuWidth = menuRect?.width ?? 240;
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
  }, [open, align, offset, triggerEl, menuEl]);

  return (
    <>
      <span
        ref={setTriggerEl}
        className="menu__trigger"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {trigger}
      </span>

      {open &&
        createPortal(
          <div
            ref={setMenuEl}
            className="menu"
            role="menu"
            style={
              position
                ? { top: position.top, left: position.left }
                : { visibility: "hidden", position: "fixed", top: 0, left: 0 }
            }
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  );
}
