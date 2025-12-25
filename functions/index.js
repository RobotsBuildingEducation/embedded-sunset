const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fetch = require("node-fetch");
const { pipeline } = require("stream");
const { promisify } = require("util");
const pipelineAsync = promisify(pipeline);
const admin = require("firebase-admin"); // Import Firebase Admin SDK
const fireFunctions = require("firebase-functions/v1"); // Imports v1 functions

dotenv.config();

// Initialize Firebase Admin SDK
admin.initializeApp();

const app = express();
app.use(cors());
app.use(express.json());

// app.set("trust proxy", true);

// Capture and log user IP addresses
// app.use((req, res, next) => {
//   const userIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
//   console.log("User IP Address:", userIP);
//   next();
// });

// Dynamic allowed origins based on environment

const encouragingMessages = [
  {
    title: "You're Doing Great!",
    body: "Every small step you take today brings you closer to your dreams. Keep going—we believe in you!",
  },
  {
    title: "You've Got This!",
    body: "Challenges are opportunities in disguise. Trust yourself, you're more capable than you realize.",
  },
  {
    title: "Proud of You!",
    body: "Remember, every effort counts. Celebrate your progress—you deserve it!",
  },
  {
    title: "Keep Shining!",
    body: "Your unique qualities make this world brighter. Let your talents shine today!",
  },
  {
    title: "Today is Yours!",
    body: "Embrace today with courage and kindness. Wonderful things await you!",
  },
  {
    title: "You Matter!",
    body: "Your presence makes a difference. Keep being you; the world needs exactly who you are.",
  },
  {
    title: "Be Proud!",
    body: "Reflect on how far you've come and be proud. Every step forward is a victory.",
  },
  {
    title: "Stay Curious!",
    body: "Learning something new today will open doors tomorrow. Keep exploring!",
  },
  {
    title: "Believe in Yourself!",
    body: "Your potential is limitless. Trust your abilities, and amazing things will happen.",
  },
  {
    title: "You're Valued!",
    body: "Your thoughts, feelings, and ideas are important. Thank you for being here today!",
  },
  {
    title: "Stay Strong!",
    body: "Remember, even the toughest days make you stronger. You've got this!",
  },
  {
    title: "Great Things Await!",
    body: "Keep pushing forward; incredible things are waiting on the other side.",
  },
  {
    title: "One Step at a Time!",
    body: "Every small action today builds a brighter tomorrow.",
  },
  {
    title: "You Inspire!",
    body: "Your courage and dedication inspire those around you. Keep going!",
  },
  {
    title: "Celebrate Your Growth!",
    body: "Each challenge you overcome makes you wiser and stronger.",
  },
  {
    title: "Choose Positivity!",
    body: "A positive mindset can open endless possibilities today.",
  },
  {
    title: "Trust Your Journey!",
    body: "Every experience is shaping you for something wonderful ahead.",
  },
  {
    title: "Unique & Special!",
    body: "Your individuality makes the world more beautiful.",
  },
  {
    title: "Face Forward!",
    body: "Your future is bright—keep your eyes on your goals.",
  },
  {
    title: "You Can Do It!",
    body: "Believe in your strength and keep moving ahead.",
  },
  { title: "Never Give Up!", body: "Perseverance always pays off in the end." },
  { title: "Stay Positive!", body: "Positivity fuels progress. Keep smiling!" },
  {
    title: "Cherish Yourself!",
    body: "Your self-worth is your greatest treasure.",
  },
  {
    title: "Embrace Change!",
    body: "Every new chapter holds exciting possibilities.",
  },
  { title: "Dream Big!", body: "Your dreams are worth every effort." },
  {
    title: "Grow Confidently!",
    body: "Believe in yourself as you grow stronger every day.",
  },
  {
    title: "Grateful for You!",
    body: "Your efforts don't go unnoticed. Thank you for being you.",
  },
  { title: "Be Brave!", body: "Courage leads to beautiful destinations." },
  {
    title: "Keep Believing!",
    body: "Trust yourself, and watch great things unfold.",
  },
  { title: "Shine Bright!", body: "You have endless reasons to glow today." },
  { title: "Choose Happiness!", body: "Today is a great day to find joy." },
  {
    title: "Powerful You!",
    body: "You're stronger than any challenge you face.",
  },
  { title: "Stay Motivated!", body: "Your dreams deserve your determination." },
  { title: "You're Growing!", body: "Every experience adds to your wisdom." },
  {
    title: "Trust Yourself!",
    body: "You have everything you need within you.",
  },
  {
    title: "You're Growing Every Day!",
    body: "Every small step you take is leading you towards something wonderful. Be proud of your progress today!",
  },
  {
    title: "Challenge Accepted!",
    body: "Each challenge you face is an opportunity to learn something amazing about yourself. You've got this!",
  },
  {
    title: "You Matter Here",
    body: "Your thoughts, your ideas, your voice—they all matter. We're so glad you're part of our community!",
  },
  {
    title: "Celebrate Your Effort!",
    body: "Remember, it's not just about results—your effort and perseverance deserve recognition. Keep going!",
  },
  {
    title: "You Have Unique Strengths",
    body: "No one else can bring your special blend of talents and personality. The world needs exactly who you are today!",
  },
  {
    title: "Proud of You!",
    body: "Every effort counts, every struggle teaches. We're incredibly proud of you for showing up today.",
  },
  {
    title: "Embrace the Journey",
    body: "Growth doesn't happen overnight. Celebrate your journey—every step you take is valuable and important.",
  },
  {
    title: "You Are Appreciated",
    body: "Thank you for being exactly who you are. Your presence makes our community brighter and stronger!",
  },
  {
    title: "Step Into Confidence",
    body: "You have everything you need within you to handle whatever today brings. Believe in your power and potential!",
  },
  {
    title: "Today Is Yours",
    body: "This day is another chance to grow, explore, and embrace your full potential. Make it your own!",
  },

  {
    title: "Believe in Yourself",
    body: "You have overcome challenges before, and today is no different. Trust your abilities.",
  },
  {
    title: "Courage to Try",
    body: "Taking risks means you're brave enough to learn and grow. Keep stepping forward!",
  },
  {
    title: "Your Voice Matters",
    body: "Express yourself with confidence—your perspective is valuable and needed.",
  },
  {
    title: "You're Doing Great",
    body: "Recognize your achievements, no matter how small they seem. You're on the right track!",
  },
  {
    title: "Keep Going Strong",
    body: "Every day you show up, you build resilience. Proud of you for staying the course!",
  },
  {
    title: "You're a Difference Maker",
    body: "Your actions and kindness make a difference in ways you might not yet see.",
  },
  {
    title: "Stay Curious",
    body: "Every new experience helps you grow. Embrace today's opportunities with curiosity!",
  },
  {
    title: "You Inspire Others",
    body: "Your dedication and commitment don't go unnoticed. You inspire more people than you realize.",
  },
  {
    title: "Welcome Challenges",
    body: "Challenges are opportunities in disguise. Embrace them and watch yourself flourish.",
  },
  {
    title: "Your Progress Counts",
    body: "Every step forward, no matter the size, is worth celebrating. Keep moving!",
  },
  {
    title: "Find Your Strength",
    body: "Your inner strength is limitless. Trust yourself to handle anything today.",
  },
  {
    title: "You Belong Here",
    body: "This community is better because you're in it. Never forget that you're valued.",
  },
  {
    title: "Brighten the Day",
    body: "Today, be the reason someone smiles—including yourself! You have that power.",
  },
  {
    title: "Cherish Your Journey",
    body: "Every experience, success, or setback, shapes the wonderful person you're becoming.",
  },
  {
    title: "You Are Enough",
    body: "Just as you are, right now, you are worthy, capable, and ready for this moment.",
  },
  {
    title: "Today Matters",
    body: "Every day is important. Make today meaningful, no matter how you choose to do it.",
  },
  {
    title: "You've Got Potential",
    body: "You're brimming with potential. Believe it, nurture it, and watch yourself grow.",
  },
  {
    title: "Feel Proud Today",
    body: "Take a moment to appreciate yourself. You're doing amazing things, big and small.",
  },
  {
    title: "You Are Valued",
    body: "Your presence adds something special to the world. We're grateful you're here.",
  },
  {
    title: "Trust Your Journey",
    body: "Every step, even uncertain ones, takes you closer to your goals. Trust the path you're on.",
  },
  {
    title: "Embrace Your Strength",
    body: "Remember your strength is greater than any obstacle. You are powerful beyond measure.",
  },
  {
    title: "Shine Bright",
    body: "Never dim your light for anyone. The world benefits greatly from your authentic self.",
  },
  {
    title: "You're Making Progress",
    body: "Every day, you're getting closer to who you want to be. Celebrate your journey!",
  },
  {
    title: "You Are Important",
    body: "Never doubt your importance. You matter deeply to those around you.",
  },
  {
    title: "Greatness Awaits",
    body: "Each day brings a new chance to be your best. Embrace it with enthusiasm!",
  },
  {
    title: "Keep Believing",
    body: "Your belief in yourself is your greatest strength. Never stop trusting your potential.",
  },
  {
    title: "You Matter!",
    body: "Remember, your presence makes a difference. You belong here, and we're so glad you’re part of our community.",
  },
  {
    title: "Growth Takes Time",
    body: "Every small step forward counts. Celebrate each bit of progress you make today!",
  },
  {
    title: "Believe in Yourself",
    body: "Trust in your abilities. You're more capable than you realize.",
  },
  {
    title: "Face Today Boldly",
    body: "Challenges are just opportunities for growth. You've got this!",
  },
  {
    title: "Your Best is Enough",
    body: "Doing your best looks different every day—and that's perfectly okay.",
  },
  {
    title: "You're Doing Great",
    body: "Take a moment to appreciate how far you've already come.",
  },
  {
    title: "Kindness Counts",
    body: "Be gentle with yourself today. You're learning and growing beautifully.",
  },
  {
    title: "You’re Valued",
    body: "Your unique perspective enriches everyone around you. Thank you for being you!",
  },
  {
    title: "Small Wins Matter",
    body: "Every effort, no matter how small, is a step toward your dreams.",
  },
  {
    title: "You've Got Potential",
    body: "Keep exploring, keep trying. There's so much greatness ahead of you.",
  },
  {
    title: "Stay Curious",
    body: "Asking questions and seeking answers shows your strength and wisdom.",
  },
  {
    title: "You're Resilient",
    body: "Look at all the hurdles you've overcome. Keep going—you're amazing!",
  },
  {
    title: "Today is a Fresh Start",
    body: "No matter yesterday, today is a new chance to shine.",
  },
  {
    title: "Celebrate Yourself",
    body: "Take a moment today to recognize something wonderful about yourself.",
  },
  {
    title: "Mistakes = Growth",
    body: "Every mistake is proof you're trying. Be proud of your courage.",
  },
  {
    title: "You Inspire Others",
    body: "Your efforts and kindness don't go unnoticed—you're inspiring people around you.",
  },
  {
    title: "Keep Moving Forward",
    body: "Every step forward, no matter the pace, leads to success.",
  },
  {
    title: "Embrace Your Strength",
    body: "You have incredible inner strength—trust it and let it guide you today.",
  },
  {
    title: "You Are Enough",
    body: "Exactly as you are, right now, you are valuable and enough.",
  },
  {
    title: "You’re Doing Important Things",
    body: "What you're doing today contributes to a better tomorrow.",
  },
  {
    title: "Courage Wins",
    body: "Each act of courage makes you stronger. Dare to try something new today!",
  },
  {
    title: "Trust Your Journey",
    body: "Your unique path has purpose. Trust the process and keep going.",
  },
  {
    title: "Self-Care is Strength",
    body: "Taking care of yourself helps you take care of everything else. Prioritize you today!",
  },
  {
    title: "Your Dreams Matter",
    body: "Never underestimate the power of your dreams. Chase them proudly!",
  },
  {
    title: "You’ve Got Support",
    body: "You're not alone—reach out whenever you need. We’re here cheering for you!",
  },
  {
    title: "Confidence Grows",
    body: "Every new thing you try boosts your confidence. Keep exploring!",
  },
  {
    title: "Proud of You!",
    body: "Pause for a moment to appreciate how incredible you truly are.",
  },
  {
    title: "Believe and Achieve",
    body: "Belief in yourself is the first step towards achieving greatness.",
  },
  {
    title: "You’re Capable",
    body: "You've handled challenges before and can handle whatever today brings.",
  },
  {
    title: "Gratitude Boost",
    body: "Think of one thing you're grateful for—it'll brighten your day.",
  },
  {
    title: "Embrace Imperfection",
    body: "Perfection isn't the goal—growth and learning are. Embrace being perfectly imperfect!",
  },
  {
    title: "Shine Brightly",
    body: "Never dim your light for others. Let the real you shine!",
  },
  {
    title: "Success Awaits",
    body: "Your hard work today is setting you up for tomorrow's success.",
  },
  {
    title: "You’re Making Progress",
    body: "Even tiny progress is meaningful. Keep it up, you're doing great!",
  },
  {
    title: "You’re Appreciated",
    body: "Your effort and energy make our community better. Thank you for being here!",
  },
];
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        "https://embedded-sunset.app",
        "http://localhost:4445",
        "https://robotsbuildingeducation.com",
      ]
    : [
        "https://embedded-sunset.app",
        "http://localhost:4445",
        "https://robotsbuildingeducation.com",
      ];

// Middleware to check the Referer or Origin header
app.use((req, res, next) => {
  const origin = req.headers.origin || req.headers.referer;
  if (
    !origin ||
    !allowedOrigins.some((allowedOrigin) => origin.startsWith(allowedOrigin))
  ) {
    return res.status(403).send({ error: "invalid" });
  }
  next();
});

// Function to capture and return user IP address
// exports.captureUserIP = functions.https.onRequest((req, res) => {
//   const userIP =
//     req.headers["x-forwarded-for"] || // From proxies, if available
//     req.connection.remoteAddress || // Direct IP from socket
//     req.socket.remoteAddress || // Another socket fallback
//     req.ip; // Express/Node default

//   console.log("Detected User IP:", userIP);
//   res.status(200).send(`Your IP is: ${userIP}`);
// });

// Middleware to verify App Check tokens
async function verifyAppCheckToken(req, res, next) {
  const appCheckToken = req.header("X-Firebase-AppCheck");

  if (!appCheckToken) {
    console.warn("Request missing App Check token. Rejecting request.");
    res.status(401).send({ error: "App Check token missing" });
    return;
  }

  try {
    // Verify the App Check token using Firebase Admin SDK
    await admin.appCheck().verifyToken(appCheckToken);
    next();
  } catch (err) {
    console.error("Invalid App Check token:", err);
    res.status(401).send({ error: "Invalid App Check token" });
  }
}

// Function to calculate the number of characters
function calculateCharacterCount(messages) {
  const characterCount = messages.reduce((total, message) => {
    return total + (message.content ? message.content.length : 0);
  }, 0);
  return characterCount;
}

// Apply the App Check middleware to your route
app.post("/obsessed-stalker", verifyAppCheckToken, async (req, res) => {
  try {
    const { model, messages, ...restOfApiParams } = req.body;

    // Calculate the number of characters in the input messages
    const characterCount = calculateCharacterCount(messages || []);
    const maxCharacterLimit = 25000;

    if (characterCount > maxCharacterLimit) {
      return res.status(400).send({
        error: `Character count exceeds the limit of ${maxCharacterLimit} characters.`,
      });
    }

    // Construct the payload for OpenAI API
    const constructor = {
      model: "gpt-5-nano",
      input: messages || [],
      reasoning: { effort: "minimal" },
      text: { verbosity: "low" },
      ...restOfApiParams,
    };

    // Make the OpenAI API call using node-fetch
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify(constructor),
      }
    );

    if (openaiResponse.status === 429) {
      const retryAfter = "300"; // Default to 300 seconds if header is missing
      res.setHeader("Retry-After", retryAfter);
      return res.status(429).send({
        error: "Rate limit exceeded.",
        retryAfter: retryAfter,
      });
    }

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    // Parse the entire response body as JSON
    const openaiData = await openaiResponse.json();

    // Send the complete response back to the frontend
    res.status(200).json(openaiData);
  } catch (error) {
    console.error("Error generating completion:", error);
    res.status(500).send({ error: error.message });
  }
});

exports.sendDailyEncouragingMessage = fireFunctions.pubsub
  .schedule("13 10 * * *")
  .timeZone("America/Los_Angeles")
  .onRun(async (context) => {
    try {
      // Query Firestore for all user tokens (ensure 'fcmToken' field is saved in Firestore)
      const tokensSnapshot = await admin
        .firestore()
        .collection("users")
        .where("fcmToken", "!=", null)
        .get();

      const tokens = tokensSnapshot.docs.map((doc) => doc.data().fcmToken);

      if (tokens.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * encouragingMessages.length
        );
        const selectedMessage = encouragingMessages[randomIndex];

        const messagePayload = {
          notification: {
            title: selectedMessage.title,
            body: selectedMessage.body,
          },
          // data: {
          //   title: selectedMessage.title,
          //   body: selectedMessage.body,

          // },
          tokens: tokens,
        };
        const response = await admin
          .messaging()
          .sendEachForMulticast(messagePayload);
        console.log("Successfully sent messages:", response);
      } else {
        console.log("No tokens available for sending notifications.");
      }
    } catch (error) {
      console.error("Error sending daily notification:", error);
    }
  });

async function verifyAppCheckToken(req, res, next) {
  const appCheckToken = req.header("X-Firebase-AppCheck");
  if (!appCheckToken) {
    console.warn("Missing App Check token.");
    return res.status(401).send({ error: "App Check token missing" });
  }
  try {
    await admin.appCheck().verifyToken(appCheckToken);
    next();
  } catch (err) {
    console.error("Invalid App Check token:", err);
    res.status(401).send({ error: "Invalid App Check token" });
  }
}

// Endpoint to schedule a push notification after 15 seconds
app.post("/sendTestPush", verifyAppCheckToken, (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).send({ error: "Missing device token" });
  }

  // Schedule the push notification after a 15-second delay
  setTimeout(async () => {
    const randomIndex = Math.floor(Math.random() * encouragingMessages.length);
    const selectedMessage = encouragingMessages[randomIndex];

    const messagePayload = {
      notification: {
        title: selectedMessage.title,
        body: selectedMessage.body,
      },
      // data: {
      //   title: selectedMessage.title,
      //   body: selectedMessage.body,
      // },
      token: token,
    };

    try {
      const response = await admin.messaging().send(messagePayload);
      console.log("Push notification sent:", response);
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  }, 3000);

  res.status(200).send({ message: "Push notification scheduled" });
});

function withValidProperties(properties) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    })
  );
}

app.get("/.well-known/farcaster.json", (req, res) => {
  const URL = process.env.VITE_URL;
  res.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE,
    },
    frame: withValidProperties({
      version: "1",
      name: process.env.VITE_ONCHAINKIT_PROJECT_NAME,
      subtitle: process.env.VITE_APP_SUBTITLE,
      description: process.env.VITE_APP_DESCRIPTION,
      screenshotUrls: [
        "https://res.cloudinary.com/dtkeyccga/image/upload/v1751082997/65EDD17C-62CD-4D7E-9BC4-B443D6EA1AF3_ozotcr.png",
        "https://res.cloudinary.com/dtkeyccga/image/upload/v1751082997/95A2D2E2-F130-4C66-A025-917C9406C531_szv5zn.png",
        "https://res.cloudinary.com/dtkeyccga/image/upload/v1751082997/9B83B418-69DA-4ABB-BD53-C6A2DB4387CD_vzgsra.png",
      ],
      iconUrl: process.env.VITE_APP_ICON,
      splashImageUrl: process.env.VITE_APP_SPLASH_IMAGE,
      splashBackgroundColor: process.env.VITE_SPLASH_BACKGROUND_COLOR,
      homeUrl: URL,
      webhookUrl: `${URL}/api/webhook`,
      primaryCategory: process.env.VITE_APP_PRIMARY_CATEGORY,
      tags: [],
      heroImageUrl: process.env.VITE_APP_HERO_IMAGE,
      tagline: process.env.VITE_APP_TAGLINE,
      ogTitle: process.env.VITE_APP_OG_TITLE,
      ogDescription: process.env.VITE_APP_OG_DESCRIPTION,
      ogImageUrl: process.env.VITE_APP_OG_IMAGE,
    }),
  });
});

exports.app = fireFunctions.https.onRequest(app);
