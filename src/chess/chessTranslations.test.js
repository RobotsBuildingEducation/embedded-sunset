import test from "node:test";
import assert from "node:assert/strict";
import { chessTranslations, translate } from "./chessTranslations.js";
import { difficultyFor, formatElo } from "./chessDifficulty.js";
import { parseModelResponse } from "./chessBot.js";

test("chessTranslations has comprehensive English and Spanish dictionaries", () => {
  assert.ok(chessTranslations.en, "en dictionary exists");
  assert.ok(chessTranslations.es, "es dictionary exists");

  const enKeys = Object.keys(chessTranslations.en);
  const esKeys = Object.keys(chessTranslations.es);

  // Every English key should have a corresponding Spanish key
  for (const key of enKeys) {
    assert.ok(
      key in chessTranslations.es,
      `Key '${key}' should exist in Spanish translations`,
    );
  }

  assert.equal(enKeys.length, esKeys.length);
});

test("translate helper retrieves localized strings and formats dynamic values", () => {
  assert.equal(translate("en", "hero.title"), "Chess, in color");
  assert.equal(translate("es", "hero.title"), "Ajedrez, a color");

  assert.equal(translate("en", "header.back"), "Back to learning");
  assert.equal(translate("es", "header.back"), "Volver al aprendizaje");

  assert.equal(translate("en", "action.playBotTitle"), "Play bot");
  assert.equal(translate("es", "action.playBotTitle"), "Jugar contra bot");

  assert.equal(
    translate("en", "action.playBot", "1,500"),
    "Play bot (1,500 ELO)",
  );
  assert.equal(
    translate("es", "action.playBot", "1.500"),
    "Jugar contra bot (1.500 ELO)",
  );

  assert.equal(
    translate("es", "thought.viewChainSteps", 3),
    "Ver cadena de razonamiento (3 pasos)",
  );
});

test("difficultyFor returns localized band information in Spanish and English", () => {
  const enBand = difficultyFor(1500, "en");
  assert.equal(enBand.label, "Club practice");
  assert.equal(enBand.tagline, "Your everyday thinking game.");

  const esBand = difficultyFor(1500, "es");
  assert.equal(esBand.label, "Práctica de club");
  assert.equal(esBand.tagline, "Tu partida de reflexión cotidiana.");
  assert.ok(esBand.description.includes("rival equilibrado"));
  assert.ok(esBand.focus.includes("ataques dobles"));

  const esBeginner = difficultyFor(600, "es");
  assert.equal(esBeginner.label, "Primeros movimientos");

  const esMaster = difficultyFor(2400, "es");
  assert.equal(esMaster.label, "Máximo reto");
});

test("formatElo formats numbers by locale", () => {
  assert.equal(formatElo(1500, "en"), "1,500");
  assert.ok(
    formatElo(1500, "es") === "1.500" || formatElo(1500, "es") === "1 500" || formatElo(1500, "es") === "1500",
  );
});

test("parseModelResponse supports Spanish thought summaries", () => {
  const mockResult = {
    response: {
      candidates: [
        {
          thoughtSignature: "sig_es_test_abc123",
          content: {
            parts: [
              {
                thought: "Paso 1: Analizar la estructura de peones centrales.\nPaso 2: Desarrollar el caballo a f6 protegiendo e4.",
              },
              {
                text: JSON.stringify({
                  thoughtSummary: "Desarrollando caballo para controlar casillas centrales d5 y e4.",
                  move: "Nf6",
                }),
              },
            ],
          },
        },
      ],
    },
  };

  const parsed = parseModelResponse(mockResult, ["Nf6", "e5"], "es");
  assert.equal(parsed.move, "Nf6");
  assert.equal(
    parsed.thoughtSummary,
    "Desarrollando caballo para controlar casillas centrales d5 y e4.",
  );
  assert.equal(parsed.thoughts.length, 2);
  assert.ok(parsed.thoughts[0].includes("Paso 1"));
  assert.equal(parsed.thoughtSignatures.length, 1);
  assert.equal(parsed.thoughtSignature, "sig_es_test_abc123");
});
