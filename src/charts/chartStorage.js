import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { database } from "../database/firebaseResources";
import { ensureIdentity } from "../utility/identity";

const DRAFT_STORAGE_KEY = "simple_pie_charts_draft";

/**
 * Returns current Nostr user npub & nsec.
 * Falls back to ensureIdentity if none exists yet.
 */
export function getCurrentNostrIdentity() {
  if (typeof window === "undefined") {
    return { npub: null, nsec: null };
  }
  let npub = localStorage.getItem("local_npub");
  let nsec = localStorage.getItem("local_nsec");

  if (!npub) {
    try {
      const identity = ensureIdentity(localStorage);
      npub = identity.npub;
      nsec = localStorage.getItem("local_nsec");
    } catch (err) {
      console.warn("Could not auto-generate Nostr identity", err);
    }
  }

  return { npub, nsec };
}

/**
 * Saves a chart to users/{npub}/charts/{chartId}
 */
export async function saveChartToFirestore(npub, chartData) {
  if (!npub) {
    throw new Error("Cannot save chart: User npub is required.");
  }

  const chartId = chartData.id || `chart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();

  // Ensure parent user document exists so firestore parent-match rules pass
  try {
    const userDocRef = doc(database, "users", npub);
    await setDoc(userDocRef, { npub }, { merge: true });
  } catch (err) {
    console.warn("Notice: ensure parent user doc:", err);
  }

  const chartDocRef = doc(database, "users", npub, "charts", chartId);
  const payload = {
    id: chartId,
    title: (chartData.title || "Untitled Chart").trim(),
    type: chartData.type || "pie",
    rows: Array.isArray(chartData.rows) ? chartData.rows : [],
    createdAt: chartData.createdAt || now,
    updatedAt: now,
    settings: {
      donutHoleSize: chartData.settings?.donutHoleSize ?? 55,
      showLegend: chartData.settings?.showLegend ?? true,
      showPercentages: chartData.settings?.showPercentages ?? true,
      paletteKey: chartData.settings?.paletteKey || "sunset",
    },
  };

  await setDoc(chartDocRef, payload, { merge: true });
  return payload;
}

/**
 * Fetches all saved charts in users/{npub}/charts
 */
export async function fetchUserChartsFromFirestore(npub) {
  if (!npub) return [];

  try {
    const chartsColRef = collection(database, "users", npub, "charts");
    const snapshot = await getDocs(chartsColRef);
    const charts = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      charts.push({
        ...data,
        id: docSnap.id,
      });
    });

    // Sort by latest updated first
    charts.sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    return charts;
  } catch (err) {
    console.error("Error fetching user charts:", err);
    throw err;
  }
}

/**
 * Deletes a chart from users/{npub}/charts/{chartId}
 */
export async function deleteChartFromFirestore(npub, chartId) {
  if (!npub || !chartId) {
    throw new Error("npub and chartId are required to delete a chart.");
  }
  const chartDocRef = doc(database, "users", npub, "charts", chartId);
  await deleteDoc(chartDocRef);
  return chartId;
}

/**
 * Local draft persistence for immediate offline resiliency
 */
export function saveLocalDraft(chartData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(chartData));
  } catch (e) {
    // Ignore quota errors
  }
}

export function loadLocalDraft() {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
}

export function clearLocalDraft() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (e) {
    // Ignore
  }
}
