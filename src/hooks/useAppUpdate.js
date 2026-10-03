/**
 * src/hooks/useAppUpdate.js
 *
 * React hook subscribing to the singleton appUpdateCoordinator.
 * Exposes update lifecycle state and user actions.
 */

import { useEffect, useState, useCallback } from "react";
import { appUpdateCoordinator } from "../pwa/appUpdateCoordinator";

export default function useAppUpdate() {
  const [state, setState] = useState(() => appUpdateCoordinator.getState());

  useEffect(() => {
    return appUpdateCoordinator.subscribe((nextState) => {
      setState(nextState);
    });
  }, []);

  const checkForUpdate = useCallback(
    (options) => appUpdateCoordinator.checkForUpdate(options),
    [],
  );

  const applyUpdate = useCallback(
    (options) => appUpdateCoordinator.applyUpdate(options),
    [],
  );

  const dismissUpdate = useCallback(
    () => appUpdateCoordinator.dismissUpdate(),
    [],
  );

  const retryUpdate = useCallback(
    () => appUpdateCoordinator.retryUpdate(),
    [],
  );

  const openModal = useCallback(
    () => appUpdateCoordinator.openModal(),
    [],
  );

  const closeModal = useCallback(
    () => appUpdateCoordinator.closeModal(),
    [],
  );

  return {
    ...state,
    checkForUpdate,
    applyUpdate,
    dismissUpdate,
    retryUpdate,
    openModal,
    closeModal,
  };
}
