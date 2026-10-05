import {
  useCallback,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { useContext } from 'react';
import { createPortal } from "react-dom";
import { MenuContext } from "./MenuContext";
import "./Menu.css";

export interface MenuProps {
  /** Пункты меню */
  children: ReactNode;

  // === Режим 1: с триггером (обычное меню) ===
  trigger?: ReactElement;

  // === Режим 2: управляемое подменю ===
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Внешний ref на DOM-элемент, к которому привязать меню */
  anchorRef?: RefObject<HTMLElement | null>;

  align?: "start" | "end";
  offset?: number;
  /** Позиция относительно anchor: 'bottom' (под) или 'right' (справа) */
  position?: "bottom" | "right";
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
  position = "bottom",
}: MenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [pos, setPos] = useState<Position | null>(null);
  // Ref для триггер-режима
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  // Ref для меню
  const [menuEl, setMenuEl] = useState<HTMLDivElement | null>(null);
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);
  // Получаем контекст родителя — если мы внутри другого Menu
  const parentCtx = useContext(MenuContext);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = useCallback(
    (v: boolean) => {
      if (isControlled) onOpenChange?.(v);
      else setInternalOpen(v);
      // При закрытии родителя сбрасываем открытое подменю
      if (!v) setOpenSubmenuId(null);
    },
    [isControlled, onOpenChange],
  );

  const closeAll = useCallback(() => {
    setOpen(false);
    parentCtx?.closeAll();
  }, [setOpen, parentCtx]);

  const toggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setOpen(!open);
    },
    [open, setOpen],
  );

  // Закрытие по клику вне / Escape
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Клик внутри любого .menu (родитель или подменю) — не закрываем
      if (!target.closest?.(".menu")) {
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
  }, [open, setOpen]);

  // Позиционирование
  useEffect(() => {
    if (!open) return;

    const anchor = anchorRef?.current ?? triggerEl;
    if (!anchor) return;

    const updatePosition = () => {
      const rect = anchor.getBoundingClientRect();
      const menuRect = menuEl?.getBoundingClientRect();
      const menuWidth = menuRect?.width ?? 240;
      const menuHeight = menuRect?.height ?? 0;

      let left: number;
      let top: number;

      if (position === "right") {
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

      // Не вылезаем за края
      if (left + menuWidth > window.innerWidth - 8) {
        left = window.innerWidth - menuWidth - 8;
      }
      if (left < 8) left = 8;
      if (top + menuHeight > window.innerHeight - 8) {
        top = window.innerHeight - menuHeight - 8;
      }
      if (top < 8) top = 8;

      setPos({ top, left });
    };

    // Первый расчёт — после рендера меню (чтобы знать его размеры)
    requestAnimationFrame(updatePosition);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, align, offset, position, anchorRef, triggerEl, menuEl]);

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
              pos
                ? { top: pos.top, left: pos.left }
                : { visibility: "hidden", position: "fixed", top: 0, left: 0 }
            }
          >
            <MenuContext.Provider
              value={{
                closeAll,
                openSubmenuId,
                setOpenSubmenuId,
              }}
            >
              {children}
            </MenuContext.Provider>
          </div>,
          document.body,
        )}
    </>
  );
}
