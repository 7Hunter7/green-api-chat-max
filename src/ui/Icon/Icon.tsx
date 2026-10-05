import "./Icon.css";

/**
 * Имена иконок, доступных в `public/icons.svg`.
 * Список намеренно явный (а не `string`), чтобы TypeScript ловил опечатки.
 * Расширяй по мере необходимости, добавляя `| 'icon_name'`.
 */
export type IconName =
  // Управление и навигация
  | "arrow_left"
  | "arrow_right"
  | "chevron_left"
  | "chevron_right"
  | "chevron_down"
  | "chevron_down_mini"
  | "chevron_up_mini"
  | "chevron_right_mini"
  // Действия
  | "plus"
  | "plus_mini"
  | "cross"
  | "cross_mini"
  | "cross_round"
  | "minus"
  | "minus_round"
  | "redo"
  | "check"
  | "check_mini"
  | "check_round"
  | "check_round_fill"
  | "send"
  | "search"
  | "edit"
  | "copy"
  | "copy_fill"
  | "delete"
  | "delete_fill"
  | "download"
  | "attachment"
  | "share_ios"
  | "share_screen"
  | "share_screen_fill"
  | "forward"
  | "forward_fill"
  | "reply"
  | "reply_fill"
  // Меню
  | "dots_horizontal"
  | "dots_horizontal_mini"
  | "dots_vertical"
  | "dots_vertical_mini"
  | "reorder"
  | "reorder_big"
  | "message"
  | "message_fill"
  // Медиа
  | "smile_happy"
  | "microphone"
  | "microphone_fill"
  | "microphone_crossed"
  | "microphone_crossed_fill"
  | "video_message"
  | "video_message_stop"
  | "sticker"
  | "image"
  | "image_add"
  | "file"
  | "file_big"
  | "folder"
  | "folder_fill"
  | "play"
  | "play_fill"
  | "pause_fill"
  // Профиль и настройки
  | "user"
  | "user_fill"
  | "user_add"
  | "user_crossed"
  | "users"
  | "users_fill"
  | "users_add"
  | "settings"
  | "settings_fill"
  | "globe"
  | "question"
  | "info"
  | "info_fill"
  | "eye"
  | "eye_fill"
  | "eye_crossed"
  | "eye_crossed_fill"
  | "password"
  | "privacy"
  | "privacy_fill"
  | "privacy_policy"
  | "key"
  // Уведомления
  | "notifications"
  | "notifications_crossed"
  | "notifications_crossed_fill"
  | "bookmark"
  | "bookmark_fill"
  | "pin"
  | "pin_fill"
  | "pin_crossed"
  // Статусы
  | "status_delivered"
  | "status_read"
  | "clock"
  | "clock_fill"
  | "clock_expired"
  | "warning"
  | "warning_fill"
  | "warning_fill_color"
  | "warning_fill_color_mini"
  // Авторизация
  | "autorization_leave"
  | "qr_code"
  | "verification"
  | "verification_mini"
  | "verification_mini_themed"
  | "block"
  // Звонки
  | "call"
  | "call_fill"
  | "call_incoming_fill"
  | "call_outgoing_fill"
  | "call_missed_fill"
  | "video_call"
  | "video_call_fill"
  // Загрузка
  | "spinner_ios"
  | "spinner_android";

export interface IconProps {
  name: IconName;
  /** Размер в px. По умолчанию 24 (совпадает с viewBox в спрайте) */
  size?: number;
  className?: string;
  /** Если задан — иконка доступна для скринридеров (role="img") */
  "aria-label"?: string;
  /** Если `true` (по умолчанию) — иконка декоративная */
  "aria-hidden"?: boolean;
}

export function Icon({
  name,
  size = 24,
  className = "",
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
}: IconProps) {
  // Если есть aria-label — иконка значимая, иначе декоративная
  const isDecorative = !ariaLabel || ariaHidden === true;

  return (
    <svg
      className={`icon ${className}`.trim()}
      width={size}
      height={size}
      role={isDecorative ? undefined : "img"}
      aria-label={isDecorative ? undefined : ariaLabel}
      aria-hidden={isDecorative || undefined}
      focusable="false"
    >
      <use href={`/icons.svg#icon_${name}`} />
    </svg>
  );
}
