import { NavButton, Menu, MenuItem, Icon } from "../../ui";
import type { ThemeMode } from "../../hooks/useTheme";
import "./Navigation.css";

export type NavigationSection =
  | "all"
  | "new"
  | "channels"
  | "contacts"
  | "calls"
  | "settings";

interface Props {
  activeSection?: NavigationSection;
  onSelectSection?: (section: NavigationSection) => void;
  onLogout?: () => void;
  themeMode?: ThemeMode;
  onThemeChange?: (mode: ThemeMode) => void;
  newCount?: number;
  channelsCount?: number;
}

export function Navigation({
  activeSection = "all",
  onSelectSection,
  onLogout,
  themeMode,
  onThemeChange,
  newCount = 0,
  channelsCount = 0,
}: Props) {
  return (
    <nav className="navigation" aria-label="Папки и профиль">
      <div className="navigation__inner">
        <div className="navigation__folders">
          <div className="navigation__folders-viewport">
            <div className="navigation__upper-trigger" aria-hidden="true" />
            <div className="navigation__item">
              <NavButton
                iconName="message_fill"
                label="Все"
                active={activeSection === "all"}
                onClick={() => onSelectSection?.("all")}
              />
            </div>

            <div
              className="navigation__draggable-viewport"
              role="list"
              tabIndex={0}
            >
              <div role="listitem" tabIndex={0}>
                <div className="navigation__item">
                  <NavButton
                    iconName="folder_fill"
                    label="Новые"
                    active={activeSection === "new"}
                    counter={newCount}
                    onClick={() => onSelectSection?.("new")}
                  />
                </div>
              </div>

              <div role="listitem" tabIndex={0}>
                <div className="navigation__item">
                  <NavButton
                    iconName="folder_fill"
                    label="Каналы"
                    active={activeSection === "channels"}
                    counter={channelsCount}
                    onClick={() => onSelectSection?.("channels")}
                  />
                </div>
              </div>
            </div>

            <div className="navigation__bottom-trigger" aria-hidden="true" />
          </div>
        </div>

        <div className="navigation__separator" />

        <div className="navigation__bottom-group">
          <NavButton
            iconName="users_fill"
            label="Контакты"
            active={activeSection === "contacts"}
            onClick={() => onSelectSection?.("contacts")}
          />

          <NavButton
            iconName="call_fill"
            label="Звонки"
            active={activeSection === "calls"}
            onClick={() => onSelectSection?.("calls")}
          />

          <div className="navigation__item navigation__item--settings">
            <Menu
              align="start"
              position="right"
              trigger={
                <NavButton
                  iconName="settings_fill"
                  label="Настройки"
                  active={activeSection === "settings"}
                  onClick={() => onSelectSection?.("settings")}
                />
              }
            >
              <MenuItem
                icon={<Icon name="magic_wand" size={20} />}
                submenu={[
                  {
                    children: "Системная",
                    active: themeMode === "system",
                    onClick: () => onThemeChange?.("system"),
                  },
                  {
                    children: "Светлая",
                    active: themeMode === "light",
                    onClick: () => onThemeChange?.("light"),
                  },
                  {
                    children: "Тёмная",
                    active: themeMode === "dark",
                    onClick: () => onThemeChange?.("dark"),
                  },
                ]}
              >
                Тема оформления
              </MenuItem>
              
              <MenuItem
                icon={<Icon name="autorization_leave" size={20} />}
                onClick={onLogout}
              >
                Выйти
              </MenuItem>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  );
}
