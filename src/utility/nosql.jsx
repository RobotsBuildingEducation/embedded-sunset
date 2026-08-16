// Import Firestore functions
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  onSnapshot,
  increment,
} from "firebase/firestore";
import { database } from "../database/firebaseResources";
import {
  getLocalThemeColor,
  getLocalThemeMode,
  themeColors,
  themeModes,
} from "../useThemeStore";
import {
  CONTINUING_LEARNING_PROFILE_VERSION,
  getCourseLocale,
  getInitialContinuingLearningSummary,
  normalizeGeneratedQuestionContent,
  normalizeContinuingLearningSummary,
} from "./questionGeneration";
import { steps } from "./content";

export const CURRICULUM_VERSION = 3;
const EXPANDED_TUTORIAL_OFFSET = 9;
const LEGACY_FIRST_CHAPTER_STEP = 10;
const EXPANDED_TUTORIAL_END_STEP =
  LEGACY_FIRST_CHAPTER_STEP + EXPANDED_TUTORIAL_OFFSET - 1;

export const generatePromotionCode = () => {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  }
  return Math.random().toString(36).slice(2, 14);
};

// Update user data with timer, streak, startTime, and endTime
export const updateUserData = async (
  userId,
  timer,
  streak,
  startTime,
  endTime,
  dailyGoals = 5,
  nextGoalExpiration,
  dailyProgress = 0,
  goalCount = 0,
) => {
  if (!userId) {
    throw new Error("updateUserData requires a userId");
  }

  const nextGoalDate =
    nextGoalExpiration instanceof Date
      ? nextGoalExpiration
      : new Date(nextGoalExpiration);
  const userDocRef = doc(database, "users", userId);

  await setDoc(
    userDocRef,
    {
      timer,
      streak,
      startTime: startTime.toISOString(), // Store dates as ISO strings
      endTime: endTime.toISOString(),
      dailyGoals,
      nextGoalExpiration: nextGoalDate.toISOString(),
      dailyProgress: dailyProgress,
      goalCount: goalCount,
    },
    { merge: true },
  );
};

// Retrieve user data to use within the component
export const getUserData = async (userId) => {
  if (!userId) return null;

  const userDocRef = doc(database, "users", userId);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      ...data,
      startTime: data.startTime ? new Date(data.startTime) : null, // Convert ISO strings back to Date objects
      endTime: data.endTime ? new Date(data.endTime) : null,
    };
  } else {
    return null; // Handle case where user document does not exist
  }
};

const getContinuingLearningRef = (userId, userLanguage = "en") =>
  doc(
    database,
    "users",
    userId,
    "continuingLearning",
    getCourseLocale(userLanguage),
  );

const getContinuingLearningQuestionsRef = (userId, userLanguage = "en") =>
  collection(
    database,
    "users",
    userId,
    "continuingLearning",
    getCourseLocale(userLanguage),
    "questions",
  );

const normalizeContinuingLearningQuestion = (
  questionId,
  storedQuestion = {},
) => {
  const questionCount = Math.max(
    0,
    Number(storedQuestion.questionCount ?? questionId) || 0,
  );
  const question =
    storedQuestion.question && typeof storedQuestion.question === "object"
      ? normalizeGeneratedQuestionContent(storedQuestion.question)
      : null;

  return {
    ...storedQuestion,
    id: String(questionId),
    questionCount,
    title:
      typeof storedQuestion.title === "string" && storedQuestion.title.trim()
        ? storedQuestion.title.trim()
        : question?.title || "Generated practice",
    questionType:
      typeof storedQuestion.questionType === "string"
        ? storedQuestion.questionType
        : null,
    question,
  };
};

export const getContinuingLearningQuestions = async (
  userId,
  userLanguage = "en",
) => {
  if (!userId) return [];

  const questionsSnapshot = await getDocs(
    getContinuingLearningQuestionsRef(userId, userLanguage),
  );

  return questionsSnapshot.docs
    .map((questionSnapshot) =>
      normalizeContinuingLearningQuestion(
        questionSnapshot.id,
        questionSnapshot.data(),
      ),
    )
    .filter(
      (entry) =>
        entry.questionCount > 0 &&
        entry.question &&
        typeof entry.question === "object",
    )
    .sort((a, b) => a.questionCount - b.questionCount);
};

export const saveContinuingLearningQuestion = async (
  userId,
  userLanguage = "en",
  { questionCount, questionType = null, question } = {},
) => {
  if (!userId || !question || typeof question !== "object") return null;

  const normalizedQuestionCount = Math.max(0, Number(questionCount) || 0);
  if (normalizedQuestionCount < 1) return null;

  const locale = getCourseLocale(userLanguage);
  const normalizedQuestion = normalizeGeneratedQuestionContent(question);
  const questionRef = doc(
    getContinuingLearningQuestionsRef(userId, locale),
    String(normalizedQuestionCount),
  );
  const now = new Date().toISOString();
  const existingQuestion = await getDoc(questionRef);
  const payload = {
    version: CONTINUING_LEARNING_PROFILE_VERSION,
    language: locale,
    questionCount: normalizedQuestionCount,
    title:
      typeof normalizedQuestion.title === "string" &&
      normalizedQuestion.title.trim()
        ? normalizedQuestion.title.trim()
        : "Generated practice",
    questionType:
      typeof questionType === "string" && questionType ? questionType : null,
    question: normalizedQuestion,
    createdAt: existingQuestion.exists()
      ? existingQuestion.data()?.createdAt || now
      : now,
    updatedAt: now,
  };

  await setDoc(questionRef, payload, { merge: true });
  return normalizeContinuingLearningQuestion(questionRef.id, payload);
};

export const getContinuingLearningState = async (
  userId,
  userLanguage = "en",
) => {
  const locale = getCourseLocale(userLanguage);
  const initialSummary = getInitialContinuingLearningSummary(locale);
  const fallbackState = {
    version: CONTINUING_LEARNING_PROFILE_VERSION,
    language: locale,
    summary: initialSummary,
    questionCount: 0,
    lastQuestionType: null,
    currentQuestion: null,
  };

  if (!userId) return fallbackState;

  const profileRef = getContinuingLearningRef(userId, locale);
  const profileSnapshot = await getDoc(profileRef);
  const now = new Date().toISOString();

  if (!profileSnapshot.exists()) {
    const initialState = {
      ...fallbackState,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(profileRef, initialState);
    return initialState;
  }

  const storedState = profileSnapshot.data() || {};
  const normalizedState = {
    ...fallbackState,
    ...storedState,
    version: CONTINUING_LEARNING_PROFILE_VERSION,
    language: locale,
    summary: normalizeContinuingLearningSummary(storedState.summary, locale),
    questionCount: Math.max(0, Number(storedState.questionCount) || 0),
    lastQuestionType:
      typeof storedState.lastQuestionType === "string"
        ? storedState.lastQuestionType
        : null,
    currentQuestion:
      storedState.currentQuestion &&
      typeof storedState.currentQuestion === "object" &&
      !Array.isArray(storedState.currentQuestion)
        ? normalizeGeneratedQuestionContent(storedState.currentQuestion)
        : null,
  };

  if (
    storedState.version !== normalizedState.version ||
    storedState.summary !== normalizedState.summary
  ) {
    await setDoc(
      profileRef,
      { ...normalizedState, updatedAt: now },
      { merge: true },
    );
  }

  return normalizedState;
};

export const saveContinuingLearningState = async (
  userId,
  userLanguage = "en",
  nextState = {},
) => {
  if (!userId) return null;

  const locale = getCourseLocale(userLanguage);
  const profileRef = getContinuingLearningRef(userId, locale);
  const payload = {
    ...nextState,
    version: CONTINUING_LEARNING_PROFILE_VERSION,
    language: locale,
    updatedAt: new Date().toISOString(),
  };

  if (Object.prototype.hasOwnProperty.call(payload, "summary")) {
    payload.summary = normalizeContinuingLearningSummary(
      payload.summary,
      locale,
    );
  }

  if (Object.prototype.hasOwnProperty.call(payload, "questionCount")) {
    payload.questionCount = Math.max(0, Number(payload.questionCount) || 0);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "currentQuestion")) {
    payload.currentQuestion =
      payload.currentQuestion && typeof payload.currentQuestion === "object"
        ? normalizeGeneratedQuestionContent(payload.currentQuestion)
        : null;
  }

  await setDoc(profileRef, payload, { merge: true });
  return payload;
};

// Function to create or update a user in Firestore
export const createUser = async (npub, userName, language) => {
  if (!npub) {
    throw new Error("createUser requires an npub");
  }

  const userDoc = doc(database, "users", npub);
  const existingSnapshot = await getDoc(userDoc);
  const now = new Date();
  const promotionStart = now.toISOString();
  const promotionDeadline = new Date(
    now.getTime() + 30 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const localThemeMode = getLocalThemeMode();

  const baseProfile = {
    isAdaptiveLearning: true,
    name: userName,
    npub,
    step: "onboarding",
    onboardingStep: 1,
    previousStep: 0,
    curriculumVersion: CURRICULUM_VERSION,
    language,
    allowPosts: true,
    themeColor: getLocalThemeColor(),
    colorMode: localThemeMode,
    themeMode: localThemeMode,
    identity: "npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt",
  };

  const defaultPromotionState = {
    promotionStartTime: promotionStart,
    promotionDeadline,
    promotionGoalMet: false,
    promotionCompletionTime: null,
    promotionVerificationCode: generatePromotionCode(),
    answeredStepIds: [],
    answeredStepsCount: 0,
    answeredSteps: {},
  };

  if (!existingSnapshot.exists()) {
    const newUserData = {
      ...baseProfile,
      ...defaultPromotionState,
    };

    await setDoc(userDoc, newUserData);
    return newUserData;
  }

  const data = existingSnapshot.data() || {};
  const updates = {};

  if (typeof data.isAdaptiveLearning === "undefined") {
    updates.isAdaptiveLearning = true;
  }

  if (typeof data.curriculumVersion !== "number") {
    updates.curriculumVersion = 1;
  }

  if (userName && data.name !== userName) {
    updates.name = userName;
  }

  if (!data.npub) {
    updates.npub = npub;
  }

  if (!data.step) {
    updates.step = "onboarding";
  }

  if (typeof data.onboardingStep === "undefined") {
    updates.onboardingStep = 1;
  }

  if (typeof data.previousStep === "undefined") {
    updates.previousStep = 0;
  }

  if (language && data.language !== language) {
    updates.language = language;
  }

  if (typeof data.allowPosts === "undefined") {
    updates.allowPosts = false;
  }

  if (!themeColors.includes(data.themeColor)) {
    updates.themeColor = getLocalThemeColor();
  }

  const savedThemeMode = data.colorMode || data.themeMode;
  if (!themeModes.includes(savedThemeMode)) {
    updates.colorMode = localThemeMode;
    updates.themeMode = localThemeMode;
  } else {
    if (!data.colorMode) {
      updates.colorMode = savedThemeMode;
    }

    if (!data.themeMode) {
      updates.themeMode = savedThemeMode;
    }
  }

  if (!data.identity) {
    updates.identity =
      "npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt";
  }

  if (!data.promotionStartTime) {
    updates.promotionStartTime = promotionStart;
  }

  if (!data.promotionDeadline) {
    updates.promotionDeadline = promotionDeadline;
  }

  if (typeof data.promotionGoalMet !== "boolean") {
    updates.promotionGoalMet = false;
  }

  if (!("promotionCompletionTime" in data)) {
    updates.promotionCompletionTime = null;
  }

  if (!data.promotionVerificationCode) {
    updates.promotionVerificationCode = generatePromotionCode();
  }

  if (!Array.isArray(data.answeredStepIds)) {
    updates.answeredStepIds = [];
  }

  if (typeof data.answeredStepsCount !== "number") {
    updates.answeredStepsCount = 0;
  }

  if (!data.answeredSteps || typeof data.answeredSteps !== "object") {
    updates.answeredSteps = {};
  }

  if (Object.keys(updates).length > 0) {
    await updateDoc(userDoc, updates);
  }

  return { ...data, ...updates };
};

// Function to increment the step count for a user
export const incrementUserStep = async (npub, currentStep = 0) => {
  const userDoc = doc(database, "users", npub);
  const userSnapshot = await getDoc(userDoc);

  if (userSnapshot.exists()) {
    // const currentStep = userSnapshot.data().step || 0;
    await updateDoc(userDoc, {
      previousStep: currentStep + 1,
      step: currentStep + 1,
    });
  }
};

export const incrementUserOnboardingStep = async (npub) => {
  const userDoc = doc(database, "users", npub);
  const userSnapshot = await getDoc(userDoc);

  if (userSnapshot.exists()) {
    const currentStep = userSnapshot.data().onboardingStep || 0;

    await updateDoc(userDoc, {
      onboardingStep: currentStep + 1,
    });
  }
};

export const setUserOnboardingStep = async (npub, onboardingStep) => {
  const userDoc = doc(database, "users", npub);
  const userSnapshot = await getDoc(userDoc);

  if (userSnapshot.exists()) {
    await updateDoc(userDoc, { onboardingStep });
  }
};

export const setOnboardingToDone = async (npub, stepNumber = 0) => {
  const userDoc = doc(database, "users", npub);
  const userSnapshot = await getDoc(userDoc);

  if (userSnapshot.exists()) {
    await updateDoc(userDoc, {
      onboardingStep: "done",
      step: stepNumber,
    });
  }
};

export const incrementToSubscription = async (npub, previousStep) => {
  const userDoc = doc(database, "users", npub);
  const userSnapshot = await getDoc(userDoc);

  if (userSnapshot.exists()) {
    await updateDoc(userDoc, {
      previousStep: previousStep,
      step: "subscription",
    });
  }
};

export const incrementToFinalAward = async (npub) => {
  const userDoc = doc(database, "users", npub);
  const userSnapshot = await getDoc(userDoc);

  if (userSnapshot.exists()) {
    await updateDoc(userDoc, {
      step: "award",
      previousStep: "award",
    });
  }
};

export const getUserStep = async (npub) => {
  const userDoc = doc(database, "users", npub);
  const userSnapshot = await getDoc(userDoc);

  if (userSnapshot.exists()) {
    const data = userSnapshot.data();
    if (data.curriculumVersion !== CURRICULUM_VERSION) {
      const previousCurriculumVersion = Number(data.curriculumVersion || 0);
      const needsExpandedTutorialOffset = previousCurriculumVersion < 2;
      const migrateIndex = (value) =>
        needsExpandedTutorialOffset &&
        typeof value === "number" &&
        value >= LEGACY_FIRST_CHAPTER_STEP
          ? value + EXPANDED_TUTORIAL_OFFSET
          : value;
      const savedAtLegacyPaywall =
        data.step === "subscription" &&
        Number(data.previousStep) < EXPANDED_TUTORIAL_END_STEP;
      const migratedStep = savedAtLegacyPaywall
        ? LEGACY_FIRST_CHAPTER_STEP
        : migrateIndex(data.step || 0);
      const migratedPreviousStep = migrateIndex(data.previousStep || 0);
      const answeredStepIds = Array.isArray(data.answeredStepIds)
        ? data.answeredStepIds.map(migrateIndex)
        : [];
      const answeredSteps = Object.fromEntries(
        Object.entries(data.answeredSteps || {}).map(([key, value]) => {
          const numericKey = Number(key);
          const migratedKey = Number.isFinite(numericKey)
            ? migrateIndex(numericKey)
            : key;
          return [String(migratedKey), value];
        }),
      );

      await updateDoc(userDoc, {
        curriculumVersion: CURRICULUM_VERSION,
        step: migratedStep,
        previousStep: migratedPreviousStep,
        answeredStepIds,
        answeredSteps,
      });
      return migratedStep;
    }
    return data.step || 0;
  } else {
    return 0; // Default to step 0 if user document does not exist
  }
};

export const getOnboardingStep = async (npub) => {
  const userDoc = doc(database, "users", npub);
  const userSnapshot = await getDoc(userDoc);

  if (userSnapshot.exists()) {
    return userSnapshot.data().onboardingStep || 1;
  } else {
    return 0; // Default to step 0 if user document does not exist
  }
};

export const deleteSpecificDocuments = () => {
  const usersCollectionRef = collection(database, "users");

  // const q = query(usersCollectionRef, where("name", "==", "test"));
  // console.log("test");

  getDocs(q)
    .then((snapshot) => {
      // Step 2: Iterate through documents
      snapshot.forEach((doc) => {
        // Step 3: Delete documents
        deleteDoc(doc.ref)
          .then(() => {
            console.log(`Document with ID ${doc.id} deleted successfully.`);
          })
          .catch((error) => {
            console.error(`Error deleting document: ${error}`);
          });
      });
    })
    .catch((error) => {
      console.error(`Error getting documents: ${error}`);
    });
};

export const getTotalUsers = async () => {
  const usersCollectionRef = collection(database, "users");

  try {
    // Get a snapshot of all documents in the collection
    const snapshot = await getDocs(usersCollectionRef);
    // Count the number of documents
    const count = snapshot.size;
    console.log(`Total number of documents in 'users' collection: ${count}`);
    return count;
  } catch (error) {
    console.error("Error getting documents:", error);
    throw error;
  }
};

export const fetchUsersWithToken = async () => {
  // Create a query for users where the "fcmToken" field is not null
  const usersQuery = query(
    collection(database, "users"),
    where("fcmToken", "!=", null),
  );

  // Execute the query
  const querySnapshot = await getDocs(usersQuery);

  // Loop through the results and log each user's data
  querySnapshot.forEach((doc) => {});
};

// Global question count utilities
const questionDoc = doc(database, "analytics", "questionsAnswered");
export const BASE_QUESTION_COUNT = 4200;
export const COURSE_LESSON_COUNT =
  Array.isArray(steps?.en) && steps.en.length > 0 ? steps.en.length : 141;

export const subscribeToQuestionsAnswered = (callback) =>
  onSnapshot(questionDoc, (snap) => {
    const extra = snap.data()?.count || 0;
    callback(BASE_QUESTION_COUNT + extra);
  });

export const incrementQuestionsAnswered = async () => {
  await setDoc(questionDoc, { count: increment(1) }, { merge: true });
};

// Team Management Functions

/**
 * Create a new team for a user
 * @param {string} creatorNpub - The npub of the team creator
 * @param {string} teamName - Name of the team
 * @returns {string} teamId - The created team's ID
 */
export const createTeam = async (creatorNpub, teamName) => {
  if (!creatorNpub || !teamName) {
    throw new Error("Creator npub and team name are required");
  }

  const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const teamRef = doc(database, "users", creatorNpub, "teams", teamId);

  const teamData = {
    teamName,
    createdBy: creatorNpub,
    createdAt: new Date().toISOString(),
    members: [],
  };

  await setDoc(teamRef, teamData);
  return teamId;
};

/**
 * Invite a user to a team
 * @param {string} creatorNpub - The npub of the team creator
 * @param {string} teamId - The team ID
 * @param {string} teamName - The team name
 * @param {string} inviteeNpub - The npub of the user being invited
 * @param {string} creatorName - Name of the team creator
 */
export const inviteUserToTeam = async (
  creatorNpub,
  teamId,
  teamName,
  inviteeNpub,
  creatorName,
) => {
  if (!creatorNpub || !teamId || !inviteeNpub) {
    throw new Error("Creator npub, team ID, and invitee npub are required");
  }

  // Add member to team with pending status
  const teamRef = doc(database, "users", creatorNpub, "teams", teamId);
  const teamDoc = await getDoc(teamRef);

  if (!teamDoc.exists()) {
    throw new Error("Team does not exist");
  }

  const teamData = teamDoc.data();
  const existingMember = teamData.members.find((m) => m.npub === inviteeNpub);

  if (existingMember) {
    throw new Error("User is already a member or has a pending invite");
  }

  // Update team members list
  await updateDoc(teamRef, {
    members: [
      ...teamData.members,
      {
        npub: inviteeNpub,
        status: "pending",
        addedAt: new Date().toISOString(),
        name: "",
      },
    ],
  });

  // Create invite in invitee's subcollection
  const inviteId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const inviteRef = doc(
    database,
    "users",
    inviteeNpub,
    "teamInvites",
    inviteId,
  );

  await setDoc(inviteRef, {
    teamId,
    teamName,
    invitedBy: creatorNpub,
    invitedByName: creatorName,
    status: "pending",
    createdAt: new Date().toISOString(),
    creatorNpub,
  });

  return inviteId;
};

/**
 * Accept a team invite
 * @param {string} userNpub - The npub of the user accepting
 * @param {string} inviteId - The invite ID
 */
export const acceptTeamInvite = async (userNpub, inviteId) => {
  if (!userNpub || !inviteId) {
    throw new Error("User npub and invite ID are required");
  }

  const inviteRef = doc(database, "users", userNpub, "teamInvites", inviteId);
  const inviteDoc = await getDoc(inviteRef);

  if (!inviteDoc.exists()) {
    throw new Error("Invite does not exist");
  }

  const inviteData = inviteDoc.data();
  const { creatorNpub, teamId } = inviteData;

  // Update invite status
  await updateDoc(inviteRef, {
    status: "accepted",
  });

  // Update member status in team
  const teamRef = doc(database, "users", creatorNpub, "teams", teamId);
  const teamDoc = await getDoc(teamRef);

  if (teamDoc.exists()) {
    const teamData = teamDoc.data();
    const updatedMembers = teamData.members.map((m) =>
      m.npub === userNpub ? { ...m, status: "accepted" } : m,
    );

    await updateDoc(teamRef, {
      members: updatedMembers,
    });
  }
};

/**
 * Reject a team invite
 * @param {string} userNpub - The npub of the user rejecting
 * @param {string} inviteId - The invite ID
 */
export const rejectTeamInvite = async (userNpub, inviteId) => {
  if (!userNpub || !inviteId) {
    throw new Error("User npub and invite ID are required");
  }

  const inviteRef = doc(database, "users", userNpub, "teamInvites", inviteId);
  const inviteDoc = await getDoc(inviteRef);

  if (!inviteDoc.exists()) {
    throw new Error("Invite does not exist");
  }

  const inviteData = inviteDoc.data();
  const { creatorNpub, teamId } = inviteData;

  // Update invite status
  await updateDoc(inviteRef, {
    status: "rejected",
  });

  // Remove member from team
  const teamRef = doc(database, "users", creatorNpub, "teams", teamId);
  const teamDoc = await getDoc(teamRef);

  if (teamDoc.exists()) {
    const teamData = teamDoc.data();
    const updatedMembers = teamData.members.filter((m) => m.npub !== userNpub);

    await updateDoc(teamRef, {
      members: updatedMembers,
    });
  }
};

/**
 * Get all teams created by a user AND teams where user is a member
 * @param {string} userNpub - The user's npub
 * @returns {Array} teams - Array of team objects
 */
export const getUserTeams = async (userNpub) => {
  if (!userNpub) {
    throw new Error("User npub is required");
  }

  // Get teams created by this user
  const createdTeamsRef = collection(database, "users", userNpub, "teams");
  const createdTeamsSnapshot = await getDocs(createdTeamsRef);

  const createdTeams = [];
  createdTeamsSnapshot.forEach((teamDoc) => {
    createdTeams.push({
      id: teamDoc.id,
      ...teamDoc.data(),
      isCreator: true,
    });
  });

  // Get teams where user is a member (via accepted invites)
  const invitesRef = collection(database, "users", userNpub, "teamInvites");
  const invitesSnapshot = await getDocs(invitesRef);

  const memberTeamsPromises = [];
  invitesSnapshot.forEach((inviteDoc) => {
    const invite = inviteDoc.data();
    if (invite.status === "accepted" && invite.creatorNpub) {
      memberTeamsPromises.push(
        getDoc(
          doc(database, "users", invite.creatorNpub, "teams", invite.teamId),
        )
          .then((teamDoc) => {
            if (teamDoc.exists()) {
              return {
                id: teamDoc.id,
                ...teamDoc.data(),
                isCreator: false,
              };
            }
            return null;
          })
          .catch((error) => {
            console.error("Error fetching member team:", error);
            return null;
          }),
      );
    }
  });

  const memberTeams = (await Promise.all(memberTeamsPromises)).filter(
    (team) => team !== null,
  );

  // Combine and deduplicate teams
  const allTeams = [...createdTeams, ...memberTeams];
  const uniqueTeams = allTeams.reduce((acc, team) => {
    if (!acc.find((t) => t.id === team.id)) {
      acc.push(team);
    }
    return acc;
  }, []);

  return uniqueTeams;
};

/**
 * Get all team invites for a user
 * @param {string} userNpub - The user's npub
 * @returns {Array} invites - Array of invite objects
 */
export const getUserTeamInvites = async (userNpub) => {
  if (!userNpub) {
    throw new Error("User npub is required");
  }

  const invitesRef = collection(database, "users", userNpub, "teamInvites");
  const invitesSnapshot = await getDocs(invitesRef);

  const invites = [];
  invitesSnapshot.forEach((inviteDoc) => {
    invites.push({ id: inviteDoc.id, ...inviteDoc.data() });
  });

  return invites;
};

/**
 * Get team member progress data
 * @param {string} creatorNpub - The team creator's npub
 * @param {string} teamId - The team ID
 * @returns {Array} memberProgress - Array of member progress objects
 */
export const getTeamMemberProgress = async (creatorNpub, teamId) => {
  if (!creatorNpub || !teamId) {
    throw new Error("Creator npub and team ID are required");
  }

  const teamRef = doc(database, "users", creatorNpub, "teams", teamId);
  const teamDoc = await getDoc(teamRef);

  if (!teamDoc.exists()) {
    throw new Error("Team does not exist");
  }

  const teamData = teamDoc.data();
  const members = teamData.members.filter((m) => m.status === "accepted");

  // Include the team creator in the progress list
  const allMembersToFetch = [
    { npub: creatorNpub, isCreator: true },
    ...members.map((m) => ({ ...m, isCreator: false })),
  ];

  // Fetch progress data for each member including creator
  const memberProgressPromises = allMembersToFetch.map(async (member) => {
    const userData = await getUserData(member.npub);
    return {
      npub: member.npub,
      name: userData?.name || member.name || "Unknown User",
      step: userData?.step || 0,
      streak: userData?.streak || 0,
      dailyProgress: userData?.dailyProgress || 0,
      answeredStepsCount: userData?.answeredStepsCount || 0,
      isCreator: member.isCreator || false,
    };
  });

  return await Promise.all(memberProgressPromises);
};

/**
 * Delete a team (only by creator)
 * @param {string} creatorNpub - The team creator's npub
 * @param {string} teamId - The team ID
 */
export const deleteTeam = async (creatorNpub, teamId) => {
  if (!creatorNpub || !teamId) {
    throw new Error("Creator npub and team ID are required");
  }

  const teamRef = doc(database, "users", creatorNpub, "teams", teamId);
  const teamDoc = await getDoc(teamRef);

  if (!teamDoc.exists()) {
    throw new Error("Team does not exist");
  }

  const teamData = teamDoc.data();

  // Delete all pending invites for members
  const deleteInvitePromises = teamData.members.map(async (member) => {
    const invitesRef = collection(
      database,
      "users",
      member.npub,
      "teamInvites",
    );
    const q = query(invitesRef, where("teamId", "==", teamId));
    const invitesSnapshot = await getDocs(q);

    const deletePromises = [];
    invitesSnapshot.forEach((inviteDoc) => {
      deletePromises.push(deleteDoc(inviteDoc.ref));
    });

    return Promise.all(deletePromises);
  });

  await Promise.all(deleteInvitePromises);

  // Delete the team
  await deleteDoc(teamRef);
};

/**
 * Leave a team (for members)
 * @param {string} userNpub - The user's npub
 * @param {string} creatorNpub - The team creator's npub
 * @param {string} teamId - The team ID
 */
export const leaveTeam = async (userNpub, creatorNpub, teamId) => {
  if (!userNpub || !creatorNpub || !teamId) {
    throw new Error("User npub, creator npub, and team ID are required");
  }

  // Remove user from team members
  const teamRef = doc(database, "users", creatorNpub, "teams", teamId);
  const teamDoc = await getDoc(teamRef);

  if (teamDoc.exists()) {
    const teamData = teamDoc.data();
    const updatedMembers = teamData.members.filter((m) => m.npub !== userNpub);

    await updateDoc(teamRef, {
      members: updatedMembers,
    });
  }

  // Delete user's team invite
  const invitesRef = collection(database, "users", userNpub, "teamInvites");
  const q = query(invitesRef, where("teamId", "==", teamId));
  const invitesSnapshot = await getDocs(q);

  invitesSnapshot.forEach(async (inviteDoc) => {
    await deleteDoc(inviteDoc.ref);
  });
};

/**
 * Subscribe to team updates (real-time)
 * @param {string} creatorNpub - The team creator's npub
 * @param {string} teamId - The team ID
 * @param {Function} callback - Callback function to receive updates
 * @returns {Function} unsubscribe - Function to unsubscribe from updates
 */
export const subscribeToTeamUpdates = (creatorNpub, teamId, callback) => {
  const teamRef = doc(database, "users", creatorNpub, "teams", teamId);
  return onSnapshot(teamRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    } else {
      callback(null);
    }
  });
};

/**
 * Subscribe to team invites (real-time)
 * @param {string} userNpub - The user's npub
 * @param {Function} callback - Callback function to receive updates
 * @returns {Function} unsubscribe - Function to unsubscribe from updates
 */
export const subscribeToTeamInvites = (userNpub, callback) => {
  const invitesRef = collection(database, "users", userNpub, "teamInvites");
  return onSnapshot(invitesRef, (snapshot) => {
    const invites = [];
    snapshot.forEach((inviteDoc) => {
      invites.push({ id: inviteDoc.id, ...inviteDoc.data() });
    });
    callback(invites);
  });
};

/**
 * Check if a user exists in Firestore
 * @param {string} npub - The user's npub
 * @returns {boolean} exists - Whether the user exists
 */
export const checkUserExists = async (npub) => {
  if (!npub) return false;

  const userDocRef = doc(database, "users", npub);
  const userDoc = await getDoc(userDocRef);
  return userDoc.exists();
};
