import React, { useId, useState } from "react";
import "./courseVisualPreview.css";

const copy = {
  en: {
    loop: "Follow the loop",
    start: "Start",
    initial: "Initial value",
    iteration: (step) => `Iteration ${step} of 3`,
    next: "Next iteration",
    complete: "Loop complete",
    reset: "Reset",
    steps: "Choose a loop step",
    boundary: "Test the boundary",
    age: "Age",
    years: "years",
    bug: "Original condition",
    fix: "Corrected condition",
    allowed: "Allowed",
    denied: "Not allowed",
    hint: "Move the slider to test another age.",
  },
  es: {
    loop: "Sigue el bucle",
    start: "Inicio",
    initial: "Valor inicial",
    iteration: (step) => `Iteración ${step} de 3`,
    next: "Siguiente iteración",
    complete: "Bucle completo",
    reset: "Reiniciar",
    steps: "Elige un paso del bucle",
    boundary: "Prueba el límite",
    age: "Edad",
    years: "años",
    bug: "Condición original",
    fix: "Condición corregida",
    allowed: "Permitido",
    denied: "No permitido",
    hint: "Mueve el control para probar otra edad.",
  },
};

function PreviewIcon({ reset = false }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={reset ? "M3 10a9 9 0 1 1 2 8M3 4v6h6" : "M5 12h14m-6-6 6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LoopTraceVisualization({ language = "en" }) {
  const [step, setStep] = useState(0);
  const text = copy[language] || copy.en;
  const variable = language === "es" ? "conteo" : "count";
  const value = 2 ** step;
  const complete = step === 3;

  return (
    <section
      className="course-visual course-visual--loop"
      aria-label={text.loop}
    >
      <header className="course-visual-header">
        <span className="course-visual-eyebrow">{text.loop}</span>
        <span className="course-visual-progress">
          {step}
          <span> / 3</span>
        </span>
      </header>
      <div className="course-visual-steps" role="group" aria-label={text.steps}>
        {[0, 1, 2, 3].map((index) => (
          <button
            type="button"
            key={index}
            aria-pressed={step === index}
            data-completed={index < step}
            onClick={() => setStep(index)}
          >
            <span className="course-visual-marker" aria-hidden="true">
              {index < step ? "✓" : index + 1}
            </span>
            <span>{index === 0 ? text.start : `i = ${index - 1}`}</span>
          </button>
        ))}
      </div>
      <div
        className="course-visual-state"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="course-visual-value">
          <code>{variable}</code>
          <strong>{value}</strong>
        </div>
        <div className="course-visual-calculation">
          <span>{step === 0 ? text.initial : text.iteration(step)}</span>
          <code>
            {step === 0
              ? `${variable} = 1`
              : `${2 ** (step - 1)} × 2 → ${value}`}
          </code>
        </div>
      </div>
      <footer className="course-visual-controls">
        <button
          type="button"
          className="course-visual-next"
          disabled={complete}
          onClick={() => setStep((current) => Math.min(3, current + 1))}
        >
          {complete ? text.complete : text.next}
          {!complete && <PreviewIcon />}
        </button>
        <button
          type="button"
          className="course-visual-reset"
          onClick={() => setStep(0)}
        >
          <PreviewIcon reset />
          {text.reset}
        </button>
      </footer>
    </section>
  );
}

export function AgeBoundaryVisualization({ language = "en" }) {
  const [age, setAge] = useState(21);
  const id = useId();
  const text = copy[language] || copy.en;
  const variable = language === "es" ? "edad" : "age";

  return (
    <section
      className="course-visual course-visual--age"
      aria-label={text.boundary}
    >
      <header className="course-visual-header">
        <span className="course-visual-eyebrow">{text.boundary}</span>
        <span className="course-visual-age-value">
          {age}
          <span>{text.years}</span>
        </span>
      </header>
      <label className="course-visual-sr-only" htmlFor={id}>
        {text.age}
      </label>
      <input
        id={id}
        className="course-visual-range"
        type="range"
        min="18"
        max="24"
        value={age}
        style={{ "--range-progress": `${((age - 18) / 6) * 100}%` }}
        onChange={(event) => setAge(Number(event.target.value))}
      />
      <div className="course-visual-range-labels" aria-hidden="true">
        <span>18</span>
        <span>21</span>
        <span>24</span>
      </div>
      <div
        className="course-visual-comparison"
        aria-live="polite"
        aria-atomic="true"
      >
        {[
          { title: text.bug, condition: `${variable} > 21`, allowed: age > 21 },
          {
            title: text.fix,
            condition: `${variable} >= 21`,
            allowed: age >= 21,
          },
        ].map((item) => (
          <div
            className="course-visual-outcome"
            key={item.title}
            data-allowed={item.allowed}
          >
            <span>{item.title}</span>
            <code>{item.condition}</code>
            <strong>
              <i aria-hidden="true" />
              {item.allowed ? text.allowed : text.denied}
            </strong>
          </div>
        ))}
      </div>
      <p className="course-visual-hint">{text.hint}</p>
    </section>
  );
}
