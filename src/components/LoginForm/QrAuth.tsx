import { useCallback, useEffect, useRef, useState } from "react";
import { getQrCode, getStateInstance } from "../../api/greenApi";
import type { Credentials, InstanceState } from "../../types";
import { CredentialsForm } from "./CredentialsForm";
import "./LoginForm.css";

interface Props {
  onLogin: (c: Credentials) => void;
  onPendingPassword: (c: Credentials) => void;
  onBack: () => void;
}

type Stage = "credentials" | "qr";

export function QrAuth({ onLogin, onPendingPassword, onBack }: Props) {
  const [stage, setStage] = useState<Stage>("credentials");
  const [creds, setCreds] = useState<Credentials | null>(null);
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const qrTimerRef = useRef<number | null>(null);
  const stateTimerRef = useRef<number | null>(null);

  const stopTimers = () => {
    if (qrTimerRef.current) window.clearInterval(qrTimerRef.current);
    if (stateTimerRef.current) window.clearInterval(stateTimerRef.current);
    qrTimerRef.current = null;
    stateTimerRef.current = null;
  };

  const loadQr = useCallback(
    async (c: Credentials, manual = false) => {
      if (manual) setRefreshing(true);
      try {
        const res = await getQrCode(c);
        if (res.type === "qrCode") {
          setQrSrc(`data:image/png;base64,${res.message}`);
          setError(null);
        } else if (res.type === "already_registered") {
          // уже авторизован — просто уходим в чат
          onLogin(c);
        } else if (res.type === "error") {
          setError(`QR: ${res.message}`);
        }
      } catch (e) {
        console.warn("qr fetch failed", e);
      } finally {
        if (manual) setRefreshing(false);
      }
    },
    [onLogin],
  );

  // Когда вошли во второй этап — запускаем QR polling + state polling
  useEffect(() => {
    if (stage !== "qr" || !creds) return;

    // Первый запрос — асинхронно, чтобы не было синхронного setState в эффекте
    const initialTimer = window.setTimeout(() => loadQr(creds), 0);

    qrTimerRef.current = window.setInterval(() => loadQr(creds), 5000);

    stateTimerRef.current = window.setInterval(async () => {
      try {
        const state = (await getStateInstance(creds)) as InstanceState;
        if (state === "authorized") {
          stopTimers();
          onLogin(creds);
        } else if (state === "pendingPassword") {
          stopTimers();
          onPendingPassword(creds);
        }
      } catch (e) {
        console.warn("state polling failed", e);
      }
    }, 3000);

    return () => {
      window.clearTimeout(initialTimer);
      stopTimers();
    };
  }, [stage, creds, loadQr, onLogin, onPendingPassword]);

  if (stage === "credentials") {
    return (
      <CredentialsForm
        onAuthorized={onLogin}
        onPendingPassword={onPendingPassword}
        onNotAuthorized={(c) => {
          setCreds(c);
          setStage("qr");
        }}
        onBack={onBack}
        submitLabel="Получить QR-код"
      />
    );
  }

  // stage === 'qr'
  return (
    <div className="login-wrap">
      <div className="login-card login-card--qr">
        <button
          type="button"
          className="login-back"
          onClick={() => {
            stopTimers();
            onBack();
          }}
          aria-label="Назад"
        >
          ← Назад
        </button>

        <div className="qr-wrap">
          {qrSrc ? (
            <img src={qrSrc} alt="QR" className="qr-image" />
          ) : (
            <div className="qr-placeholder">Загрузка QR…</div>
          )}
        </div>

        <h2 className="login-card__title login-card__title--small">
          Войдите в MAX по QR-коду
        </h2>
        <p className="login-card__hint">
          Наведите камеру на QR-код, чтобы войти в профиль или скачать
          приложение
        </p>

        {error && <div className="login-error">{error}</div>}

        <button
          type="button"
          className="login-card__secondary"
          onClick={() => creds && loadQr(creds, true)}
          disabled={refreshing}
        >
          {refreshing ? "Обновление…" : "Обновить QR"}
        </button>
      </div>
    </div>
  );
}
