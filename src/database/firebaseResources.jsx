// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import {
  getToken as getAppCheckToken,
  initializeAppCheck,
  ReCaptchaV3Provider,
} from "firebase/app-check";
import { getVertexAI, getGenerativeModel } from "@firebase/vertexai";
import { getMessaging, isSupported } from "firebase/messaging";
import { firebaseConfig, appCheckSiteKey } from "./firebaseConfig.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

if (window.location.hostname === "localhost") {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

export const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(appCheckSiteKey),
  isTokenAutoRefreshEnabled: true,
});

let appCheckReadyPromise = null;
const APP_CHECK_READY_TIMEOUT_MS = 5000;

const withAppCheckTimeout = (promise) =>
  new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(
        new Error(
          "Secure verification is taking too long. Please check your connection and try again.",
        ),
      );
    }, APP_CHECK_READY_TIMEOUT_MS);

    promise.then(resolve, reject).finally(() => clearTimeout(timeoutId));
  });

export const ensureAppCheckReady = async () => {
  if (!appCheckReadyPromise) {
    appCheckReadyPromise = withAppCheckTimeout(
      getAppCheckToken(appCheck).then((tokenResult) => {
        if (!tokenResult?.token) {
          throw new Error("Firebase App Check did not return a token.");
        }

        return tokenResult.token;
      }),
    ).catch((error) => {
      appCheckReadyPromise = null;
      throw error;
    });
  }

  return appCheckReadyPromise;
};

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
const vertexAI = getVertexAI(app, { location: "global" });

const model = getGenerativeModel(vertexAI, {
  model: "gemini-3.5-flash-lite",
  generationConfig: {
    // Firebase AI Logic doesn't support Gemini 3 thinking_level yet.
    // For now, keep using thinking budgets (0 ≈ "minimal" behavior you're after).
    thinkingConfig: { thinkingBudget: 0 },
  },
});

const simplemodel = getGenerativeModel(vertexAI, {
  model: "gemini-3.5-flash-lite",
  generationConfig: {
    // Firebase AI Logic doesn't support Gemini 3 thinking_level yet.
    // For now, keep using thinking budgets (0 ≈ "minimal" behavior you're after).
    thinkingConfig: { thinkingBudget: 0 },
  },
});

const questionGenerationModel = getGenerativeModel(vertexAI, {
  model: "gemini-3.5-flash-lite",
  generationConfig: {
    // Generated questions are parsed and rendered as card data in the UI.
    responseMimeType: "application/json",
    thinkingConfig: { thinkingBudget: 0 },
  },
});

const adaptiveLearningModel = getGenerativeModel(vertexAI, {
  model: "gemini-3.5-flash-lite",
  generationConfig: {
    // Keep adaptive-learning suggestions fast while preserving Markdown output.
    thinkingConfig: { thinkingBudget: 0 },
  },
});

const promodel = getGenerativeModel(vertexAI, {
  // model: "gemini-1.5-flash",
  model: "gemini-2.5-pro-preview-03-25",
});

const thinkingmodel = getGenerativeModel(vertexAI, {
  model: "gemini-3.5-flash-lite",
  generationConfig: {
    // Firebase AI Logic doesn't support Gemini 3 thinking_level yet.
    // For now, keep using thinking budgets (0 ≈ "minimal" behavior you're after).
    thinkingConfig: { thinkingBudget: 0 },
  },
});

const educationmodel = getGenerativeModel(vertexAI, {
  model: "gemini-3.5-flash-lite",
  generationConfig: {
    // Keep Learn modal output fast and low-latency while testing this model.
    thinkingConfig: { thinkingBudget: 0 },
  },
});

const conversationReviewModel = getGenerativeModel(vertexAI, {
  model: "gemini-3.5-flash-lite",
  generationConfig: {
    // Keep Conversation Review responses fast while testing this model.
    thinkingConfig: { thinkingBudget: 0 },
  },
});

const knowledgeLedgerOnboardingModel = getGenerativeModel(vertexAI, {
  model: "gemini-3.5-flash-lite",
  generationConfig: {
    // Keep Knowledge Ledger onboarding generation fast while testing this model.
    thinkingConfig: { thinkingBudget: 0 },
  },
});

const knowledgeLedgerModalModel = getGenerativeModel(vertexAI, {
  model: "gemini-3.5-flash-lite",
  generationConfig: {
    // Keep Knowledge Ledger modal generation fast while testing this model.
    thinkingConfig: { thinkingBudget: 0 },
  },
});

const gradingModel = getGenerativeModel(vertexAI, {
  model: "gemini-3.5-flash-lite",
  generationConfig: {
    // Grade in the frontend with fast JSON-only responses for comparison.
    responseMimeType: "application/json",
    thinkingConfig: { thinkingBudget: 0 },
  },
});

const chessModel = getGenerativeModel(vertexAI, {
  model: "gemini-3.7-flash",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

export {
  database,
  analytics,
  model,
  simplemodel,
  questionGenerationModel,
  adaptiveLearningModel,
  messaging,
  promodel,
  thinkingmodel,
  educationmodel,
  conversationReviewModel,
  knowledgeLedgerOnboardingModel,
  knowledgeLedgerModalModel,
  gradingModel,
  chessModel,
};

