import { collection, doc, getDocFromServer as getDoc, getDocsFromServer as getDocs, runTransaction, onSnapshot } from "firebase/firestore";
import { database } from "../database/firebaseResources.jsx";
import { createAchievementPersistence } from "./firestoreRecords.js";
import { createFirestoreAchievementBackfill } from "./backfill.js";
import { codingBackfillProofs } from "./backfillCoding.js";
import { readProgressLedger } from "./progressionRuntime.js";
import { codingEvidenceForLedger } from "./codingProgress.js";
import { steps } from "../utility/content.jsx";
import { videoTranscript } from "../utility/transcript.jsx";

// Reevaluate every course with saved work, even on the home/transcript screen.
function progressEvidence(source, ledger) {
  if (source !== "robotsbuildingeducation") return [];
  const videos = Object.keys(videoTranscript).filter(group => videoTranscript[group]?.videoSrc);
  return codingEvidenceForLedger(steps, ledger, videos);
}
const dependencies = { database, collection, doc, getDoc, getDocs, runTransaction, onSnapshot, progressEvidence };
export const achievementPersistence = {
  ...createAchievementPersistence(dependencies),
  ...createFirestoreAchievementBackfill({ ...dependencies, source: "robotsbuildingeducation",
    scan: async npub => {
      const [profileSnapshot, answersSnapshot] = await Promise.all([
        getDoc(doc(database, "users", npub)),
        getDocs(collection(database, "users", npub, "answers")),
      ]);
      if (!profileSnapshot.exists()) throw new Error("Achievement catch-up is waiting for the account profile");
      return codingBackfillProofs({ profile: profileSnapshot.data(),
        answers: answersSnapshot.docs.map(snapshot => snapshot.data()), courseMap: steps,
        ledger: readProgressLedger(npub, "robotsbuildingeducation"),
        videoGroups: Object.keys(videoTranscript).filter(group => videoTranscript[group]?.videoSrc),
      });
    },
  }),
};
