import { useState } from "react";
import { sendAuthorizationPassword } from "../../api/greenApi";
import type { Credentials } from "../../types";
import "./LoginForm.css";

interface Props {
  credentials: Credentials;
  onLogin: (c: Credentials) => void;
  onBack: () => void;
}

const REASON_MAP: Record<string, string> = {
  invalid_password: "Неверный пароль",
  rate_limit_exceeded: "Слишком много попыток, попробуйте позже",
  authorization_not_started: "Сначала отсканируйте QR",
  already_registered: "Инстанс уже авторизован",
  timeout: "Сервер MAX не ответил",
};

export function PasswordAuth({ credentials, onLogin, onBack }: Props) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await sendAuthorizationPassword(credentials, password);
      if (res.status && res.data.status === "success") {
        onLogin(credentials);
        return;
      }
      const reason = res.data.reason || "unknown";
      throw new Error(REASON_MAP[reason] ?? `Ошибка: ${reason}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card login-card--max" onSubmit={submit}>
        <button
          type="button"
          className="login-back"
          onClick={onBack}
          aria-label="Назад"
        >
          ← Назад
        </button>

        <div className="lock-icon" aria-hidden>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M6 8a6 6 0 1 1 12 0v1.52c.47.153.897.388 1.28.769.919.912 1.016 2.089 1.13 3.488l.02.228c.042.503.07 1.015.07 1.495s-.028.992-.07 1.495l-.02.228c-.114 1.4-.211 2.576-1.13 3.488-.494.492-1.06.74-1.7.884-.582.13-1.287.185-2.09.247l-.065.005c-1.1.085-2.318.153-3.425.153s-2.325-.068-3.425-.153l-.064-.005c-.804-.062-1.51-.117-2.09-.247-.641-.143-1.207-.392-1.702-.884-.918-.912-1.015-2.089-1.13-3.488l-.019-.228A18 18 0 0 1 3.5 15.5c0-.48.028-.992.07-1.495l.02-.228c.114-1.4.211-2.576 1.13-3.488A3.15 3.15 0 0 1 6 9.519zm2 1.199.51-.04.065-.006C9.675 9.068 10.893 9 12 9s2.325.068 3.425.153l.064.005.511.04V8a4 4 0 0 0-8 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <h2 className="login-card__title login-card__title--small">
          Введите пароль для входа
        </h2>
        <p className="login-card__hint">Ваш профиль дополнительно защищён</p>

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
          {loading ? "Отправка…" : "Продолжить"}
        </button>
      </form>
    </div>
  );
}
