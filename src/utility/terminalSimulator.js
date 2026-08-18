export const simulateCliCommand = (commandString = "", userLanguage = "en") => {
  const trimmed = String(commandString || "").trim();
  if (!trimmed) return null;

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0]?.toLowerCase();
  const subCmd = parts[1]?.toLowerCase();
  const rest = parts.slice(1);
  const restJoined = rest.join(" ");

  if (cmd === "firebase") {
    if (subCmd === "deploy") {
      if (restJoined.includes("firestore:rules") || restJoined.includes("rules")) {
        return [
          "=== Deploying to 'app-project'...",
          "i  deploying firestore:rules",
          "✔  firestore: rules file uploaded successfully",
          "✔  Deploy complete!",
        ].join("\n");
      }
      if (restJoined.includes("hosting")) {
        return [
          "=== Deploying to 'app-project'...",
          "i  deploying hosting",
          "✔  hosting[app-project]: file upload complete",
          "✔  Deploy complete!",
        ].join("\n");
      }
      if (restJoined.includes("functions")) {
        return [
          "=== Deploying to 'app-project'...",
          "i  deploying functions",
          "✔  functions: deployment complete",
          "✔  Deploy complete!",
        ].join("\n");
      }
      return [
        "=== Deploying to 'app-project'...",
        "i  deploying firestore, hosting",
        "✔  Deploy complete!",
      ].join("\n");
    }
    if (subCmd === "init") {
      return "? Which Firebase features do you want to set up for this directory? (Press <space> to select)";
    }
    if (subCmd === "login") {
      return "Already logged in as user@developer.io";
    }
    if (subCmd === "emulators:start") {
      return "✔  All emulators ready at http://localhost:4000";
    }
    if (subCmd === "serve") {
      return "✔  Local server running at http://localhost:5000";
    }
    return `Firebase CLI v13.4.0 (${trimmed})`;
  }

  if (cmd === "git") {
    if (subCmd === "status") {
      return [
        "On branch main",
        "Your branch is up to date with 'origin/main'.",
        "nothing to commit, working tree clean",
      ].join("\n");
    }
    if (subCmd === "commit") {
      const commitMsg = rest.slice(1).join(" ").replace(/^-m\s*["']?|["']?$/g, "") || "update";
      return [
        `[main 4a8f9c1] ${commitMsg}`,
        " 1 file changed, 14 insertions(+)",
      ].join("\n");
    }
    if (subCmd === "add") {
      return "";
    }
    if (subCmd === "push") {
      return [
        "Enumerating objects: 5, done.",
        "Writing objects: 100% (3/3), done.",
        "To github.com:learner/repo.git",
        "   3a9b2c..4a8f9c  main -> main",
      ].join("\n");
    }
    if (subCmd === "pull") {
      return "Already up to date.";
    }
    if (subCmd === "checkout" || subCmd === "switch") {
      const branchName = rest.find((arg) => !arg.startsWith("-")) || "main";
      return `Switched to branch '${branchName}'`;
    }
    if (subCmd === "branch") {
      return "* main";
    }
    if (subCmd === "clone") {
      const repo = rest.find((arg) => !arg.startsWith("-")) || "repository";
      const folder = repo.replace(/\.git$/, "").split("/").pop() || "repo";
      return `Cloning into '${folder}'... done.`;
    }
    if (subCmd === "init") {
      return "Initialized empty Git repository in /workspace/.git/";
    }
    return "git version 2.44.0";
  }

  if (cmd === "npm" || cmd === "yarn" || cmd === "pnpm") {
    if (subCmd === "install" || subCmd === "i" || subCmd === "add") {
      const pkg =
        rest.find(
          (arg) =>
            !arg.startsWith("-") &&
            arg !== "install" &&
            arg !== "i" &&
            arg !== "add",
        ) || "packages";
      return `added 1 package [${pkg}], and audited 142 packages in 0.9s\nfound 0 vulnerabilities`;
    }
    if (
      subCmd === "run" ||
      subCmd === "start" ||
      subCmd === "build" ||
      subCmd === "test" ||
      subCmd === "dev"
    ) {
      if (restJoined.includes("build")) {
        return "✓ 42 modules transformed.\ndist/index.html   0.45 kB\ndist/assets/index.js   142.10 kB\n✓ built in 380ms.";
      }
      if (restJoined.includes("test")) {
        return "PASS src/App.test.jsx (1 passed, 1 total)";
      }
      return "VITE v5.2.0  ready in 210 ms\n➜  Local:   http://localhost:5173/\n➜  Network: use --host to expose";
    }
    return "npm v10.2.4";
  }

  if (cmd === "npx") {
    return `Need to install the following packages:\n  ${subCmd || "create-app"}\nOk to proceed? (y)\nDone in 2.1s.`;
  }

  if (cmd === "node") {
    if (restJoined.includes("-v") || restJoined.includes("--version"))
      return "v20.11.0";
    return "[Process completed with exit code 0]";
  }

  if (cmd === "python" || cmd === "python3") {
    if (restJoined.includes("-V") || restJoined.includes("--version"))
      return "Python 3.11.8";
    return "[Process completed with exit code 0]";
  }

  if (cmd === "curl") {
    return 'HTTP/2 200 OK\ncontent-type: application/json\n\n{"status":"success","ok":true}';
  }

  if (cmd === "docker") {
    if (subCmd === "ps")
      return "CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES";
    if (subCmd === "build")
      return "Successfully built 7f9a2b1c4e\nSuccessfully tagged app:latest";
    if (subCmd === "run") return "[Container started]";
    return "Docker version 25.0.3";
  }

  return `[Executed: ${trimmed}]`;
};
