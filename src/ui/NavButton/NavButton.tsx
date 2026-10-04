import { forwardRef } from "react";
import { Icon, type IconName } from "../Icon/Icon";
import "./NavButton.css";

export interface NavButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconName: IconName;
  label: string;
  active?: boolean;
  counter?: number;
}

export const NavButton = forwardRef<HTMLButtonElement, NavButtonProps>(
  function NavButton(
    {
      iconName,
      label,
      active = false,
      counter,
      className = "",
      ...rest
    },
    ref,
  ) {
    const classes = [
      "nav-button",
      active && "nav-button--active",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        type="button"
        className={classes}
        aria-current={active ? "page" : undefined}
        {...rest}
      >
        <span className="nav-button__icon">
          <Icon name={iconName} size={24} />
        </span>
        <span className="nav-button__title">
          {label}
          {counter !== undefined && counter > 0 && (
            <span
              className="nav-button__counter"
              aria-label={`непрочитанных: ${counter}`}
            >
              {counter > 99 ? "99+" : counter}
            </span>
          )}
        </span>
      </button>
    );
  },
);