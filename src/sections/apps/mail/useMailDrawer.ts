import { useState, useCallback } from 'react';

export function useMailDrawer(initialOpen = true) {
  const [openDrawer, setOpenDrawer] = useState<boolean>(initialOpen);

  const toggleDrawer = useCallback(() => {
    setOpenDrawer((prev) => !prev);
  }, []);

  return { openDrawer, setOpenDrawer, toggleDrawer };
}
