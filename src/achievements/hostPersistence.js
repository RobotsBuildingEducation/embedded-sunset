import { collection, doc, getDocs, runTransaction } from "firebase/firestore";
import { database } from "../database/firebaseResources.jsx";
import { createAchievementPersistence } from "./firestoreRecords.js";
export const achievementPersistence = createAchievementPersistence({ database, collection, doc, getDocs, runTransaction });
