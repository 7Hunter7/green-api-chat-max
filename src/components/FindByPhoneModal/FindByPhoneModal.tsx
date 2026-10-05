import { useEffect, useRef, useState } from "react";
import { Button, Input, Modal } from "../../ui";
import "./FindByPhoneModal.css";

export interface FindByPhoneModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (phone: string) => void | Promise<void>;
}

function digitsOnly(v: string): string {
  return v.replace(/\D/g, "");
}

/** Форматирует в маску "123 456 78 90" (для +7) */
function formatPhoneDigits(digits: string): string {
  const d = digits.slice(0, 10); // максимум 10 цифр после +7
  const parts: string[] = [];
  if (d.length > 0) parts.push(d.slice(0, 3));
  if (d.length > 3) parts.push(d.slice(3, 6));
  if (d.length > 6) parts.push(d.slice(6, 8));
  if (d.length > 8) parts.push(d.slice(8, 10));
  return parts.join(" ");
}

export function FindByPhoneModal({
  open,
  onClose,
  onSubmit,
}: FindByPhoneModalProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [prevOpen, setPrevOpen] = useState(open);
  // Сброс при открытии
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setValue("");
  }
  // Фокус после анимации открытия
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const digits = digitsOnly(value);
  const isValid = digits.length === 10;

  const handleSubmit = async () => {
    if (!isValid) return;
    await onSubmit(`7${digits}`);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Найти по номеру"
      width={420}
      actions={
        <Button
          variant="primary"
          size="medium"
          stretched
          disabled={!isValid}
          onClick={handleSubmit}
        >
          Найти в MAX
        </Button>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Input
          ref={inputRef}
          size="default"
          className="find-by-phone__input"
          type="tel"
          inputMode="decimal"
          autoComplete="tel"
          placeholder="123 456 78 90"
          value={formatPhoneDigits(digits)}
          onChange={(e) => setValue(e.target.value)}
          leftSlot={<span className="find-by-phone__prefix">+7</span>}
        />
      </form>
    </Modal>
  );
}
