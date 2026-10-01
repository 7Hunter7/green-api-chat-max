import type { Credentials, GreenApiSendResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://3100.api.green-api.com';

const buildUrl = (c: Credentials, method: string) =>
  `${BASE_URL}/waInstance${c.idInstance}/${method}/${c.apiTokenInstance}`;

/** Проверка учетных данных */
export async function getStateInstance(c: Credentials): Promise<string> {
  const res = await fetch(buildUrl(c, 'getStateInstance'));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.stateInstance as string;
}

/** Отправка текстового сообщения */
export async function sendMessage(
  c: Credentials,
  chatId: string,
  message: string,
): Promise<GreenApiSendResponse> {
  const res = await fetch(buildUrl(c, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Получить одно уведомление (или null) */
export async function receiveNotification(c: Credentials): Promise<any | null> {
  const res = await fetch(buildUrl(c, 'receiveNotification'));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/** Удалить уведомление — обязательно, иначе следующее не придет */
export async function deleteNotification(c: Credentials, receiptId: number): Promise<void> {
  await fetch(buildUrl(c, `deleteNotification/${receiptId}`), { method: 'DELETE' });
}