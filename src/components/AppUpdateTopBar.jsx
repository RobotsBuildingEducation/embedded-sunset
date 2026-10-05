import React, { useRef, useState } from "react";
import useAppUpdate from "../hooks/useAppUpdate.js";
import { getInitialUserLanguage } from "../utils/defaultLanguage.js";
import "./appUpdateTopBar.css";

const COPY = {
  en: { update: "Update App", updating: "Updating…", label: "App update available" },
  es: { update: "Actualizar app", updating: "Actualizando…", label: "Actualización disponible" },
};

// Native elements also work in the chess and investing entries without Chakra.
export default function AppUpdateTopBar({ language = getInitialUserLanguage() }) {
  const { isUpdateReady, uiState, errorMessage, applyUpdate } = useAppUpdate();
  const [isPressed, setIsPressed] = useState(false);
  const pressLock = useRef(false);
  const copy = COPY[language] || COPY.en;
  const isApplying = isPressed || uiState === "applying";

  if (!isUpdateReady || uiState === "deferred") return null;

  const handleUpdate = async () => {
    if (pressLock.current || isApplying) return;
    pressLock.current = true;
    setIsPressed(true);
    try {
      await applyUpdate();
    } finally {
      pressLock.current = false;
      setIsPressed(false);
    }
  };

  return (
    <>
      <div className="app-update-top-bar" role="region" aria-label={copy.label} aria-busy={isApplying}>
        <div className="app-update-top-bar-row">
          <div className="app-update-actions">
            <button type="button" className="app-update-apply" onClick={handleUpdate} disabled={isApplying}>
              {isApplying && <span className="app-update-spinner" aria-hidden="true" />}
              {isApplying ? copy.updating : copy.update}
            </button>
          </div>
        </div>
        {errorMessage && <p className="app-update-error" role="status">{errorMessage}</p>}
      </div>
      <div className="app-update-spacer" aria-hidden="true" />
    </>
  );
}
