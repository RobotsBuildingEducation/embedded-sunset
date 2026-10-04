import { collection, doc, getDocsFromServer as getDocs, runTransaction, onSnapshot } from "firebase/firestore";
import { database } from "../database/firebaseResources.jsx";
import { createAchievementPersistence } from "./firestoreRecords.js";
import { codingEvidenceForLedger } from "./codingProgress.js";
import { steps } from "../utility/content.jsx";
import { videoTranscript } from "../utility/transcript.jsx";

// Reevaluate every course with saved work, even on the home/transcript screen.
function progressEvidence(source, ledger) {
  if (source !== "robotsbuildingeducation") return [];
  const videos = Object.keys(videoTranscript).filter(group => videoTranscript[group]?.videoSrc);
  return codingEvidenceForLedger(steps, ledger, videos);
}
export const achievementPersistence = createAchievementPersistence({ database, collection, doc, getDocs, runTransaction, onSnapshot, progressEvidence });
