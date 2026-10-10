import React, { useEffect, useMemo, useRef, useState } from "react";
import Prism from "prismjs/components/prism-core";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import { LinksPageLink, PrivacyPolicyLink } from "../PrivacyPolicy.jsx";
import MultipleChoiceQuestion from "../MultipleChoice/MultipleChoice.jsx";
import LiveReactEditorModal from "../LiveCodeEditor/LiveCodeEditor.jsx";
import { steps as courseSteps } from "../../utility/content.jsx";
import BottomActionBar from "../BottomActionBar/BottomActionBar.jsx";
import { useGeminiGradingChatCompletion } from "../../hooks/useGeminiChat.jsx";
import {
  buildObjectiveGradingPrompt,
  parseObjectiveGrade,
} from "../../utility/objectiveGrading.js";
import { translation } from "../../utility/translation.jsx";
import { soundManager } from "../../utility/soundManager.js";
import { triggerHaptic } from "tactus";
import { useSurfaceModalStore } from "../../useSurfaceModalStore.jsx";
import {
  getInstantSurfacePressProps,
  runImmediateSurfaceUpdate,
} from "../../utility/instantSurface.js";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from "@chakra-ui/react";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiCheck,
  FiCode,
  FiBookOpen,
} from "react-icons/fi";
import { isNsecSecretKey } from "../../utils/nostrKeyInput.js";
import { landingCopy } from "./landingCopy.js";
import BitcoinScholarshipGraphic from "./BitcoinScholarshipGraphic.jsx";
import WhyLearnSection from "./WhyLearnSection.jsx";
import {
  doc,
  getDocFromServer,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { database } from "../../database/firebaseResources.jsx";
import {
  buildReadingListDemoData,
  getReadingListDemoId,
  getSavedReadingList,
} from "../../utility/readingListDemo.js";
import "./landing.css";

const DEMO_PREVIEW_NAMES = {
  trace: "LoopTracePreview",
  debug: "AgeBoundaryPreview",
};
const EMPTY_DEMO_GRADE = {
  isCorrect: null,
  feedback: "",
  grade: "",
  isSending: false,
};
const PROJECT_CODE = [
  '<section class="reading-list">\n  <h1>My reading list</h1>\n  <ul>\n    <li>A book to read</li>\n    <li>An article for later</li>\n  </ul>\n</section>',
  'function Book() {\n  const [read, setRead] =\n    React.useState(false);\n\n  return (\n    <label>\n      <input type="checkbox"\n        checked={read}\n        onChange={() => setRead(!read)}\n      />\n      A book to read\n    </label>\n  );\n}',
  'async function saveBook(book) {\n  await setDoc(\n    doc(database, "books", book.id),\n    {\n      title: book.title,\n      read: book.read\n    }\n  );\n}',
];

function CodeSample({ code, language = "javascript" }) {
  const lines = useMemo(() => {
    const grammar = Prism.languages[language];
    const environment = {
      code,
      grammar,
      language,
      tokens: Prism.tokenize(code, grammar),
    };
    Prism.hooks.run("after-tokenize", environment);
    const highlightedLines = [[]];
    // Split token contents after parsing so multiline JSX keeps its syntax colors.
    const appendTokens = (tokens, classes = []) => {
      for (const token of Array.isArray(tokens) ? tokens : [tokens]) {
        if (typeof token !== "string") {
          appendTokens(token.content, [
            ...classes,
            token.type,
            ...(token.alias ? [token.alias].flat() : []),
          ]);
          continue;
        }
        token.split("\n").forEach((part, index) => {
          if (index > 0) highlightedLines.push([]);
          const line = highlightedLines[highlightedLines.length - 1];
          if (part) {
            line.push(
              classes.length ? (
                <span
                  className={`lp-syntax ${classes.join(" ")}`}
                  key={line.length}
                >
                  {part}
                </span>
              ) : (
                part
              ),
            );
          }
        });
      }
    };
    appendTokens(environment.tokens);
    return highlightedLines;
  }, [code, language]);
  return (
    <pre className="lp-code">
      <code>
        {lines.map((line, index) => (
          <span className="lp-code-line" key={index}>
            <span className="lp-line-number" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>
              {line.length ? line : " "}
              {index < lines.length - 1 ? "\n" : ""}
            </span>
          </span>
        ))}
      </code>
    </pre>
  );
}

function ExerciseDemo({ copy, userLanguage }) {
  const [mode, setMode] = useState("trace");
  const [answer, setAnswer] = useState(null);
  const [result, setResult] = useState(EMPTY_DEMO_GRADE);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [lockoutExpiresAt, setLockoutExpiresAt] = useState(null);
  const [completed, setCompleted] = useState({ trace: false, debug: false });
  const [streak, setStreak] = useState(0);
  const requestRef = useRef({ version: 0, pending: false });
  const nextPressRef = useRef({});
  const {
    submitPrompt: submitGradingPrompt,
    resetMessages: resetGradingMessages,
  } = useGeminiGradingChatCompletion();
  const openLearnModal = useSurfaceModalStore((state) => state.openLearnModal);
  const isTrace = mode === "trace";
  const courseStep = useMemo(
    () =>
      courseSteps[userLanguage === "es" ? "es" : "en"].find((step) =>
        step.question?.previewCode?.startsWith(
          `function ${DEMO_PREVIEW_NAMES[mode]}()`,
        ),
      ),
    [mode, userLanguage],
  );
  const ageVariable = userLanguage === "es" ? "edad" : "age";
  const options = isTrace
    ? courseStep.question.options
    : [
        `${ageVariable} > 21`,
        `${ageVariable} >= 21`,
        `${ageVariable} === 21`,
      ];
  const demoStep = {
    group: "1",
    title: isTrace ? copy.trace : copy.debug,
    isCodeTracing: isTrace,
    isMultipleChoice: !isTrace,
    question: {
      questionText: isTrace ? copy.traceQuestion : copy.debugQuestion,
      code: courseStep.question.code || courseStep.question.starterCode,
      previewCode: courseStep.question.previewCode,
      options,
      answer: isTrace ? courseStep.question.answer : `${ageVariable} >= 21`,
    },
  };
  useEffect(() => {
    setAnswer(null);
    setResult(EMPTY_DEMO_GRADE);
    return () => {
      requestRef.current.version += 1;
      requestRef.current.pending = false;
      resetGradingMessages();
    };
  }, [userLanguage, resetGradingMessages]);

  const changeMode = (next) => {
    requestRef.current.version += 1;
    requestRef.current.pending = false;
    resetGradingMessages();
    setMode(next);
    setAnswer(null);
    setResult(EMPTY_DEMO_GRADE);
  };
  const handleSubmit = async () => {
    if (
      answer === null ||
      requestRef.current.pending ||
      result.isCorrect ||
      lockoutExpiresAt
    )
      return;
    const version = ++requestRef.current.version;
    requestRef.current.pending = true;
    resetGradingMessages();
    setResult({ ...EMPTY_DEMO_GRADE, isSending: true });
    try {
      const content = await submitGradingPrompt([
        {
          role: "user",
          content: buildObjectiveGradingPrompt(demoStep, answer, userLanguage),
        },
      ]);
      if (version !== requestRef.current.version) return;
      const grade = parseObjectiveGrade(content);
      setResult({ ...grade, isSending: false });
      soundManager.play(grade.isCorrect ? "correct" : "incorrect");
      if (grade.isCorrect) {
        setCompleted((previous) => ({ ...previous, [mode]: true }));
        setIncorrectAttempts(0);
        setStreak((previous) => previous + 1);
      } else {
        setStreak(0);
        const attempts = incorrectAttempts + 1;
        setIncorrectAttempts(attempts);
        if (attempts >= 5) setLockoutExpiresAt(Date.now() + 15 * 60 * 1000);
      }
    } catch (error) {
      if (version !== requestRef.current.version) return;
      console.error("Unable to grade the sample question", error);
      setResult({ ...EMPTY_DEMO_GRADE, feedback: copy.gradingError });
    } finally {
      if (version === requestRef.current.version)
        requestRef.current.pending = false;
    }
  };
  const nextPress = getInstantSurfacePressProps(
    nextPressRef,
    "demo-next",
    () => {
      triggerHaptic();
      soundManager.resume();
      soundManager.play("next");
      changeMode(isTrace ? "debug" : "trace");
    },
  );
  const completedCount = Object.values(completed).filter(Boolean).length;
  const demoTranslation = {
    ...translation,
    [userLanguage]: {
      ...translation[userLanguage],
      "app.button.answer": copy.submit,
    },
  };
  return (
    <div className="lp-exercise">
      <div className="lp-demo-tabs" role="group" aria-label={copy.demoLabel}>
        {["trace", "debug"].map((tab) => (
          <button
            type="button"
            key={tab}
            aria-pressed={mode === tab}
            disabled={Boolean(lockoutExpiresAt)}
            onClick={() => changeMode(tab)}
          >
            {copy[tab]}
          </button>
        ))}
      </div>
      <div className="lp-exercise-body">
        <p className="lp-question">{demoStep.question.questionText}</p>
        <div className="lp-demo-preview">
          <LiveReactEditorModal
            key={`${mode}-${userLanguage}`}
            code={demoStep.question.previewCode}
            mode="preview"
            autoRun={true}
            hideRunButton={true}
            previewHeight="auto"
          />
        </div>
        <CodeSample code={demoStep.question.code} />
        <div
          className="lp-answers"
          role="group"
          aria-label={demoStep.question.questionText}
        >
          <MultipleChoiceQuestion
            key={mode}
            question={demoStep.question}
            selectedOption={answer}
            setSelectedOption={setAnswer}
            isDisabled={
              result.isSending ||
              result.isCorrect === true ||
              Boolean(lockoutExpiresAt)
            }
          />
        </div>
      </div>
      <div className="lp-demo-dock">
        <BottomActionBar
          embedded
          showMenu={false}
          currentStep={1}
          step={demoStep}
          userLanguage={userLanguage}
          translation={demoTranslation}
          isCorrect={result.isCorrect}
          feedback={result.feedback}
          grade={result.grade}
          isSending={result.isSending}
          submitDisabled={answer === null}
          incorrectAttempts={incorrectAttempts}
          lockoutExpiresAt={lockoutExpiresAt}
          isTimerExpired={lockoutExpiresAt === null}
          handleTimerExpire={() => {
            setLockoutExpiresAt(null);
            setIncorrectAttempts(0);
            setResult(EMPTY_DEMO_GRADE);
          }}
          animatedProgress={completedCount * 50}
          chapterMetricLabel={copy.demoLabel}
          metricTooltips={copy.demoMetrics}
          streak={streak}
          goalCount={completedCount === 2 ? 1 : 0}
          handleAnswerClick={handleSubmit}
          handleNextQuestionButtonPress={(event) => {
            if (event.type === "pointerdown") nextPress.onPointerDown(event);
            else nextPress.onClick(event);
          }}
          handleLearnClick={() =>
            runImmediateSurfaceUpdate(() => {
              openLearnModal({ step: demoStep, userLanguage });
            })
          }
          handleModalCheck={(action) => action()}
          triggerHaptic={triggerHaptic}
          soundManager={soundManager}
          playActionBarSound={(id) => {
            soundManager.resume();
            soundManager.play(id === "learn" ? "next" : id);
          }}
        />
      </div>
    </div>
  );
}

function CourseOutline({ chapters, copy }) {
  const [expandedLists, setExpandedLists] = useState({});
  return (
    <Accordion allowToggle defaultIndex={1} className="lp-curriculum">
      {chapters.map((chapter) => {
        const group = chapter.normalizedGroup;
        const isTutorial = group === "tutorial" || group === "0";
        const expanded = expandedLists[chapter.id];
        const questions = expanded
          ? chapter.questions
          : chapter.questions.slice(0, 4);
        return (
          <AccordionItem key={chapter.id} className="lp-chapter">
            <h3>
              <AccordionButton
                className="lp-chapter-button"
                _hover={{ bg: "transparent" }}
              >
                <span className="lp-chapter-number" aria-hidden="true">
                  {isTutorial ? "00" : String(group).padStart(2, "0")}
                </span>
                <span className="lp-chapter-heading">
                  <span className="lp-chapter-label">
                    {isTutorial ? copy.tutorial : `${copy.chapter} ${group}`}
                  </span>
                  <span className="lp-chapter-title">
                    {copy.chapterNames[group] || chapter.chapterLabel}
                  </span>
                </span>
                <span className="lp-chapter-count">
                  {chapter.questions.length}
                  <span> {copy.questions}</span>
                </span>
                <AccordionIcon />
              </AccordionButton>
            </h3>
            <AccordionPanel className="lp-chapter-content">
              <p>{copy.chapterDescriptions[group]}</p>
              <ul>
                {questions.map((question) => (
                  <li key={question.id}>
                    <FiCheck aria-hidden="true" />
                    <span>{question.title}</span>
                  </li>
                ))}
              </ul>
              {chapter.questions.length > 4 && (
                <button
                  type="button"
                  className="lp-text-button"
                  aria-expanded={Boolean(expanded)}
                  onClick={() =>
                    setExpandedLists((current) => ({
                      ...current,
                      [chapter.id]: !expanded,
                    }))
                  }
                >
                  {expanded
                    ? copy.fewerExercises
                    : `${copy.allExercises} (${chapter.questions.length})`}
                  <FiArrowRight aria-hidden="true" />
                </button>
              )}
            </AccordionPanel>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

function ProjectPreview({ copy }) {
  const [stage, setStage] = useState(0);
  const [readBooks, setReadBooks] = useState([false, false, false]);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const documentRef = useRef(null);
  const loadPromise = useRef(null);
  const hasLoaded = useRef(false);
  const pendingSave = useRef(null);
  const isSaving = useRef(false);
  const isDatabaseStage = stage === 2;

  useEffect(() => {
    if (!isDatabaseStage || hasLoaded.current) return;
    let active = true;
    setSaveStatus("loading");
    if (!loadPromise.current) {
      loadPromise.current = Promise.resolve().then(() => {
        documentRef.current = doc(
          database,
          "experiments",
          getReadingListDemoId(window.localStorage),
        );
        return getDocFromServer(documentRef.current);
      });
    }
    loadPromise.current.then(
      (snapshot) => {
        if (!active) return;
        const savedBooks = getSavedReadingList(snapshot.data());
        if (savedBooks) setReadBooks(savedBooks);
        hasLoaded.current = true;
        setSaveStatus(savedBooks ? "saved" : "ready");
      },
      () => {
        if (!active) return;
        loadPromise.current = null;
        setSaveStatus("load-error");
      },
    );
    return () => {
      active = false;
    };
  }, [isDatabaseStage, loadAttempt]);

  const saveBooks = async (books) => {
    if (isSaving.current) return;
    isSaving.current = true;
    pendingSave.current = books;
    setSaveStatus("saving");
    try {
      await setDoc(documentRef.current, {
        ...buildReadingListDemoData(copy.books, books),
        updatedAt: serverTimestamp(),
      });
      pendingSave.current = null;
      setSaveStatus("saved");
    } catch {
      setSaveStatus("save-error");
    } finally {
      isSaving.current = false;
    }
  };
  const toggleBook = (index) => {
    if (isSaving.current || (isDatabaseStage && !hasLoaded.current)) return;
    const next = readBooks.map((read, position) =>
      position === index ? !read : read,
    );
    setReadBooks(next);
    if (isDatabaseStage) void saveBooks(next);
    else setSaveStatus("ready");
  };
  const current = copy.stages[stage];
  const excerptLabel = `${current.tag} · ${copy.excerpt}`;
  const excerptComment =
    stage === 0 ? `<!-- ${excerptLabel} -->` : `// ${excerptLabel}`;
  return (
    <div className="lp-project-demo">
      <p className="lp-eyebrow">{copy.projectExample}</p>
      <div
        className="lp-project-stages"
        role="group"
        aria-label={copy.projectStage}
      >
        {copy.stages.map((item, index) => (
          <button
            type="button"
            aria-pressed={stage === index}
            key={item.tag}
            onClick={() => setStage(index)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {item.label}
          </button>
        ))}
      </div>
      <div className="lp-project-window">
        <div className="lp-project-source">
          <div className="lp-source-header">
            <FiCode aria-hidden="true" />
            <span>
              {stage === 0
                ? "index.html"
                : stage === 1
                  ? "ReadingList.jsx"
                  : "saveBook.js"}
            </span>
          </div>
          <CodeSample
            code={`${excerptComment}\n${PROJECT_CODE[stage]}`}
            language={
              stage === 0 ? "markup" : stage === 1 ? "jsx" : "javascript"
            }
          />
        </div>
        <div className="lp-project-result">
          <div className="lp-reading-list">
            <FiBookOpen className="lp-book-icon" aria-hidden="true" />
            <h3>{copy.readingList}</h3>
            <p>{copy.readingSubhead}</p>
            <ul>
              {copy.books.map((book, index) => (
                <li key={book}>
                  {stage === 0 ? (
                    <span className="lp-book-bullet" aria-hidden="true" />
                  ) : (
                    <input
                      type="checkbox"
                      aria-label={book}
                      checked={readBooks[index]}
                      disabled={
                        saveStatus === "saving" ||
                        (isDatabaseStage && !hasLoaded.current)
                      }
                      onChange={() => toggleBook(index)}
                    />
                  )}
                  <span
                    className={
                      stage > 0 && readBooks[index] ? "lp-book-read" : ""
                    }
                  >
                    {book}
                  </span>
                </li>
              ))}
            </ul>
            {stage > 0 && (
              <div className="lp-reading-progress">
                <span>
                  {readBooks.filter(Boolean).length} / 3 {copy.read}
                </span>
                <div>
                  <span
                    style={{
                      width: `${(readBooks.filter(Boolean).length / 3) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
            {isDatabaseStage && (
              <div
                className="lp-reading-save-status"
                role="status"
                aria-live="polite"
              >
                <span>{copy.readingSaveStatus[saveStatus]}</span>
                {(saveStatus === "load-error" ||
                  saveStatus === "save-error") && (
                  <button
                    type="button"
                    onClick={() => {
                      if (saveStatus === "load-error")
                        setLoadAttempt((attempt) => attempt + 1);
                      else if (pendingSave.current)
                        void saveBooks(pendingSave.current);
                    }}
                  >
                    {copy.retrySave}
                  </button>
                )}
              </div>
            )}
          </div>
          {stage < 2 && (
            <p className="lp-preview-note">
              {stage === 1 ? copy.localPreview : current.tag}
            </p>
          )}
        </div>
      </div>
      <div className="lp-stage-caption" aria-live="polite">
        <h3>{current.title}</h3>
        <p>{current.detail}</p>
      </div>
    </div>
  );
}

export default function LandingSections({
  userLanguage,
  chapters: allChapters,
  questionsAnswered,
  questionCountUnavailable,
  userName,
  setUserName,
  onCreateAccount,
  onSignIn,
  isCreatingAccount,
  errorMessage,
}) {
  const copy = landingCopy(userLanguage);
  const chapters = allChapters.filter(
    (chapter) =>
      chapter.normalizedGroup === "tutorial" ||
      /^\d+$/.test(chapter.normalizedGroup),
  );
  const formatNumber = (value) =>
    new Intl.NumberFormat(userLanguage === "es" ? "es-MX" : "en-US").format(
      value,
    );
  const secretKeyDetected = isNsecSecretKey(userName);
  const goal = 7500;
  const hasQuestionCount =
    Number.isSafeInteger(questionsAnswered) && questionsAnswered >= 0;
  const questionCountDisplay = hasQuestionCount
    ? formatNumber(questionsAnswered)
    : "—";
  return (
    <div className="landing-story">
      <section
        className="lp-container lp-practice lp-section"
        aria-labelledby="landing-practice-title"
      >
        <div className="lp-practice-copy">
          <p className="lp-eyebrow">{copy.practiceLabel}</p>
          <h2 id="landing-practice-title">{copy.practiceTitle}</h2>
          <p className="lp-intro">{copy.practiceIntro}</p>
          <ol className="lp-practice-steps">
            {copy.practiceSteps.map(([title, description], index) => (
              <li key={title}>
                <span className="lp-step-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <ExerciseDemo
            key={userLanguage}
            copy={copy}
            userLanguage={userLanguage}
          />
        </div>
      </section>

      <section
        className="lp-course-section"
        aria-labelledby="landing-course-title"
      >
        <div className="lp-container lp-course lp-section">
          <div>
            <p className="lp-eyebrow">{copy.courseLabel}</p>
            <h2 id="landing-course-title">{copy.courseTitle}</h2>
            <p className="lp-intro">{copy.courseIntro}</p>
          </div>
          <CourseOutline chapters={chapters} copy={copy} />
        </div>
      </section>

      <section
        className="lp-project-section"
        aria-labelledby="landing-project-title"
      >
        <div className="lp-container lp-section">
          <div className="lp-project-heading">
            <div>
              <p className="lp-eyebrow">{copy.projectLabel}</p>
              <h2 id="landing-project-title">{copy.projectTitle}</h2>
            </div>
            <div>
              <p className="lp-intro">{copy.projectIntro}</p>
              <p className="lp-project-note">{copy.projectNote}</p>
            </div>
          </div>
          <ProjectPreview copy={copy} />
        </div>
      </section>

      <WhyLearnSection copy={copy} userLanguage={userLanguage} />

      <section
        className="lp-container lp-community lp-section"
        aria-labelledby="landing-community-title"
      >
        <div>
          <p className="lp-eyebrow">{copy.communityLabel}</p>
          <h2 id="landing-community-title">{copy.communityTitle}</h2>
          <p className="lp-intro">{copy.communityIntro}</p>
          <p className="lp-community-team">{copy.communityTeam}</p>
        </div>
        <div className="lp-community-stats">
          <BitcoinScholarshipGraphic label={copy.bitcoinGraphicLabel} />
          <div className="lp-stat">
            <strong>{questionCountDisplay}</strong>
            <span>{copy.answered}</span>
            <span className="lp-count-status" role="status">
              {!hasQuestionCount &&
                (questionCountUnavailable
                  ? copy.countUnavailable
                  : copy.countLoading)}
            </span>
          </div>
          <div className="lp-stat">
            <strong>$12,000</strong>
            <span>{copy.scholarships}</span>
          </div>
          <div className="lp-goal">
            <div>
              <span>{copy.communityGoal}</span>
              <span>
                {questionCountDisplay} / {formatNumber(goal)}
              </span>
            </div>
            <div
              className="lp-goal-track"
              role="progressbar"
              aria-label={copy.communityGoal}
              aria-valuenow={
                hasQuestionCount ? Math.min(questionsAnswered, goal) : undefined
              }
              aria-valuemin={0}
              aria-valuemax={goal}
            >
              <span
                style={{
                  width: `${hasQuestionCount ? Math.min((questionsAnswered / goal) * 100, 100) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section
        className="lp-container lp-faq lp-section"
        aria-labelledby="landing-faq-title"
      >
        <div>
          <p className="lp-eyebrow">{copy.faqLabel}</p>
          <h2 id="landing-faq-title">{copy.faqTitle}</h2>
        </div>
        <Accordion allowMultiple className="lp-faq-list">
          {copy.faqs.map(([question, answer]) => (
            <AccordionItem key={question}>
              <h3>
                <AccordionButton _hover={{ bg: "transparent" }}>
                  <span>{question}</span>
                  <AccordionIcon />
                </AccordionButton>
              </h3>
              <AccordionPanel>
                <p>{answer}</p>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section
        className="lp-start-section"
        aria-labelledby="landing-start-title"
      >
        <div className="lp-container lp-start">
          <div>
            <p className="lp-eyebrow">{copy.startLabel}</p>
            <h2 id="landing-start-title">{copy.startTitle}</h2>
            <p className="lp-intro">{copy.startIntro}</p>
          </div>
          <div className="lp-start-form">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (
                  userName.trim().length >= 2 &&
                  !secretKeyDetected &&
                  !isCreatingAccount
                )
                  onCreateAccount();
              }}
            >
              <label htmlFor="landing-footer-username">{copy.username}</label>
              <div className="lp-form-fields">
                <input
                  id="landing-footer-username"
                  type="text"
                  autoComplete="nickname"
                  placeholder={copy.placeholder}
                  value={userName}
                  onChange={(event) => setUserName(event.target.value)}
                  aria-describedby={
                    secretKeyDetected ? "landing-footer-key-warning" : undefined
                  }
                />
                <button
                  type="submit"
                  className="lp-primary-button"
                  disabled={
                    userName.trim().length < 2 ||
                    secretKeyDetected ||
                    isCreatingAccount
                  }
                >
                  {copy.create}
                  <FiArrowRight aria-hidden="true" />
                </button>
              </div>
              {secretKeyDetected && (
                <p
                  id="landing-footer-key-warning"
                  className="lp-form-error"
                  role="alert"
                >
                  {copy.secretWarning}
                </p>
              )}
              {errorMessage && (
                <p className="lp-form-error" role="alert">
                  {errorMessage}
                </p>
              )}
            </form>
            <p className="lp-returning">
              {copy.returning}{" "}
              <button type="button" onClick={onSignIn}>
                {copy.signIn}
                <FiArrowUpRight aria-hidden="true" />
              </button>
            </p>
          </div>
        </div>
      </section>
      <footer className="lp-container lp-footer">
        <PrivacyPolicyLink language={userLanguage} />
        <LinksPageLink />
      </footer>
    </div>
  );
}
