import { difficultyFor } from "./chessDifficulty.js";

export function thinkingLevelForElo(elo) {
  if (elo <= 800) return "LOW";
  if (elo <= 1400) return "MEDIUM";
  return "HIGH";
}

export function thinkingBudgetForElo(elo) {
  if (elo <= 800) return 0;
  if (elo <= 1200) return 512;
  if (elo <= 1600) return 1024;
  return 2048;
}

export function minimumDeliberationTimeForElo(elo) {
  if (elo <= 800) return 1000;
  if (elo <= 1400) return 1800;
  return 2500;
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

export async function playbackSteps(
  steps,
  {
    onThoughtStep,
    signatures = [],
    startTime = Date.now(),
    minTime = 1000,
    stepDelayMs,
    reportedCount = 0,
  } = {},
) {
  if (!steps || steps.length === 0) {
    const elapsed = Date.now() - startTime;
    if (elapsed < minTime && typeof stepDelayMs !== "number") {
      await new Promise((resolve) => setTimeout(resolve, minTime - elapsed));
    }
    return;
  }
  const total = steps.length;
  const stepInterval =
    typeof stepDelayMs === "number"
      ? stepDelayMs
      : Math.max(Math.min(Math.floor(minTime / Math.max(total, 1)), 900), 550);

  for (let i = reportedCount; i < total; i += 1) {
    if (i > 0) {
      await new Promise((resolve) => setTimeout(resolve, stepInterval));
    }
    onThoughtStep?.(steps[i], i, { signatures, total });
  }

  const elapsed = Date.now() - startTime;
  if (elapsed < minTime && typeof stepDelayMs !== "number") {
    await new Promise((resolve) => setTimeout(resolve, minTime - elapsed));
  }
}

export function generateDeliberationSteps(
  move,
  { botElo = 1500, userLanguage = "en", game } = {},
) {
  const isSpanish = userLanguage === "es";
  const history = game?.history ? game.history().slice(-4).join(", ") : "";
  const recentContext = history
    ? isSpanish
      ? `Tras las jugadas recientes (${history}), `
      : `Following recent moves (${history}), `
    : "";

  if (isSpanish) {
    return [
      `${recentContext}evaluación exhaustiva de la posición: analizando la estructura de peones, el control de las casillas centrales y las posibles líneas abiertas del rival.`,
      `Cálculo profundo de variantes tácticas y jugadas candidatas; verificando la seguridad de las piezas desprotegidas y comparando opciones contra ${move}.`,
      `Conclusión táctica: seleccionando ${move} como la jugada más sólida para neutralizar amenazas inmediatas, activar piezas y mantener la iniciativa.`,
    ];
  }
  return [
    `${recentContext}thorough evaluation of the position: assessing pawn structure, control over central squares, and active diagonals for both sides.`,
    `Concrete calculation of tactical variations and candidate lines; verifying the safety of loose pieces and evaluating responses to ${move}.`,
    `Tactical conclusion: selecting ${move} as the strongest continuation to restrict opponent counterplay and maintain solid piece coordination.`,
  ];
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
      if (text && text.trim()) rawThoughts.push(text.trim());
    }
    const sig = part.thoughtSignature || part.thought_signature;
    if (sig && !thoughtSignatures.includes(sig)) {
      thoughtSignatures.push(sig);
    }
  }

  const candSig = candidates[0]?.thoughtSignature || candidates[0]?.thought_signature;
  if (candSig && !thoughtSignatures.includes(candSig)) {
    thoughtSignatures.push(candSig);
  }

  // 2. Extract JSON response: look for the part that is NOT a thought, or search full text
  let jsonString = "";
  for (let i = parts.length - 1; i >= 0; i -= 1) {
    const p = parts[i];
    if (!p.thought && p.text && p.text.includes("{")) {
      jsonString = p.text;
      break;
    }
  }

  if (!jsonString) {
    try {
      jsonString = typeof responseObj.text === "function" ? responseObj.text() : "";
    } catch {
      jsonString = parts.map((p) => p.text || (typeof p.thought === "string" ? p.thought : "")).join("\n");
    }
  }

  const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON object found in model output.");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  if (!parsed.move || !legal.includes(parsed.move)) {
    throw new Error(`Parsed move '${parsed?.move}' is not in legal moves list.`);
  }

  // 3. Extract distinct thinking steps from parsed.thinkingSteps or rawThoughts (separate from thoughtSummary)
  let thoughtSteps = [];
  if (Array.isArray(parsed.thinkingSteps) && parsed.thinkingSteps.length > 0) {
    thoughtSteps = parsed.thinkingSteps
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter(Boolean);
  } else if (Array.isArray(parsed.thoughts) && parsed.thoughts.length > 0) {
    thoughtSteps = parsed.thoughts
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter(Boolean);
  } else if (rawThoughts.length > 0) {
    thoughtSteps = splitIntoThoughtSteps(rawThoughts);
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
  fallbackModel,
  userLanguage = "en",
  onThoughtStep,
  stepDelayMs,
}) {
  const isSpanish = userLanguage === "es";
  const band = difficultyFor(botElo, userLanguage);
  const legal = game.moves();
  if (!legal || legal.length === 0) return null;
  if (legal.length === 1) {
    const onlyMoveSummary = isSpanish
      ? `Única jugada legal disponible: jugando ${legal[0]}.`
      : `Only one legal move available: playing ${legal[0]}.`;
    const onlyMoveSteps = isSpanish
      ? [
          "Evaluación de opciones disponibles en el tablero.",
          `Verificación de reglas: ${legal[0]} es la única jugada legal sin jaque en contra.`,
        ]
      : [
          "Evaluating available legal options on the board.",
          `Rule verification: ${legal[0]} is the only legal move avoiding check.`,
        ];
    onThoughtStep?.(onlyMoveSteps[0], 0, { signatures: [], total: 2 });
    return {
      move: legal[0],
      thought: onlyMoveSummary,
      thoughtSummary: onlyMoveSummary,
      thoughts: onlyMoveSteps,
      thoughtSignatures: [],
      thoughtSignature: null,
    };
  }

  const languageInstruction = isSpanish
    ? "IMPORTANT: Write your thoughtSummary and thinkingSteps in Spanish. Use standard international SAN chess notation for moves (e.g. Nf6, exd5, O-O)."
    : "Write your thoughtSummary and thinkingSteps in English. Use standard SAN chess notation for moves.";

  const prompt = `You are playing Black in a chess game, playing at approximately ${botElo} Elo strength.
Difficulty style: ${band.label}. ${band.guidance}
Current FEN: ${game.fen()}
Move history: ${game.history().join(" ") || "None"}
Legal SAN moves available: ${JSON.stringify(legal)}

${languageInstruction}
Deliberate step by step. Do NOT write generic summaries for the steps. Write the exact, full contents of each thinking step, detailing pieces, candidate lines, and tactical ideas.
Select one move from the legal moves list.
Return ONLY valid JSON with this exact schema:
{
  "thoughtSummary": "${
    isSpanish
      ? "Una explicación concisa de 1-2 oraciones en español para el jugador resumiendo la jugada elegida y el plan táctico general."
      : "A concise 1-2 sentence explanation in English for the player summarizing the chosen move and overall tactical plan."
  }",
  "thinkingSteps": [
    "${isSpanish ? "Paso 1: Análisis detallado del tablero, amenazas inmediatas del rival y casillas clave..." : "Step 1: Detailed analysis of the board position, opponent threats, and key squares..."}",
    "${isSpanish ? "Paso 2: Cálculo concreto de variantes tácticas comparando jugadas candidatas específicas..." : "Step 2: Concrete calculation of candidate moves and variations..."}",
    "${isSpanish ? "Paso 3: Justificación táctica de por qué la jugada elegida es superior..." : "Step 3: Tactical justification of why the chosen move is superior..."}"
  ],
  "move": "one exact legal SAN move from the list"
}`;

  const budget = thinkingBudgetForElo(botElo);
  let lastError = null;

  // Vertex AI valid progressive attempt configurations:
  // 1. Numeric thinkingBudget for thinking models
  // 2. Minimal thinkingBudget 0
  // 3. Standard JSON generation
  const configs = [
    { thinkingConfig: { thinkingBudget: budget } },
    { thinkingConfig: { thinkingBudget: 0 } },
    {},
  ];

  const modelsToTry = [chessModel, fallbackModel].filter(Boolean);

  for (const activeModel of modelsToTry) {
    for (let attempt = 0; attempt < configs.length; attempt += 1) {
      try {
        const requestPayload = {
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            ...configs[attempt],
          },
        };

        let result;
        const discoveredSignatures = [];
        let accumulatedThoughtText = "";
        let accumulatedResponseText = "";
        const reportedSteps = [];

        const emitStepIfNew = (stepText) => {
          const trimmed = stepText?.trim();
          if (trimmed && !reportedSteps.includes(trimmed)) {
            const nextIndex = reportedSteps.length;
            reportedSteps.push(trimmed);
            onThoughtStep?.(trimmed, nextIndex, {
              signatures: [...discoveredSignatures],
              total: reportedSteps.length,
            });
          }
        };

        if (typeof activeModel?.generateContentStream === "function") {
          try {
            const streamResult = await activeModel.generateContentStream(requestPayload);
            for await (const chunk of streamResult.stream) {
              const cand = chunk?.candidates?.[0];
              const candSig = cand?.thoughtSignature || cand?.thought_signature;
              if (candSig && !discoveredSignatures.includes(candSig)) {
                discoveredSignatures.push(candSig);
              }
              const parts = cand?.content?.parts || [];
              for (const part of parts) {
                const sig = part.thoughtSignature || part.thought_signature;
                if (sig && !discoveredSignatures.includes(sig)) {
                  discoveredSignatures.push(sig);
                }
                if (part.thought) {
                  const text = typeof part.thought === "string" ? part.thought : part.text;
                  if (text && text.trim()) {
                    accumulatedThoughtText += text;
                    const parsedSteps = splitIntoThoughtSteps(accumulatedThoughtText);
                    for (const s of parsedSteps) {
                      emitStepIfNew(s);
                    }
                  }
                } else if (part.text) {
                  accumulatedResponseText += part.text;
                  // Detect steps live from streaming JSON thinkingSteps array
                  const stepMatches = accumulatedResponseText.match(/"thinkingSteps"\s*:\s*\[([\s\S]*?)\]/);
                  if (stepMatches && stepMatches[1]) {
                    const stringMatches = [...stepMatches[1].matchAll(/"((?:[^"\\]|\\.)+)"/g)];
                    for (const m of stringMatches) {
                      try {
                        emitStepIfNew(JSON.parse(`"${m[1]}"`));
                      } catch {
                        emitStepIfNew(m[1]);
                      }
                    }
                  }
                }
              }
            }
            result = await streamResult.response;
          } catch (streamErr) {
            console.warn("generateContentStream fallback to generateContent:", streamErr);
            result = await activeModel.generateContent(requestPayload);
          }
        } else {
          result = await activeModel.generateContent(requestPayload);
        }

        const parsedOutput = parseModelResponse(result, legal, userLanguage);
        if (reportedSteps.length > 0 && parsedOutput.thoughts.length === 0) {
          parsedOutput.thoughts = [...reportedSteps];
        }
        if (parsedOutput.thoughts.length === 0) {
          parsedOutput.thoughts = generateDeliberationSteps(parsedOutput.move, {
            botElo,
            userLanguage,
            game,
          });
        }
        for (const sig of discoveredSignatures) {
          if (!parsedOutput.thoughtSignatures.includes(sig)) {
            parsedOutput.thoughtSignatures.push(sig);
          }
        }
        if (!parsedOutput.thoughtSignature && parsedOutput.thoughtSignatures[0]) {
          parsedOutput.thoughtSignature = parsedOutput.thoughtSignatures[0];
        }

        // Emit steps for test runners or fallback if none were emitted during stream
        if (reportedSteps.length === 0 && parsedOutput.thoughts.length > 0) {
          if (typeof stepDelayMs === "number") {
            for (let i = 0; i < parsedOutput.thoughts.length; i += 1) {
              onThoughtStep?.(parsedOutput.thoughts[i], i, {
                signatures: parsedOutput.thoughtSignatures,
                total: parsedOutput.thoughts.length,
              });
              if (stepDelayMs > 0 && i < parsedOutput.thoughts.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, stepDelayMs));
              }
            }
          } else {
            onThoughtStep?.(parsedOutput.thoughts[0], 0, {
              signatures: parsedOutput.thoughtSignatures,
              total: parsedOutput.thoughts.length,
            });
          }
        }

        return parsedOutput;
      } catch (err) {
        lastError = err;
        console.warn(`Gemini chess turn attempt with config #${attempt + 1} retry:`, err);
      }
    }
  }

  console.error("All Gemini move attempts failed:", lastError);
  const fallbackMove = legal[Math.floor(Math.random() * legal.length)];
  const fallbackThought = isSpanish
    ? `Cálculo táctico: jugando ${fallbackMove}.`
    : `Tactical calculation: playing ${fallbackMove}.`;
  const fallbackSteps = generateDeliberationSteps(fallbackMove, {
    botElo,
    userLanguage,
    game,
  });
  onThoughtStep?.(fallbackSteps[0] || fallbackThought, 0, { signatures: [], total: fallbackSteps.length });

  return {
    move: fallbackMove,
    thought: fallbackThought,
    thoughtSummary: fallbackThought,
    thoughts: fallbackSteps,
    thoughtSignatures: [],
    thoughtSignature: null,
  };
}
