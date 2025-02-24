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
} from "firebase/firestore";
import { database } from "../database/firebaseResources";

// Update user data with timer, streak, startTime, and endTime
export const updateUserData = async (
  userId,
  timer,
  streak,
  startTime,
  endTime
) => {
  const userDocRef = doc(database, "users", userId);
  await updateDoc(userDocRef, {
    timer,
    streak,
    startTime: startTime.toISOString(), // Store dates as ISO strings
    endTime: endTime.toISOString(),
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
      startTime: new Date(data.startTime), // Convert ISO strings back to Date objects
      endTime: new Date(data.endTime),
    };
  } else {
    return null; // Handle case where user document does not exist
  }
};

// Function to create or update a user in Firestore
export const createUser = async (npub, userName, language) => {
  const userDoc = doc(database, "users", npub);
  await setDoc(
    userDoc,
    {
      isAdaptiveLearning: true,
      name: userName,
      npub: npub,
      step: 0, // Initialize step count to 0
      previousStep: 0,
      language: language,
      allowPosts: false,
      identity:
        "npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt",
    },
    { merge: true }
  ); // Merge true ensures it doesn't overwrite existing data
};

// Function to increment the step count for a user
export const incrementUserStep = async (npub) => {
  const userDoc = doc(database, "users", npub);
  const userSnapshot = await getDoc(userDoc);

  if (userSnapshot.exists()) {
    const currentStep = userSnapshot.data().step || 0;
    await updateDoc(userDoc, {
      previousStep: currentStep + 1,
      step: currentStep + 1,
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

export const deleteSpecificDocuments = () => {
  const usersCollectionRef = collection(database, "users");

  const q = query(usersCollectionRef, where("name", "==", "test"));

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
