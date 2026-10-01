import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getQrCode,
  getStateInstance,
  sendAuthorizationPassword,
} from '../../api/greenApi';
import type { Credentials, InstanceState } from '../../types';
import './LoginForm.css';

interface Props {
  onLogin: (c: Credentials) => void;
}

type Stage = 'credentials' | 'qr' | 'password';

export function LoginForm({ onLogin }: Props) {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiToken] = useState('');
  const [stage, setStage] = useState<Stage>('credentials');
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [instanceState, setInstanceState] = useState<InstanceState | null>(null);
  const credsRef = useRef<Credentials | null>(null);
  const qrTimerRef = useRef<number | null>(null);

  const credentials: Credentials = {
    idInstance: idInstance.trim(),
    apiTokenInstance: apiTokenInstance.trim(),
  };

  const stopQrPolling = () => {
    if (qrTimerRef.current) {
      window.clearInterval(qrTimerRef.current);
      qrTimerRef.current = null;
    }
  };

  const checkState = useCallback(async () => {
    const c = credsRef.current;
    if (!c) return;
    try {
      const state = (await getStateInstance(c)) as InstanceState;
      setInstanceState(state);
      if (state === 'authorized') {
        stopQrPolling();
        onLogin(c);
      }
      if (state === 'pendingPassword') {
        setStage('password');
      }
    } catch (e) {
      console.warn('state check failed', e);
    }
  }, [onLogin]);

  // Первый шаг — ввод креденшелов
  const submitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const state = (await getStateInstance(credentials)) as InstanceState;
      setInstanceState(state);
      credsRef.current = credentials;

      if (state === 'authorized') {
        onLogin(credentials);
        return;
      }
      if (state === 'pendingPassword') {
        setStage('password');
        return;
      }
      if (state === 'notAuthorized' || state === 'starting') {
        setStage('qr');
        return;
      }
      throw new Error(`Не удалось войти. Статус: ${state}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  // Второй шаг — QR (обновление каждые 5 сек)
  useEffect(() => {
    if (stage !== 'qr' || !credsRef.current) return;
    const c = credsRef.current;

    const fetchQr = async () => {
      try {
        const res = await getQrCode(c);
        if (res.type === 'qrCode') {
          setQrSrc(`data:image/png;base64,${res.message}`);
        } else if (res.type === 'already_registered') {
          // уже авторизован — просто уходим дальше
          await checkState();
        } else if (res.type === 'error') {
          setError(`QR: ${res.message}`);
        }
      } catch (err) {
        console.warn('qr fetch failed', err);
      }
    };

    fetchQr();
    qrTimerRef.current = window.setInterval(fetchQr, 5000);

    // Параллельно опрашиваем состояние — вдруг пользователь отсканировал
    const stateTimer = window.setInterval(checkState, 3000);

    return () => {
      stopQrPolling();
      window.clearInterval(stateTimer);
    };
  }, [stage, checkState]);

  // Третий шаг — ввод пароля 2FA
  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credsRef.current) return;
    setError(null);
    setLoading(true);
    try {
      const res = await sendAuthorizationPassword(credsRef.current, password);
      if (res.status && res.data.status === 'success') {
        onLogin(credsRef.current);
        return;
      }
      const reason = res.data.reason || 'unknown';
      const reasonMap: Record<string, string> = {
        invalid_password: 'Неверный пароль',
        rate_limit_exceeded: 'Слишком много попыток, попробуйте позже',
        authorization_not_started: 'Сначала отсканируйте QR',
        already_registered: 'Инстанс уже авторизован',
        timeout: 'Сервер MAX не ответил',
      };
      throw new Error(reasonMap[reason] ?? `Ошибка: ${reason}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  // Сброс к первому шагу
  const reset = () => {
    stopQrPolling();
    setStage('credentials');
    setQrSrc(null);
    setPassword('');
    setError(null);
    setInstanceState(null);
    credsRef.current = null;
  };

  if (stage === 'credentials') {
    return (
      <div className="login-wrap">
        <form className="login-card" onSubmit={submitCredentials}>
          <h1>GREEN-API Chat</h1>
          <input
            placeholder="idInstance"
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            required
          />
          <input
            placeholder="apiTokenInstance"
            value={apiTokenInstance}
            onChange={(e) => setApiToken(e.target.value)}
            required
            type="password"
          />
          {error && <div className="login-error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Проверка…' : 'Войти'}
          </button>
        </form>
      </div>
    );
  }

  if (stage === 'qr') {
    return (
      <div className="login-wrap">
        <div className="login-card">
          <h1>Сканируйте QR</h1>
          <p className="login-hint">
            Откройте MAX → Настройки → Устройства → Подключить устройство
          </p>
          <div className="login-qr">
            {qrSrc ? (
              <img src={qrSrc} alt="QR" />
            ) : (
              <div className="login-qr__placeholder">Загрузка…</div>
            )}
          </div>
          {instanceState && (
            <div className="login-state">Статус: {instanceState}</div>
          )}
          {error && <div className="login-error">{error}</div>}
          <button type="button" onClick={reset}>
            Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submitPassword}>
        <h1>Пароль 2FA</h1>
        <p className="login-hint">
          На аккаунте MAX включена двухфакторная аутентификация. Введите пароль.
        </p>
        <input
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          autoFocus
        />
        {error && <div className="login-error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Отправка…' : 'Отправить'}
        </button>
        <button
          type="button"
          className="login-card__secondary"
          onClick={reset}
        >
          Назад
        </button>
      </form>
    </div>
  );
}