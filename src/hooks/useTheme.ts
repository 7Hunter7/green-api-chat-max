import { useCallback, useEffect, useState } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ColorScheme = 'light' | 'dark';

const LS_KEY = 'green-api-chat-theme';

function loadTheme(): ThemeMode {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  } catch {
    // ignore
  }
  return 'system';
}

function saveTheme(mode: ThemeMode) {
  localStorage.setItem(LS_KEY, mode);
}

/** Возвращает текущую активную схему с учётом системных настроек */
function resolveScheme(mode: ThemeMode): ColorScheme {
  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';
  // system
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return 'dark';
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(() => loadTheme());

  // Применяем схему к <html>
  useEffect(() => {
    const scheme = resolveScheme(mode);
    document.documentElement.dataset.colorScheme = scheme;
    document.documentElement.dataset.colorTheme = 'space';
  }, [mode]);

  // Слушаем системные изменения, если mode === 'system'
  useEffect(() => {
    if (mode !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      document.documentElement.dataset.colorScheme = mq.matches
        ? 'dark'
        : 'light';
    };

    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    saveTheme(next);
  }, []);

  return { mode, setMode, scheme: resolveScheme(mode) };
}