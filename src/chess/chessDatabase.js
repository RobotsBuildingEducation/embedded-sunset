import { getApps, initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { firebaseConfig, appCheckSiteKey } from "../database/firebaseConfig.js";

export function getChessDatabase() {
  const name = "chess-realtime";
  const existing = getApps().find((app) => app.name === name);
  if (existing) return getFirestore(existing);

  // Keep the local chess emulator connection independent of the learning app.
  const app = initializeApp(
    {
      ...firebaseConfig,
      projectId:
        import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
    },
    name,
  );
  if (import.meta.env.DEV) {
    // Vite forwards Firestore's streaming endpoint to the emulator. Using the
    // page origin also works for IPv6, other devices, and HTTPS dev tunnels.
    return initializeFirestore(app, {
      host: window.location.host,
      ssl: window.location.protocol === "https:",
    });
  }

  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
  return getFirestore(app);
}
