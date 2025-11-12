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
  goalCount = 0
) => {
  const nextGoalDate =
    nextGoalExpiration instanceof Date
      ? nextGoalExpiration
      : new Date(nextGoalExpiration);
  const userDocRef = doc(database, "users", userId);

  await updateDoc(userDocRef, {
    timer,
    streak,
    startTime: startTime.toISOString(), // Store dates as ISO strings
    endTime: endTime.toISOString(),
    dailyGoals,
    nextGoalExpiration: nextGoalDate.toISOString(),
    dailyProgress: dailyProgress,
    goalCount: goalCount,
  });
};

// Retrieve user data to use within the component
export const getUserData = async (userId) => {
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
    now.getTime() + 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const baseProfile = {
    isAdaptiveLearning: true,
    name: userName,
    npub,
    step: "onboarding",
    onboardingStep: 1,
    previousStep: 0,
    language,
    allowPosts: false,
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

  if (!data.isAdaptiveLearning) {
    updates.isAdaptiveLearning = true;
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
    return userSnapshot.data().step || 0;
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

  console.log("PLEASE GOD ! ! ! ! ! !");
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
    where("fcmToken", "!=", null)
  );

  // Execute the query
  const querySnapshot = await getDocs(usersQuery);

  // Loop through the results and log each user's data
  querySnapshot.forEach((doc) => {
    console.log(`User ID: ${doc.id}`, doc.data());
  });
};

// Global question count utilities
const questionDoc = doc(database, "analytics", "questionsAnswered");
export const BASE_QUESTION_COUNT = 4200;
export const COURSE_LESSON_COUNT = 112;

export const subscribeToQuestionsAnswered = (callback) =>
  onSnapshot(questionDoc, (snap) => {
    const extra = snap.data()?.count || 0;
    callback(BASE_QUESTION_COUNT + extra);
  });

export const incrementQuestionsAnswered = async () => {
  await setDoc(questionDoc, { count: increment(1) }, { merge: true });
};

// Team management functions

// Create a team and add the creator as a member
export const createTeam = async (teamName, creatorNpub, creatorName) => {
  const teamId = globalThis.crypto?.randomUUID() || Math.random().toString(36).slice(2);
  const teamDoc = doc(database, "teams", teamId);

  await setDoc(teamDoc, {
    name: teamName,
    createdBy: creatorNpub,
    createdAt: new Date().toISOString(),
    memberIds: [creatorNpub],
  });

  // Add team to creator's profile
  const userDoc = doc(database, "users", creatorNpub);
  const userSnapshot = await getDoc(userDoc);
  const currentTeams = userSnapshot.data()?.teams || [];

  await updateDoc(userDoc, {
    teams: [...currentTeams, teamId],
  });

  return teamId;
};

// Send a team invite
export const sendTeamInvite = async (teamId, invitingUserNpub, invitedUserNpub) => {
  const inviteId = globalThis.crypto?.randomUUID() || Math.random().toString(36).slice(2);
  const inviteDoc = doc(database, "teamInvites", inviteId);

  await setDoc(inviteDoc, {
    teamId,
    invitingUserId: invitingUserNpub,
    invitedUserId: invitedUserNpub,
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  // Add invite to invited user's pending invites
  const userDoc = doc(database, "users", invitedUserNpub);
  const userSnapshot = await getDoc(userDoc);
  const currentInvites = userSnapshot.data()?.pendingTeamInvites || [];

  await updateDoc(userDoc, {
    pendingTeamInvites: [...currentInvites, inviteId],
  });

  return inviteId;
};

// Accept a team invite
export const acceptTeamInvite = async (inviteId, userNpub) => {
  const inviteDoc = doc(database, "teamInvites", inviteId);
  const inviteSnapshot = await getDoc(inviteDoc);

  if (!inviteSnapshot.exists()) {
    throw new Error("Invite not found");
  }

  const inviteData = inviteSnapshot.data();

  // Update invite status
  await updateDoc(inviteDoc, {
    status: "accepted",
    acceptedAt: new Date().toISOString(),
  });

  // Add user to team members
  const teamDoc = doc(database, "teams", inviteData.teamId);
  const teamSnapshot = await getDoc(teamDoc);
  const currentMembers = teamSnapshot.data()?.memberIds || [];

  await updateDoc(teamDoc, {
    memberIds: [...currentMembers, userNpub],
  });

  // Add team to user's teams and remove from pending invites
  const userDoc = doc(database, "users", userNpub);
  const userSnapshot = await getDoc(userDoc);
  const currentTeams = userSnapshot.data()?.teams || [];
  const currentInvites = userSnapshot.data()?.pendingTeamInvites || [];

  await updateDoc(userDoc, {
    teams: [...currentTeams, inviteData.teamId],
    pendingTeamInvites: currentInvites.filter(id => id !== inviteId),
  });

  return inviteData.teamId;
};

// Reject a team invite
export const rejectTeamInvite = async (inviteId, userNpub) => {
  const inviteDoc = doc(database, "teamInvites", inviteId);

  // Update invite status
  await updateDoc(inviteDoc, {
    status: "rejected",
    rejectedAt: new Date().toISOString(),
  });

  // Remove from user's pending invites
  const userDoc = doc(database, "users", userNpub);
  const userSnapshot = await getDoc(userDoc);
  const currentInvites = userSnapshot.data()?.pendingTeamInvites || [];

  await updateDoc(userDoc, {
    pendingTeamInvites: currentInvites.filter(id => id !== inviteId),
  });
};

// Get user's teams with details
export const getUserTeams = async (userNpub) => {
  const userDoc = doc(database, "users", userNpub);
  const userSnapshot = await getDoc(userDoc);

  if (!userSnapshot.exists()) {
    return [];
  }

  const teamIds = userSnapshot.data()?.teams || [];

  const teams = await Promise.all(
    teamIds.map(async (teamId) => {
      const teamDoc = doc(database, "teams", teamId);
      const teamSnapshot = await getDoc(teamDoc);

      if (teamSnapshot.exists()) {
        return { id: teamId, ...teamSnapshot.data() };
      }
      return null;
    })
  );

  return teams.filter(team => team !== null);
};

// Get user's pending invites with details
export const getUserPendingInvites = async (userNpub) => {
  const userDoc = doc(database, "users", userNpub);
  const userSnapshot = await getDoc(userDoc);

  if (!userSnapshot.exists()) {
    return [];
  }

  const inviteIds = userSnapshot.data()?.pendingTeamInvites || [];

  const invites = await Promise.all(
    inviteIds.map(async (inviteId) => {
      const inviteDoc = doc(database, "teamInvites", inviteId);
      const inviteSnapshot = await getDoc(inviteDoc);

      if (inviteSnapshot.exists()) {
        const inviteData = inviteSnapshot.data();

        // Get team details
        const teamDoc = doc(database, "teams", inviteData.teamId);
        const teamSnapshot = await getDoc(teamDoc);
        const teamData = teamSnapshot.exists() ? teamSnapshot.data() : null;

        // Get inviting user details
        const inviterDoc = doc(database, "users", inviteData.invitingUserId);
        const inviterSnapshot = await getDoc(inviterDoc);
        const inviterData = inviterSnapshot.exists() ? inviterSnapshot.data() : null;

        return {
          id: inviteId,
          ...inviteData,
          teamName: teamData?.name,
          inviterName: inviterData?.name,
        };
      }
      return null;
    })
  );

  return invites.filter(invite => invite !== null);
};
