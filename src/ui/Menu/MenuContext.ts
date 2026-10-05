import { createContext, useContext } from "react";

export interface MenuContextValue {
  /** Закрыть всё меню (и родителя, и все подменю) */
  closeAll: () => void;
  /** ID открытого подменю (для согласования между пунктами) */
  openSubmenuId: string | null;
  /** Открыть подменю с данным id (закрывает остальные) */
  setOpenSubmenuId: (id: string | null) => void;
}

export const MenuContext = createContext<MenuContextValue | null>(null);

export function useMenuContext(): MenuContextValue | null {
  return useContext(MenuContext);
}
