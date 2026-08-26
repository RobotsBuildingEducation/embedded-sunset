// src/utility/analytics.js
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { database } from "../database/firebaseResources";
import { transcript } from "./transcript";

/**
 * Parses any Firestore timestamp, string, or Date safely.
 */
export const parseTimestamp = (ts) => {
  if (!ts) return new Date();
  if (typeof ts.toDate === "function") return ts.toDate();
  if (ts instanceof Date) return ts;
  const parsed = new Date(ts);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

/**
 * Formats a Date to YYYY-MM-DD in local time
 */
export const toLocalDateString = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Fetches answers subcollection + user document and calculates aggregate statistics.
 */
export const fetchUserAnalytics = async (userId, stepsData = {}, language = "en") => {
  if (!userId) {
    return createEmptyAnalytics(stepsData, language);
  }

  try {
    // 1. Fetch answers subcollection
    const answersRef = collection(database, "users", userId, "answers");
    const answersSnap = await getDocs(answersRef);

    const answers = [];
    answersSnap.forEach((docSnapshot) => {
      const data = docSnapshot.data() || {};
      answers.push({
        id: docSnapshot.id,
        step: typeof data.step === "number" ? data.step : Number(data.step) || 0,
        title: data.title || "",
        description: data.description || "",
        question: data.question || "",
        feedback: data.feedback || "",
        timestamp: parseTimestamp(data.timestamp),
      });
    });

    // Sort answers newest first for the journal/review feed
    answers.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // 2. Fetch root user document for streak and goal data
    const userDocRef = doc(database, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    const userData = userDocSnap.exists() ? userDocSnap.data() || {} : {};

    // 3. Compute analytics
    return computeAnalyticsData(answers, userData, stepsData, language);
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    return createEmptyAnalytics(stepsData, language);
  }
};

/**
 * Computes metrics and aggregates from answers + user profile.
 */
export const computeAnalyticsData = (answers = [], userData = {}, stepsData = {}, language = "en") => {
  const langKey = language?.includes("es") ? "es" : "en";
  const curriculumSteps = Array.isArray(stepsData[langKey])
    ? stepsData[langKey]
    : Array.isArray(stepsData.en)
      ? stepsData.en
      : [];
  const totalCurriculumSteps = curriculumSteps.length || 141;

  // Track unique step IDs completed
  const answeredSet = new Set();
  answers.forEach((ans) => answeredSet.add(ans.step));
  if (Array.isArray(userData.answeredStepIds)) {
    userData.answeredStepIds.forEach((id) => answeredSet.add(id));
  }
  const totalUniqueSteps = answeredSet.size;

  // Active Days & Daily Activity
  const activityByDate = {}; // YYYY-MM-DD -> count
  const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun -> Sat
  const timeOfDayCounts = {
    morning: 0,   // 5:00 - 11:59
    afternoon: 0, // 12:00 - 16:59
    evening: 0,   // 17:00 - 21:59
    night: 0,     // 22:00 - 4:59
  };

  answers.forEach((ans) => {
    const d = ans.timestamp;
    const dateStr = toLocalDateString(d);
    activityByDate[dateStr] = (activityByDate[dateStr] || 0) + 1;

    const dayIndex = d.getDay();
    dayOfWeekCounts[dayIndex] = (dayOfWeekCounts[dayIndex] || 0) + 1;

    const hour = d.getHours();
    if (hour >= 5 && hour < 12) {
      timeOfDayCounts.morning += 1;
    } else if (hour >= 12 && hour < 17) {
      timeOfDayCounts.afternoon += 1;
    } else if (hour >= 17 && hour < 22) {
      timeOfDayCounts.evening += 1;
    } else {
      timeOfDayCounts.night += 1;
    }
  });

  const uniqueActiveDays = Object.keys(activityByDate).length;
  const totalSubmissions = answers.length;
  const avgPerActiveDay =
    uniqueActiveDays > 0 ? (totalSubmissions / uniqueActiveDays).toFixed(1) : "0.0";

  // Calculate Last 7 Days Activity Array for visual chart
  const recentDays = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);
    const dateStr = toLocalDateString(targetDate);
    const dayNames = langKey === "es"
      ? ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    recentDays.push({
      dateStr,
      dayLabel: dayNames[targetDate.getDay()],
      count: activityByDate[dateStr] || 0,
      isToday: i === 0,
    });
  }

  // Find max daily answers in any single day
  let maxDailyCount = 0;
  Object.values(activityByDate).forEach((count) => {
    if (count > maxDailyCount) maxDailyCount = count;
  });

  // Chapter / Topic Breakdown
  const groupMap = {};
  curriculumSteps.forEach((stepItem, idx) => {
    const grp = String(stepItem.group || "1");
    if (!groupMap[grp]) {
      const chapterMeta = transcript[grp] || {};
      groupMap[grp] = {
        groupId: grp,
        name: chapterMeta.name || (grp === "tutorial" ? "Tutorial" : `Chapter ${grp}`),
        imgSrc: chapterMeta.imgSrc || null,
        totalSteps: 0,
        completedSteps: 0,
        stepIndices: [],
      };
    }
    groupMap[grp].totalSteps += 1;
    groupMap[grp].stepIndices.push(idx);
  });

  const chapters = Object.values(groupMap).map((grp) => {
    const completed = grp.stepIndices.filter((idx) => answeredSet.has(idx)).length;
    const percentage = grp.totalSteps > 0 ? Math.min(100, Math.round((completed / grp.totalSteps) * 100)) : 0;
    return {
      ...grp,
      completedSteps: completed,
      percentage,
    };
  });

  // Determine Peak Study Period
  let peakTimePeriod = "afternoon";
  let maxTimeCount = -1;
  Object.entries(timeOfDayCounts).forEach(([period, count]) => {
    if (count > maxTimeCount) {
      maxTimeCount = count;
      peakTimePeriod = period;
    }
  });

  // Achievements / Milestones
  const badges = [
    {
      id: "first_step",
      icon: "🚀",
      titleEn: "First Step",
      titleEs: "Primer Paso",
      descEn: "Solved your first curriculum lesson",
      descEs: "Resolviste tu primera lección",
      unlocked: totalUniqueSteps >= 1,
      progress: Math.min(1, totalUniqueSteps / 1),
    },
    {
      id: "streak_3",
      icon: "🔥",
      titleEn: "Streak Builder",
      titleEs: "Constructor de Rachas",
      descEn: "Achieved a 3-day study streak",
      descEs: "Alcanzaste una racha de 3 días",
      unlocked: (userData.streak || 0) >= 3,
      progress: Math.min(1, (userData.streak || 0) / 3),
    },
    {
      id: "scholar_10",
      icon: "📚",
      titleEn: "Dedicated Scholar",
      titleEs: "Estudiante Dedicado",
      descEn: "Mastered 10 distinct lessons",
      descEs: "Dominaste 10 lecciones distintas",
      unlocked: totalUniqueSteps >= 10,
      progress: Math.min(1, totalUniqueSteps / 10),
    },
    {
      id: "power_session",
      icon: "⚡",
      titleEn: "Power Session",
      titleEs: "Sesión Intensa",
      descEn: "Answered 5+ questions in a single day",
      descEs: "Respondiste 5+ preguntas en un solo día",
      unlocked: maxDailyCount >= 5,
      progress: Math.min(1, maxDailyCount / 5),
    },
    {
      id: "night_owl",
      icon: "🦉",
      titleEn: "Night Owl",
      titleEs: "Búho Nocturno",
      descEn: "Studied during late night hours (10pm - 5am)",
      descEs: "Estudiaste durante la noche (10pm - 5am)",
      unlocked: timeOfDayCounts.night > 0,
      progress: timeOfDayCounts.night > 0 ? 1 : 0,
    },
    {
      id: "early_bird",
      icon: "🌅",
      titleEn: "Early Bird",
      titleEs: "Madrugador",
      descEn: "Studied during early morning hours (5am - 12pm)",
      descEs: "Estudiaste en la mañana (5am - 12pm)",
      unlocked: timeOfDayCounts.morning > 0,
      progress: timeOfDayCounts.morning > 0 ? 1 : 0,
    },
    {
      id: "quarter_master",
      icon: "🧠",
      titleEn: "Knowledge Core",
      titleEs: "Núcleo de Conocimiento",
      descEn: "Mastered 25 curriculum lessons",
      descEs: "Dominaste 25 lecciones del curso",
      unlocked: totalUniqueSteps >= 25,
      progress: Math.min(1, totalUniqueSteps / 25),
    },
    {
      id: "halfway",
      icon: "🏆",
      titleEn: "Halfway Hero",
      titleEs: "Héroe a Medio Camino",
      descEn: "Reached 50 completed lessons",
      descEs: "Alcanzaste 50 lecciones completadas",
      unlocked: totalUniqueSteps >= 50,
      progress: Math.min(1, totalUniqueSteps / 50),
    },
    {
      id: "centurion",
      icon: "🎓",
      titleEn: "Mastery Centurion",
      titleEs: "Centurión del Dominio",
      descEn: "Mastered 100 lessons or full curriculum",
      descEs: "Dominaste 100 lecciones o el curso completo",
      unlocked: totalUniqueSteps >= Math.min(100, totalCurriculumSteps),
      progress: Math.min(1, totalUniqueSteps / Math.min(100, totalCurriculumSteps)),
    },
  ];

  const unlockedBadgesCount = badges.filter((b) => b.unlocked).length;

  return {
    summary: {
      totalSubmissions,
      totalUniqueSteps,
      totalCurriculumSteps,
      completionPercentage: Math.min(
        100,
        Math.round((totalUniqueSteps / totalCurriculumSteps) * 100),
      ),
      uniqueActiveDays,
      avgPerActiveDay,
      streak: userData.streak || 0,
      dailyProgress: userData.dailyProgress || 0,
      dailyGoals: userData.dailyGoals || 5,
      goalCount: userData.goalCount || 0,
      unlockedBadgesCount,
      totalBadgesCount: badges.length,
      peakTimePeriod,
    },
    recentDays,
    dayOfWeekCounts,
    timeOfDayCounts,
    chapters,
    badges,
    answers, // newest first
  };
};

/**
 * Fallback empty analytics state when user has no submissions
 */
export const createEmptyAnalytics = (stepsData = {}, language = "en") => {
  return computeAnalyticsData([], {}, stepsData, language);
};
