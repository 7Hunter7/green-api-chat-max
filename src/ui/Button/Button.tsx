import { forwardRef } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Растянуть кнопку на всю ширину контейнера */
  stretched?: boolean;
  /** Иконка перед текстом (или вместо текста, если текста нет) */
  icon?: React.ReactNode;
  /** Иконка справа от текста */
  iconRight?: React.ReactNode;
  /** Показывать лоадер вместо иконки/текста */
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'medium',
      stretched = false,
      icon,
      iconRight,
      loading = false,
      disabled,
      className = '',
      children,
      ...rest
    },
    ref,
  ) {
    const classes = [
      'button',
      `button--${variant}`,
      `button--${size}`,
      stretched && 'button--stretched',
      loading && 'button--loading',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...rest}
      >
        {loading && <span className="button__spinner" aria-hidden />}
        {!loading && icon && <span className="button__icon">{icon}</span>}
        {children && <span className="button__text">{children}</span>}
        {iconRight && !loading && (
          <span className="button__icon button__icon--right">
            {iconRight}
          </span>
        )}
      </button>
    );
  },
);