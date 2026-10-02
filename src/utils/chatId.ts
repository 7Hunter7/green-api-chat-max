/** "+7 999 123-45-67" -> "79991234567" */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (!digits) throw new Error('Пустой номер телефона');
  return digits.length === 11 && digits.startsWith('8')
    ? '7' + digits.slice(1)
    : digits;
}

/** "79991234567" -> "+7 999 123-45-67" */
export function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.length === 11 && (d.startsWith('7') || d.startsWith('8'))) {
    return `+${d[0]} ${d.slice(1, 4)} ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9)}`;
  }
  return `+${d}`;
}