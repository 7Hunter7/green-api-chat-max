import type { ReactNode } from "react";

export interface MenuItemProps {
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function MenuItem({
  icon,
  children,
  onClick,
  disabled = false,
}: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className="menu-item"
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="menu-item__icon">{icon}</span>}
      <span className="menu-item__label">{children}</span>
    </button>
  );
}
