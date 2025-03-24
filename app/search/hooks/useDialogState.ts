import { useCallback, useState } from "react";

/**
 * Hook to manage open/close state for dialogs like export modal
 */
export function useDialogState() {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  return {
    open,
    handleOpen,
    handleClose,
    setOpen,
  };
}
