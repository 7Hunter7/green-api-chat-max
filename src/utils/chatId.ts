/** Приводит любой ввод ("+7 999 123-45-67", "89991234567") к "79991234567@c.us" */
export function toChatId(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (!digits) throw new Error('Пустой номер телефона');
  // 8XXXXXXXXXX → 7XXXXXXXXXX (РФ)
  const normalized = digits.length === 11 && digits.startsWith('8')
    ? '7' + digits.slice(1)
    : digits;
  return `${normalized}@c.us`;
}

/** Обратное: "79991234567@c.us" → "+79991234567" */
export function fromChatId(chatId: string): string {
  const digits = chatId.replace('@c.us', '');
  return `+${digits}`;
}