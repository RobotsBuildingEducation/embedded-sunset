// useFCM.js
import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase-config"; // Adjust the path as needed
import { doc, updateDoc } from "firebase/firestore";
import { database } from "./firebaseResources"; // Adjust the path to your Firestore setup

function useFCM(userId) {
  useEffect(() => {
    // Request notification permission
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        // Retrieve the token; replace YOUR_PUBLIC_VAPID_KEY with your public key
        getToken(messaging, {
          vapidKey:
            "BPLqRrVM3iUvh90ENNZJbJA3FoRkvMql6iWtC4MJaHzhyz9uRTEitwEax9ot05_b6TPoCVnD-tlQtbeZFn1Z_Bg",
        })
          .then((token) => {
            if (token) {
              console.log("FCM Token:", token);
              // Save the token in Firestore for later targeting
              const userDocRef = doc(database, "users", userId);
              updateDoc(userDocRef, { fcmToken: token }).catch((error) =>
                console.error("Error saving token:", error)
              );
            } else {
              console.log("No registration token available.");
            }
          })
          .catch((err) => console.error("Error retrieving token: ", err));
      } else {
        console.log("Notification permission not granted.");
      }
    });

    // Optionally, listen for foreground messages
    onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      // You can update UI or state here as needed.
    });
  }, [userId]);
}

export default useFCM;
