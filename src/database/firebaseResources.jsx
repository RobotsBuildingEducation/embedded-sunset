// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getVertexAI, getGenerativeModel } from "@firebase/vertexai";
import { getMessaging, isSupported } from "firebase/messaging";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  // apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  apiKey: "AIzaSyA7JiUybOOoa83Xe49tJbhrMvjapgfNEH8",
  authDomain: "test-data-895e2.firebaseapp.com",
  projectId: "test-data-895e2",
  storageBucket: "test-data-895e2.appspot.com",
  messagingSenderId: "422553960926",
  appId: "1:422553960926:web:b82f7d896823cf59b69d4f",
  measurementId: "G-QGT3G8JQ8F",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

if (window.location.hostname === "localhost") {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

export const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("6LdzBVwqAAAAABT9kfIUQjeLb0nWjqZ3WzbhZIjh"),
  isTokenAutoRefreshEnabled: true,
});
const database = getFirestore(app);
const analytics = getAnalytics(app);
let messaging = null;
// getMessaging(app);

async function initMessaging() {
  if (await isSupported()) {
    messaging = getMessaging(app);
    // Proceed with messaging-related logic
    console.log("messaging...", messaging);
  } else {
    console.warn("Firebase Messaging is not supported in this environment.");
    // Optionally, set up a fallback or skip messaging entirely
  }
}

initMessaging();
const vertexAI = getVertexAI(app);

const model = getGenerativeModel(vertexAI, {
  // model: "gemini-1.5-flash",
  model: "gemini-2.0-flash-001",
});

const simplemodel = getGenerativeModel(vertexAI, {
  // model: "gemini-1.5-flash",
  // model: "gemini-2.0-flash-001",
  model: "gemini-2.0-flash",
});

const promodel = getGenerativeModel(vertexAI, {
  // model: "gemini-1.5-flash",
  model: "gemini-2.5-pro-preview-03-25",
});

const thinkingmodel = getGenerativeModel(vertexAI, {
  // model: "gemini-1.5-flash",
  model: "gemini-2.5-flash",
  generationConfig: {
    thinkingConfig: { thinkingBudget: 0 }, // disables thinking
  },
});

export {
  database,
  analytics,
  model,
  simplemodel,
  messaging,
  promodel,
  thinkingmodel,
};
