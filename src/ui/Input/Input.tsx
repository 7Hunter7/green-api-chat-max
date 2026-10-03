import { forwardRef, useState } from "react";
import { Icon } from "../Icon/Icon";
import "./Input.css";

export type InputSize = "default" | "compact";

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  /**
   * default — 52px (форма логина, добавление чата)
   * compact — 36px (поиск в сайдбаре)
   */
  size?: InputSize;
  /** Слот слева (иконка, флаг) */
  leftSlot?: React.ReactNode;
  /** Слот справа (clear, иконка) */
  rightSlot?: React.ReactNode;
  /** Показать кнопку «×» для очистки, если поле непустое */
  clearable?: boolean;
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = "default",
    leftSlot,
    rightSlot,
    clearable = false,
    onClear,
    value,
    onChange,
    className = "",
    disabled,
    ...rest
  },
  ref,
) {
  // Если clearable — держим внутренний контроль на «есть ли текст»
  const [internalValue, setInternalValue] = useState("");
  const currentValue = value !== undefined ? value : internalValue;
  const hasText = String(currentValue ?? "").length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (value === undefined) setInternalValue(e.target.value);
    onChange?.(e);
  };

  const handleClear = () => {
    if (value === undefined) setInternalValue("");
    // Иммитируем событие для контролируемых родителей
    if (onChange) {
      const synthetic = {
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(synthetic);
    }
    onClear?.();
  };

  const showClear = clearable && hasText && !disabled;

  const classes = [
    "input",
    `input--${size}`,
    disabled && "input--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {leftSlot && (
        <span className="input__slot input__slot--left">{leftSlot}</span>
      )}

      <input
        ref={ref}
        className="input__field"
        value={currentValue}
        onChange={handleChange}
        disabled={disabled}
        {...rest}
      />

      {showClear && (
        <button
          type="button"
          className="input__clear"
          onClick={handleClear}
          aria-label="Очистить"
          tabIndex={-1}
        >
          <Icon name="cross_mini" size={12} />
        </button>
      )}

      {rightSlot && (
        <span className="input__slot input__slot--right">{rightSlot}</span>
      )}
    </div>
  );
});
