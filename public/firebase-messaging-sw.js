// public/firebase-messaging-sw.js

// Import Firebase scripts required for the service worker.
importScripts(
  "https://www.gstatic.com/firebasejs/9.6.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.6.0/firebase-messaging-compat.js"
);

// Initialize Firebase with your configuration.
firebase.initializeApp({
  apiKey: "AIzaSyA7JiUybOOoa83Xe49tJbhrMvjapgfNEH8",
  authDomain: "test-data-895e2.firebaseapp.com",
  projectId: "test-data-895e2",
  storageBucket: "test-data-895e2.appspot.com",
  messagingSenderId: "422553960926",
  appId: "1:422553960926:web:b82f7d896823cf59b69d4f",
  measurementId: "G-QGT3G8JQ8F",
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const { title, body } = payload.notification;
  const notificationOptions = {
    body: body,
    // Optionally, you can add an icon or other options here.
  };

  // Show the notification to the user.
  self.registration.showNotification(title, notificationOptions);
});
