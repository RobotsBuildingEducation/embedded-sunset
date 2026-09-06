import { difficultyFor } from "./chessDifficulty.js";

export function thinkingLevelForElo(elo) {
  if (elo <= 800) return "LOW";
  if (elo <= 1400) return "MEDIUM";
  return "HIGH";
}

export function splitIntoThoughtSteps(rawThoughts) {
  let list = [];
  if (Array.isArray(rawThoughts)) {
    list = rawThoughts
      .map((t) => (typeof t === "string" ? t.trim() : ""))
      .filter(Boolean);
  } else if (typeof rawThoughts === "string" && rawThoughts.trim()) {
    list = [rawThoughts.trim()];
  }

  if (list.length > 1) {
    return list;
  }

  if (list.length === 1) {
    // 1. Try splitting on step prefixes, bullet points, or newlines
    const split = list[0]
      .split(
        /\n{2,}|\n(?=(?:(?:Step|Paso|Phase|Fase)\s*\d+[:\.]?|\d+[\.\)]|\*|\-)\s+)|\n+/,
      )
      .map((s) => s.replace(/^[-*•]\s+/, "").trim())
      .filter(Boolean);
    if (split.length > 1) return split;

    // 2. Try splitting on sentence boundaries if it's a solid block of reasoning
    const sentenceSplit = list[0]
      .split(/(?<=[.?!])\s+(?=[A-ZÁÉÍÓÚÑ])/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (sentenceSplit.length > 1) return sentenceSplit;

    return split.length ? split : list;
  }

  return [];
}

export function parseModelResponse(result, legal = [], userLanguage = "en") {
  const responseObj = result?.response || result;
  const candidates = responseObj?.candidates || [];
  const parts = candidates[0]?.content?.parts || [];

  // 1. Extract thought parts and thought signatures
  const rawThoughts = [];
  const thoughtSignatures = [];

  for (const part of parts) {
    if (part.thought) {
      const text = typeof part.thought === "string" ? part.thought : part.text;
      if (typeof text === "string") rawThoughts.push(text);
    }
    const sig = part.thoughtSignature || part.thought_signature;
    if (sig && !thoughtSignatures.includes(sig)) {
      thoughtSignatures.push(sig);
    }
  }

  const candSig =
    candidates[0]?.thoughtSignature || candidates[0]?.thought_signature;
  if (candSig && !thoughtSignatures.includes(candSig)) {
    thoughtSignatures.push(candSig);
  }

  // SDK responses can split JSON across multiple text parts.
  let jsonString = parts
    .filter((part) => !part.thought && typeof part.text === "string")
    .map((part) => part.text)
    .join("");
  if (!jsonString && typeof responseObj?.text === "function") {
    jsonString = responseObj.text();
  }

  const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON object found in model output.");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  if (!parsed.move || !legal.includes(parsed.move)) {
    throw new Error(
      `Parsed move '${parsed?.move}' is not in legal moves list.`,
    );
  }

  // Prefer the native thought text. Legacy JSON steps are used only if absent.
  let thoughtSteps = [];
  if (rawThoughts.length > 0) {
    thoughtSteps = splitIntoThoughtSteps(rawThoughts.join(""));
  } else if (
    Array.isArray(parsed.thinkingSteps) &&
    parsed.thinkingSteps.length > 0
  ) {
    thoughtSteps = parsed.thinkingSteps
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter(Boolean);
  } else if (Array.isArray(parsed.thoughts) && parsed.thoughts.length > 0) {
    thoughtSteps = parsed.thoughts
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter(Boolean);
  }

  const isSpanish = userLanguage === "es";
  const defaultSummary = isSpanish
    ? `Cálculo táctico: jugando ${parsed.move}.`
    : `Tactical calculation: playing ${parsed.move}.`;

  const summary = parsed.thoughtSummary || defaultSummary;

  return {
    move: parsed.move,
    thought: summary,
    thoughtSummary: summary,
    thoughts: thoughtSteps,
    thoughtSignatures,
    thoughtSignature: thoughtSignatures[0] || null,
  };
}

export async function generateBotMove({
  game,
  botElo,
  chessModel,
  userLanguage = "en",
  onThoughtStep,
  stepDelayMs = 0,
}) {
  const isSpanish = userLanguage === "es";
  const band = difficultyFor(botElo, userLanguage);
  const legal = game.moves();
  if (!legal || legal.length === 0) return null;

  const prompt = `You are playing ${game.turn() === "b" ? "Black" : "White"} in a chess game, playing at approximately ${botElo} Elo strength.
Difficulty style: ${band.label}. ${band.guidance}
Current FEN: ${game.fen()}
Move history: ${game.history().join(" ") || "None"}
Legal SAN moves available: ${JSON.stringify(legal)}

${isSpanish ? "Write the explanation and any available thought summaries in Spanish." : "Write the explanation and any available thought summaries in English."}
Use standard SAN chess notation. Select one move from the legal moves list.
Return ONLY valid JSON with this exact schema:
{
  "move": "one exact legal SAN move from the list",
  "thoughtSummary": "A concise explanation for the player of the selected move."
}`;

  const requestPayload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      thinkingConfig: {
        thinkingLevel: thinkingLevelForElo(botElo),
        includeThoughts: true,
      },
    },
  };

  const reportedSteps = [];
  const discoveredSignatures = [];
  const rememberSignature = (part) => {
    const signature = part?.thoughtSignature || part?.thought_signature;
    if (signature && !discoveredSignatures.includes(signature)) {
      discoveredSignatures.push(signature);
    }
  };
  const emitStep = (text) => {
    const step = text.trim();
    if (!step) return;
    const index = reportedSteps.length;
    reportedSteps.push(step);
    onThoughtStep?.(step, index, {
      signatures: [...discoveredSignatures],
      total: reportedSteps.length,
    });
  };

  let result;
  if (typeof chessModel?.generateContentStream === "function") {
    // Exactly one generation request. Errors reach the UI's explicit retry button.
    const streamResult = await chessModel.generateContentStream(requestPayload);
    // Observe rejection immediately: the SDK's stream and response can both fail.
    const responseOutcome = Promise.resolve(streamResult.response).then(
      (response) => ({ response }),
      (error) => ({ error }),
    );
    let responseText = "";
    let pendingThought = "";
    for await (const chunk of streamResult.stream) {
      const candidate = chunk?.candidates?.[0];
      rememberSignature(candidate);
      for (const part of candidate?.content?.parts || []) {
        rememberSignature(part);
        if (part.thought) {
          const text =
            typeof part.thought === "string" ? part.thought : part.text;
          if (typeof text !== "string") continue;
          pendingThought += text;
          // Emit only complete lines. Token fragments must not become new steps.
          const lines = pendingThought.split("\n");
          pendingThought = lines.pop();
          for (const line of lines) emitStep(line);
        } else if (typeof part.text === "string") {
          emitStep(pendingThought);
          pendingThought = "";
          responseText += part.text;
        }
      }
    }
    emitStep(pendingThought);
    const outcome = await responseOutcome;
    // Signature-only parts also break this SDK's aggregate parser. A successfully
    // consumed stream with an answer is authoritative; transport failures above
    // still reject, and malformed/illegal answers fail validation below.
    if (outcome.error && !responseText) throw outcome.error;
    const finalCandidate = outcome.response?.candidates?.[0];
    rememberSignature(finalCandidate);
    for (const part of finalCandidate?.content?.parts || [])
      rememberSignature(part);

    // @firebase/vertexai 1.2.4 drops thought flags/signatures when aggregating.
    // Parse the answer collected from non-thought stream parts, never that mixed text.
    result = responseText
      ? { candidates: [{ content: { parts: [{ text: responseText }] } }] }
      : outcome.response;
  } else {
    result = await chessModel.generateContent(requestPayload);
  }

  const parsedOutput = parseModelResponse(result, legal, userLanguage);
  for (const signature of parsedOutput.thoughtSignatures) {
    rememberSignature({ thoughtSignature: signature });
  }
  if (reportedSteps.length === 0) {
    for (const step of parsedOutput.thoughts) {
      if (reportedSteps.length > 0 && stepDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, stepDelayMs));
      }
      emitStep(step);
    }
  }

  return {
    ...parsedOutput,
    // The exact same ordered text drives the loader, drawer, and persisted room.
    thoughts: [...reportedSteps],
    thoughtSignatures: [...discoveredSignatures],
    thoughtSignature: discoveredSignatures[0] || null,
  };
}
