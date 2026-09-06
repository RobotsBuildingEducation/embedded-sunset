/* eslint-disable react/prop-types -- Internal dialog receives the room's validated Elo and callbacks. */
import { useEffect, useRef, useState } from "react";
import { FiArrowRight, FiCpu, FiX } from "react-icons/fi";
import { difficulty, difficultyFor, formatElo } from "./chessDifficulty.js";
import { translate } from "./chessTranslations.js";

export default function ChessDifficultyDialog({
  elo,
  onClose,
  onSave,
  userLanguage = "en",
}) {
  const dialogRef = useRef(null);
  const sliderRef = useRef(null);
  const [selectedElo, setSelectedElo] = useState(elo);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const t = (key, ...args) => translate(userLanguage, key, ...args);
  const level = difficultyFor(selectedElo, userLanguage);
  const progress =
    ((selectedElo - difficulty.min) / (difficulty.max - difficulty.min)) * 100;

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    sliderRef.current.focus({ preventScroll: true });
    return () => dialog.close();
  }, []);

  async function save(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await onSave(selectedElo);
      onClose();
    } catch (reason) {
      setError(reason.message);
      setSaving(false);
    }
  }

  const presets = [
    { elo: 600, label: t("difficulty.presetStart") },
    { elo: 1500, label: t("difficulty.presetBalanced") },
    { elo: 2200, label: t("difficulty.presetChallenge") },
  ];

  return (
    <dialog
      ref={dialogRef}
      className="chess-difficulty-dialog"
      aria-labelledby="difficulty-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
      onClick={(event) => {
        if (event.target !== dialogRef.current || saving) return;
        const bounds = dialogRef.current.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onClose();
      }}
    >
      <form onSubmit={save}>
        <div className="chess-difficulty-top">
          <button
            type="button"
            className="chess-difficulty-close"
            aria-label={t("difficulty.close")}
            onClick={onClose}
            disabled={saving}
          >
            <FiX />
          </button>
        </div>
        <p className="chess-eyebrow">{t("difficulty.eyebrow")}</p>
        <h2 id="difficulty-title">
          {t("difficulty.title1")}
          <br />
          {t("difficulty.title2")}
        </h2>
        <p className="chess-difficulty-intro">{t("difficulty.intro")}</p>
        <div className="chess-difficulty-selection">
          <label htmlFor="chess-difficulty-slider">
            {t("difficulty.label")}
          </label>
          <output htmlFor="chess-difficulty-slider">
            {formatElo(selectedElo, userLanguage)}{" "}
            <span>{t("difficulty.eloTarget")}</span>
          </output>
        </div>
        <input
          id="chess-difficulty-slider"
          ref={sliderRef}
          className="chess-difficulty-slider"
          type="range"
          min={difficulty.min}
          max={difficulty.max}
          step={difficulty.step}
          value={selectedElo}
          disabled={saving}
          autoFocus
          style={{ "--difficulty-progress": `${progress}%` }}
          aria-valuetext={`${formatElo(selectedElo, userLanguage)} Elo, ${level.label}`}
          aria-describedby="difficulty-description"
          onChange={(event) => setSelectedElo(Number(event.target.value))}
        />
        <div className="chess-difficulty-scale">
          <span>
            {formatElo(difficulty.min, userLanguage)} · {t("difficulty.gentle")}
          </span>
          <span>
            {formatElo(difficulty.max, userLanguage)} ·{" "}
            {t("difficulty.demanding")}
          </span>
        </div>
        <div
          className="chess-difficulty-presets"
          aria-label={t("difficulty.eyebrow")}
        >
          {presets.map((preset) => (
            <button
              key={preset.elo}
              type="button"
              aria-pressed={selectedElo === preset.elo}
              onClick={() => setSelectedElo(preset.elo)}
              disabled={saving}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <section
          className="chess-difficulty-explanation"
          aria-live="polite"
          aria-atomic="true"
        >
          <div>
            <span className="chess-difficulty-level-icon">
              <FiCpu />
            </span>
            <div>
              <h3>{level.label}</h3>
              <p>{level.tagline}</p>
            </div>
          </div>
          <p id="difficulty-description">{level.description}</p>
          <p className="chess-difficulty-focus">
            <strong>{t("difficulty.goodPlaceToPractice")}</strong>
            {level.focus}
          </p>
        </section>
        <p className="chess-difficulty-note">{t("difficulty.disclaimer")}</p>
        {error && (
          <p className="chess-error" role="alert">
            {error}
          </p>
        )}
        <button
          className="chess-primary chess-difficulty-save"
          type="submit"
          disabled={saving}
        >
          {saving
            ? t("difficulty.saving")
            : t("difficulty.playAtElo", formatElo(selectedElo, userLanguage))}
          <FiArrowRight />
        </button>
        <p className="chess-difficulty-reassurance">
          {t("difficulty.reassurance")}
        </p>
      </form>
    </dialog>
  );
}
