import { spawn, spawnSync } from "node:child_process";
import { accessSync, constants, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import net from "node:net";

const FIREBASE_SERVICES = "firestore,functions";
const FIRESTORE_PORT = 8080;
const FUNCTIONS_PORT = 5001;
const STARTUP_TIMEOUT_MS = 45_000;
const EMULATOR_DATA_DIR = fileURLToPath(
  new URL("../.firebase-emulator-data", import.meta.url),
);

const javaHomes = [
  process.env.JAVA_HOME,
  "/opt/homebrew/opt/openjdk@21",
  "/usr/local/opt/openjdk@21",
  "/opt/homebrew/opt/openjdk",
  "/usr/local/opt/openjdk",
].filter(Boolean);

function hasExecutable(path) {
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function resolveJavaHome() {
  for (const javaHome of javaHomes) {
    if (hasExecutable(`${javaHome}/bin/java`)) return javaHome;
  }

  const javaCheck = spawnSync("java", ["-version"], { stdio: "ignore" });
  return javaCheck.status === 0 ? "" : null;
}

function waitForPort(port, timeoutMs) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = net.createConnection({ host: "127.0.0.1", port });

      socket.once("connect", () => {
        socket.destroy();
        resolve();
      });
      socket.once("error", () => {
        socket.destroy();
        if (Date.now() - startedAt >= timeoutMs) {
          reject(new Error(`Timed out waiting for local port ${port}.`));
          return;
        }
        setTimeout(tryConnect, 250);
      });
    };

    tryConnect();
  });
}

const javaHome = resolveJavaHome();
if (javaHome === null) {
  console.error(
    "Java 21 is required for the local Firestore emulator. Install OpenJDK 21 or set JAVA_HOME.",
  );
  process.exit(1);
}

const childEnv = {
  ...process.env,
  ...(javaHome ? { JAVA_HOME: javaHome } : {}),
  PATH: javaHome
    ? `${javaHome}/bin:${process.env.PATH || ""}`
    : process.env.PATH,
};

const firebaseArgs = ["emulators:start", "--only", FIREBASE_SERVICES];
if (existsSync(EMULATOR_DATA_DIR)) {
  firebaseArgs.push("--import", EMULATOR_DATA_DIR);
}
firebaseArgs.push("--export-on-exit", EMULATOR_DATA_DIR);

const firebase = spawn(
  "firebase",
  firebaseArgs,
  { env: childEnv, stdio: "inherit" },
);

let vite = null;
let shuttingDown = false;

function stopChildren(signal = "SIGTERM") {
  if (shuttingDown) return;
  shuttingDown = true;
  if (vite && !vite.killed) vite.kill(signal);
  if (!firebase.killed) firebase.kill(signal);
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    stopChildren(signal);
    process.exit(0);
  });
}

const firebaseFailure = new Promise((_, reject) => {
  firebase.once("error", (error) => {
    reject(new Error(`Unable to start Firebase emulators: ${error.message}`));
  });
  firebase.once("exit", (code) => {
    if (!shuttingDown) {
      reject(new Error(`Firebase emulators stopped unexpectedly (exit ${code}).`));
    }
  });
});

try {
  await Promise.race([
    Promise.all([
      waitForPort(FIRESTORE_PORT, STARTUP_TIMEOUT_MS),
      waitForPort(FUNCTIONS_PORT, STARTUP_TIMEOUT_MS),
    ]),
    firebaseFailure,
  ]);
} catch (error) {
  console.error(error.message);
  stopChildren();
  process.exit(1);
}

vite = spawn(
  "npm",
  ["run", "dev:ui"],
  { env: childEnv, stdio: "inherit" },
);

vite.once("error", (error) => {
  console.error("Unable to start Vite:", error.message);
  stopChildren();
  process.exitCode = 1;
});

vite.once("exit", (code) => {
  stopChildren();
  process.exitCode = code || 0;
});
