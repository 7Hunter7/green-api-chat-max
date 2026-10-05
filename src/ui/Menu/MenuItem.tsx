import { useId, useRef, type ReactNode } from "react";
import { Icon } from "../Icon/Icon";
import { Menu } from "./Menu";
import { useMenuContext } from "./MenuContext";

export interface MenuItemProps {
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  /** Красный текст (деструктивное действие) */
  danger?: boolean;
  /** Подменю */
  submenu?: MenuItemProps[];
}

export function MenuItem({
  icon,
  children,
  onClick,
  disabled = false,
  danger = false,
  submenu,
}: MenuItemProps) {
  const itemId = useId();
  const itemRef = useRef<HTMLButtonElement>(null);
  const ctx = useMenuContext();

  const hasSubmenu = !!submenu && submenu.length > 0;
  const isSubmenuOpen = ctx ? ctx.openSubmenuId === itemId : false;

  const handleClick = () => {
    if (disabled) return;
    if (hasSubmenu) {
      // Открыть это подменю (закрыв остальные) или закрыть
      if (ctx) {
        ctx.setOpenSubmenuId(isSubmenuOpen ? null : itemId);
      }
    } else {
      onClick?.();
      ctx?.closeAll();
    }
  };

  const classes = ["menu-item", danger && "menu-item--danger"]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <button
        ref={itemRef}
        type="button"
        role="menuitem"
        className={classes}
        onClick={handleClick}
        disabled={disabled}
        aria-haspopup={hasSubmenu ? "menu" : undefined}
        aria-expanded={hasSubmenu ? isSubmenuOpen : undefined}
      >
        {icon && <span className="menu-item__icon">{icon}</span>}
        <span className="menu-item__label">{children}</span>
        {hasSubmenu && (
          <span className="menu-item__chevron">
            <Icon name="chevron_right_mini" size={12} />
          </span>
        )}
      </button>

      {hasSubmenu && isSubmenuOpen && (
        <Menu
          open={isSubmenuOpen}
          onOpenChange={(v) => {
            if (!v) ctx?.setOpenSubmenuId(null);
          }}
          anchorRef={itemRef}
          position="right"
          offset={4}
        >
          {submenu!.map((item, i) => (
            <MenuItem key={i} {...item} />
          ))}
        </Menu>
      )}
    </>
  );
}
