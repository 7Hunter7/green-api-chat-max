import {
  useCallback,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import "./Menu.css";

export interface MenuProps {
  /** Пункты меню */
  children: ReactNode;

  // === Режим 1: с триггером (обычное меню) ===
  trigger?: ReactElement;
  align?: "start" | "end";
  offset?: number;

  // === Режим 2: управляемое подменю ===
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Ref на элемент, к которому привязать подменю */
  anchorRef?: RefObject<HTMLElement | null>;
  /** Позиция относительно anchor */
  pos?: "bottom" | "right" | "top" | "left";
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
  open: controlledOpen,
  onOpenChange,
  anchorRef,
  pos = "bottom",
}: MenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const [menuEl, setMenuEl] = useState<HTMLDivElement | null>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = useCallback(
    (v: boolean) => {
      if (isControlled) onOpenChange?.(v);
      else setInternalOpen(v);
    },
    [isControlled, onOpenChange],
  );

  const toggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setOpen(!open);
    },
    [open, setOpen],
  );

  // Закрытие по клику вне меню
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Если клик внутри любого .menu (родитель или подменю) — не закрываем
      if (!target.closest?.('.menu')) {
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
  }, [open, menuEl, triggerEl, setOpen]);

  // Позиционирование
  useEffect(() => {
    if (!open) return;

    const anchor = anchorRef?.current ?? triggerEl;
    if (!anchor) return;

    const updatePosition = () => {
      const rect = anchor.getBoundingClientRect();
      const menuRect = menuEl?.getBoundingClientRect();
      const menuWidth = menuRect?.width ?? 240;

      let left: number;
      let top: number;

      if (pos === "right") {
        // Подменю справа от anchor
        left = rect.right + offset;
        top = rect.top;
        // Если не хватает места — откроем слева
        if (left + menuWidth > window.innerWidth - 8) {
          left = rect.left - menuWidth - offset;
        }
      } else {
        // Обычное меню под anchor
        if (align === "end") {
          left = rect.right - menuWidth;
        } else {
          left = rect.left;
        }
        top = rect.bottom + offset;
      }

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
  }, [open, align, offset, pos, anchorRef, triggerEl, menuEl]);

  return (
    <>
      {trigger && (
        <span
          ref={setTriggerEl}
          className="menu__trigger"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {trigger}
        </span>
      )}

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
