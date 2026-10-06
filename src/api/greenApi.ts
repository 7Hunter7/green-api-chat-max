import type {
  Credentials,
  GreenApiNotification,
  GreenApiSendResponse,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://3100.api.green-api.com';

/**
 * Универсальный билдер URL.
 * Формат: {base}/waInstance{idInstance}/{method}/{apiTokenInstance}
 * Префикс /v3/ НЕ используется — все методы работают без него.
 */
const buildUrl = (c: Credentials, method: string) =>
  `${BASE_URL}/waInstance${c.idInstance}/${method}/${c.apiTokenInstance}`;

/** Проверка учетных данных */
export async function getStateInstance(c: Credentials): Promise<string> {
  const res = await fetch(buildUrl(c, 'getStateInstance'));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.stateInstance as string;
}

/** Ошибка GREEN-API с телом ответа */
export class GreenApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `HTTP ${status}`);
    this.name = 'GreenApiError';
    this.status = status;
    this.body = body;
  }
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

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      // ignore
    }
    throw new GreenApiError(res.status, body);
  }
  return res.json();
}

/** Получить одно уведомление (или null при таймауте) */
export async function receiveNotification(
  c: Credentials,
): Promise<GreenApiNotification | null> {
  const res = await fetch(buildUrl(c, 'receiveNotification'));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return text ? (JSON.parse(text) as GreenApiNotification) : null;
}

/**
 * Удалить уведомление — обязательно, иначе следующее не придёт.
 * URL: {base}/waInstance{idInstance}/deleteNotification/{apiTokenInstance}/{receiptId}
 * apiTokenInstance ИДЁТ ПЕРЕД receiptId — порядок важен!
 */
export async function deleteNotification(
  c: Credentials,
  receiptId: number,
): Promise<void> {
  const url = `${BASE_URL}/waInstance${c.idInstance}/deleteNotification/${c.apiTokenInstance}/${receiptId}`;
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`deleteNotification failed: HTTP ${res.status} ${text}`);
  }
}

/** Получить QR-код (base64) для авторизации инстанса MAX */
export async function getQrCode(
  c: Credentials,
): Promise<{ type: string; message: string }> {
  const res = await fetch(buildUrl(c, 'qr'));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Отправить пароль 2FA (Cloud Password) */
export async function sendAuthorizationPassword(
  c: Credentials,
  password: string,
): Promise<{ status: boolean; data: { status: string; reason: string } }> {
  const res = await fetch(buildUrl(c, 'sendAuthorizationPassword'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Разлогинить инстанс */
export async function logout(c: Credentials): Promise<{ isLogout: boolean }> {
  const res = await fetch(buildUrl(c, 'logout'));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Проверить наличие аккаунта MAX по номеру телефона → получить chatId */
export async function checkAccount(
  c: Credentials,
  phoneNumber: string,
  force = false,
): Promise<{
  exist: boolean;
  chatId: string;
  fromCache?: boolean;
  status?: boolean;
  reason?: string;
}> {
  const digits = phoneNumber.replace(/\D/g, '');
  const res = await fetch(buildUrl(c, 'checkAccount'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: Number(digits), force }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Получить настройки инстанса */
export async function getSettings(c: Credentials) {
  const res = await fetch(buildUrl(c, 'getSettings'));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Установить настройки инстанса */
export async function setSettings(
  c: Credentials,
  settings: Record<string, string | number>,
) {
  const res = await fetch(buildUrl(c, 'setSettings'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}