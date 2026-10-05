import { useState } from "react";
import { Button, Icon, Input } from "../../ui";
import { MaxLogo } from "./MaxLogo";
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
      <form className="login-card" onSubmit={submit}>
        <Button
          type="button"
          variant="ghost"
          size="small"
          className="login-back"
          icon={<Icon name="arrow_left" size={20} />}
          onClick={onBack}
        >
          Назад
        </Button>

        <MaxLogo size={28} />

        <h2 className="login-card__title login-card__title--small">
          Введите пароль для входа
        </h2>
        <p className="login-card__hint">Ваш профиль дополнительно защищён</p>

        <Input
          size="default"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          autoFocus
          autoComplete="current-password"
        />

        {error && <div className="login-error">{error}</div>}

        <Button
          type="submit"
          variant="primary"
          size="large"
          stretched
          disabled={loading}
        >
          {loading ? "Отправка…" : "Продолжить"}
        </Button>
      </form>
    </div>
  );
}
