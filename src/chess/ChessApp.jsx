import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  FiArrowUpRight,
  FiCheck,
  FiChevronDown,
  FiCopy,
  FiCpu,
  FiLayers,
  FiMoon,
  FiRefreshCw,
  FiSliders,
  FiSun,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
import { createGuestProfile, openChessRoom } from "./chessApi.js";
import { doc, setDoc } from "firebase/firestore";
import { getChessDatabase } from "./chessDatabase.js";
import { listenToChessRoom } from "./chessRoomListener.js";
import {
  applyLocalMove,
  gameFromMoves,
  sanitizeRoomForFirestore,
  squares,
  territoryFor,
} from "./chessLogic.js";
import { generateBotMove, splitIntoThoughtSteps } from "./chessBot.js";
import {
  chessModel,
  model as fallbackModel,
  ensureAppCheckReady,
} from "../database/firebaseResources.jsx";
import ChessPiece from "./ChessPiece.jsx";
import ChessDifficultyDialog from "./ChessDifficultyDialog.jsx";
import { difficulty, difficultyFor, formatElo } from "./chessDifficulty.js";
import { getInitialUserLanguage } from "../utils/defaultLanguage.js";
import { getLocalThemeMode, persistThemeMode } from "../useThemeStore.jsx";
import { translate } from "./chessTranslations.js";
import "./chess.css";

function ChessRoom() {
  const { code } = useParams();
  const navigate = useNavigate();

  // Language & Theme State
  const [userLanguage, setUserLanguage] = useState(() =>
    getInitialUserLanguage(),
  );
  const [themeMode, setThemeMode] = useState(() => getLocalThemeMode());

  const t = useCallback(
    (key, ...args) => translate(userLanguage, key, ...args),
    [userLanguage],
  );

  const [room, setRoom] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [connectionError, setConnectionError] = useState("");
  const [listenerRetry, setListenerRetry] = useState(0);
  const [booting, setBooting] = useState(true);
  const [retry, setRetry] = useState(0);
  const [selected, setSelected] = useState(null);
  const [promotion, setPromotion] = useState(null);
  const [busy, setBusy] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [activeThinkingStep, setActiveThinkingStep] = useState("");
  const [activeThinkingStepIndex, setActiveThinkingStepIndex] = useState(0);
  const [botThought, setBotThought] = useState("");
  const [botThoughts, setBotThoughts] = useState([]);
  const [botThoughtSignature, setBotThoughtSignature] = useState("");
  const [botThoughtSignatures, setBotThoughtSignatures] = useState([]);
  const [chainOpen, setChainOpen] = useState(false);
  const [botRetry, setBotRetry] = useState(0);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [territoryVisible, setTerritoryVisible] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const [resignConfirm, setResignConfirm] = useState(false);
  const [difficultyOpen, setDifficultyOpen] = useState(false);
  const moveLock = useRef(false);
  const botAttempt = useRef("");
  const boardRef = useRef(null);
  const difficultyTriggerRef = useRef(null);
  const movesRef = useRef(null);

  // Sync title and html theme
  useEffect(() => {}, [userLanguage]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = themeMode;
      document.documentElement.dataset.themeMode = themeMode;
      document.documentElement.style.colorScheme = themeMode;
    }
  }, [themeMode]);

  const toggleLanguage = () => {
    const next = userLanguage === "es" ? "en" : "es";
    setUserLanguage(next);
    try {
      localStorage.setItem("userLanguage", next);
    } catch {}
  };

  const toggleTheme = () => {
    const next = themeMode === "dark" ? "light" : "dark";
    setThemeMode(next);
    persistThemeMode(next);
  };

  useEffect(() => {
    if (room?.lastBotThought && room.lastBotThought !== botThought) {
      setBotThought(room.lastBotThought);
    }
    if (
      room?.lastBotThoughtSignature &&
      room.lastBotThoughtSignature !== botThoughtSignature
    ) {
      setBotThoughtSignature(room.lastBotThoughtSignature);
    }
    if (room?.lastBotThoughts?.length) {
      setBotThoughts(room.lastBotThoughts);
    }
    if (room?.lastBotThoughtSignatures?.length) {
      setBotThoughtSignatures(room.lastBotThoughtSignatures);
    }
  }, [
    room?.lastBotThought,
    room?.lastBotThoughtSignature,
    room?.lastBotThoughts,
    room?.lastBotThoughtSignatures,
  ]);

  const game = useMemo(() => gameFromMoves(room?.moves), [room?.moves]);
  const botElo = room?.botElo ?? difficulty.defaultElo;
  const botLevel = difficultyFor(botElo, userLanguage);
  const roomReady = Boolean(room);
  const roomFinished = room?.status === "finished";
  const territory = useMemo(() => territoryFor(game), [game]);
  const color =
    profile?.npub === room?.white
      ? "w"
      : profile?.npub === room?.black
        ? "b"
        : room?.mode === "bot" && room?.black === "gemini"
          ? "w"
          : null;
  const blackAtBottom = (color === "b") !== flipped;
  const orderedSquares = blackAtBottom ? [...squares].reverse() : squares;
  const canMove =
    room?.status === "active" &&
    game.turn() === color &&
    !busy &&
    !thinking &&
    !difficultyOpen &&
    !connectionError;

  const destinations = useMemo(
    () =>
      new Set(
        selected
          ? game
              .moves({ square: selected, verbose: true })
              .map((move) => move.to)
          : [],
      ),
    [game, selected],
  );

  const counts = Object.values(territory).reduce(
    (acc, value) => ({ ...acc, [value]: (acc[value] || 0) + 1 }),
    {},
  );

  const displayThoughts = useMemo(() => {
    if (botThoughts && botThoughts.length > 0) return botThoughts;
    if (room?.lastBotThoughts && room.lastBotThoughts.length > 0)
      return room.lastBotThoughts;
    return [];
  }, [botThoughts, room?.lastBotThoughts]);

  const displaySignatures = useMemo(() => {
    if (botThoughtSignatures && botThoughtSignatures.length > 0)
      return botThoughtSignatures;
    if (room?.lastBotThoughtSignatures && room.lastBotThoughtSignatures.length > 0)
      return room.lastBotThoughtSignatures;
    if (botThoughtSignature) return [botThoughtSignature];
    if (room?.lastBotThoughtSignature) return [room.lastBotThoughtSignature];
    return [];
  }, [
    botThoughtSignatures,
    room?.lastBotThoughtSignatures,
    botThoughtSignature,
    room?.lastBotThoughtSignature,
  ]);

  const displayThought = botThought || room?.lastBotThought || "";

  const acceptRoom = useCallback((next) => {
    setRoom((current) => {
      if (!current || next.code !== current.code) return next;
      if (next.revision !== undefined && current.revision !== undefined) {
        if (next.revision !== current.revision) {
          return next.revision > current.revision ? next : current;
        }
      }
      return (next.updatedAt || 0) >= (current.updatedAt || 0) ? next : current;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setBooting(true);
    setError("");
    if (code && !/^[A-Za-z0-9]{6}$/.test(code)) {
      setError(t("error.invalidRoom"));
      setBooting(false);
      return;
    }
    openChessRoom(code)
      .then(({ profile: nextProfile, room: nextRoom }) => {
        if (cancelled) return;
        setProfile(nextProfile);
        acceptRoom(nextRoom);
        if (!code) navigate(`/chess/${nextRoom.code}`, { replace: true });
      })
      .catch((reason) => {
        if (!cancelled) setError(reason.message);
      })
      .finally(() => {
        if (!cancelled) setBooting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [code, retry, navigate, acceptRoom, t]);

  useEffect(() => {
    if (
      !code ||
      !profile ||
      !roomReady ||
      roomFinished ||
      room?.mode === "bot"
    ) {
      setConnectionError("");
      return;
    }
    const offline = () => setConnectionError(t("error.reconnecting"));
    const online = () => setConnectionError("");
    window.addEventListener("offline", offline);
    window.addEventListener("online", online);
    let unsubscribe;
    try {
      unsubscribe = listenToChessRoom(getChessDatabase(), code, {
        onRoom: acceptRoom,
        onConnection: (connected) =>
          connected ? setConnectionError("") : offline(),
        onError: (reason) =>
          setConnectionError(
            reason?.code === "permission-denied"
              ? t("error.permissionDenied")
              : t("error.liveInterrupted"),
          ),
      });
    } catch {
      setConnectionError(t("error.liveUnable"));
    }
    return () => {
      unsubscribe?.();
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", online);
    };
  }, [code, profile, roomReady, roomFinished, listenerRetry, acceptRoom, t]);

  useEffect(() => {
    setSelected(null);
    setPromotion(null);
    movesRef.current?.scrollTo({ top: movesRef.current.scrollHeight });
  }, [room?.moves.length]);

  useEffect(() => {
    if (
      room?.mode !== "bot" ||
      room.status !== "active" ||
      color !== "w" ||
      game.turn() !== "b"
    )
      return;
    const key = `${room.code}:${room.moves.length}:${botRetry}`;
    if (botAttempt.current === key) return;
    botAttempt.current = key;
    setThinking(true);
    const initialThinkingText = t(
      "thought.evaluating",
      formatElo(botElo, userLanguage),
    );
    setActiveThinkingStep(initialThinkingText);
    setActiveThinkingStepIndex(0);
    setBotThoughtSignatures([]);
    setBotThoughtSignature("");
    setChainOpen(false);
    setError("");

    const streamedSteps = [];
    ensureAppCheckReady()
      .catch(() => {})
      .then(() =>
        generateBotMove({
          game,
          botElo,
          chessModel,
          fallbackModel,
          userLanguage,
          onThoughtStep: (step, index, meta) => {
            if (step) {
              setActiveThinkingStep(step);
              setActiveThinkingStepIndex(index);
              if (!streamedSteps.includes(step)) {
                streamedSteps.push(step);
              }
            }
            if (meta?.signatures?.length) {
              setBotThoughtSignatures(meta.signatures);
              setBotThoughtSignature(meta.signatures[0]);
            }
          },
        }),
      )
      .then((result) => {
        if (!result?.move) {
          throw new Error(t("error.noLegalMove"));
        }
        const finalThoughts =
          result.thoughts && result.thoughts.length > 0
            ? result.thoughts
            : streamedSteps.length > 0
              ? [...streamedSteps]
              : [];
        const finalSignatures =
          result.thoughtSignatures && result.thoughtSignatures.length > 0
            ? result.thoughtSignatures
            : result.thoughtSignature
              ? [result.thoughtSignature]
              : [];

        if (result.thought) {
          setBotThought(result.thought);
        }
        setBotThoughts(finalThoughts);
        if (result.thoughtSignature || finalSignatures[0]) {
          setBotThoughtSignature(result.thoughtSignature || finalSignatures[0]);
        }
        setBotThoughtSignatures(finalSignatures);
        const next = applyLocalMove(room, result.move, {
          thoughtSummary: result.thought,
          thoughtSignature: result.thoughtSignature || finalSignatures[0],
          thoughts: finalThoughts,
          thoughtSignatures: finalSignatures,
        });
        acceptRoom(next);
      })
      .catch((reason) => {
        console.error("Bot turn error:", reason);
        setError(reason.message || t("error.botTurnFailed"));
      })
      .finally(() => {
        setThinking(false);
        setActiveThinkingStep("");
      });
  }, [
    room?.code,
    room?.mode,
    room?.status,
    room?.moves.length,
    color,
    game,
    botRetry,
    botElo,
    userLanguage,
    acceptRoom,
    t,
  ]);

  function handleStartBot() {
    if (!room) return;
    const next = {
      ...room,
      black: "gemini",
      blackName: "Gemini",
      mode: "bot",
      status: "active",
      updatedAt: Date.now(),
      revision: (room.revision || 0) + 1,
    };
    acceptRoom(next);
    try {
      setDoc(
        doc(getChessDatabase(), "chessRooms", room.code),
        sanitizeRoomForFirestore(next),
      ).catch(() => {});
    } catch {}
  }

  async function handleTestJoinBlack() {
    if (!room || room.status !== "waiting") return;
    const guest = createGuestProfile();
    setProfile(guest);
    const joined = {
      ...room,
      black: guest.npub,
      blackName: guest.name,
      mode: "human",
      status: "active",
      updatedAt: Date.now(),
      revision: (room.revision || 0) + 1,
    };
    acceptRoom(joined);
    try {
      await setDoc(
        doc(getChessDatabase(), "chessRooms", room.code),
        sanitizeRoomForFirestore(joined),
      );
    } catch (err) {
      console.warn("Error joining room as test black:", err);
    }
  }

  async function handleResign() {
    if (!room) return;
    const isWhite = color === "w";
    const resultText = isWhite
      ? "Black wins by resignation"
      : "White wins by resignation";
    const next = {
      ...room,
      status: "finished",
      result: resultText,
      updatedAt: Date.now(),
      revision: (room.revision || 0) + 1,
    };
    acceptRoom(next);
    setResignConfirm(false);
    if (room.mode !== "bot") {
      try {
        await setDoc(
          doc(getChessDatabase(), "chessRooms", room.code),
          sanitizeRoomForFirestore(next),
        );
      } catch (err) {
        console.warn("Could not save resignation to Firestore:", err);
      }
    }
  }

  async function submitMove(from, to, promote) {
    if (!canMove || moveLock.current) return;
    const options = game
      .moves({ square: from, verbose: true })
      .filter((move) => move.to === to);
    if (!options.length) return;
    if (options.some((move) => move.promotion) && !promote) {
      setPromotion({ from, to });
      return;
    }
    moveLock.current = true;
    setBusy(true);
    setError("");
    setPromotion(null);
    const moveInput = { from, to, ...(promote ? { promotion: promote } : {}) };
    if (room?.mode === "bot") {
      const next = applyLocalMove(room, moveInput);
      acceptRoom(next);
      setSelected(null);
      moveLock.current = false;
      setBusy(false);
      return;
    }
    try {
      const next = applyLocalMove(room, moveInput);
      acceptRoom(next);
      setSelected(null);
      await setDoc(
        doc(getChessDatabase(), "chessRooms", room.code),
        sanitizeRoomForFirestore(next),
      );
    } catch (reason) {
      console.error("Firestore move update error:", reason);
      setError(t("error.syncFailed"));
    } finally {
      moveLock.current = false;
      setBusy(false);
    }
  }

  function chooseSquare(square) {
    if (!canMove || promotion) return;
    if (selected && destinations.has(square)) {
      submitMove(selected, square);
      return;
    }
    setSelected(
      selected !== square && game.get(square)?.color === color ? square : null,
    );
  }

  async function copyInvite() {
    setInviteOpen(true);
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/chess/${room.code}`,
      );
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  let status = "";
  if (booting) {
    status = t("status.booting");
  } else if (!room) {
    status = t("status.ready");
  } else if (room.result) {
    if (room.result.includes("Black wins by resignation")) {
      status = t("status.whiteResign");
    } else if (room.result.includes("White wins by resignation")) {
      status = t("status.blackResign");
    } else {
      status = room.result;
    }
  } else if (room.status === "waiting") {
    status = t("status.waiting");
  } else if (thinking) {
    status = t("status.botThinking");
  } else {
    const turnText =
      game.turn() === "w" ? t("status.whiteTurn") : t("status.blackTurn");
    const checkText = game.isCheck() ? ` · ${t("status.check")}` : "";
    status = `${turnText}${checkText}`;
  }

  const playerLabel = (side) => {
    if (!room) return side === "w" ? t("player.you") : t("player.openSeat");
    const id = side === "w" ? room.white : room.black;
    return id === profile?.npub
      ? `${profile.name} ${t("player.youSuffix")}`
      : (side === "w" ? room.whiteName : room.blackName) ||
          t("player.openSeat");
  };

  const topColor = blackAtBottom ? "w" : "b";
  const bottomColor = blackAtBottom ? "b" : "w";
  const difficultyButton = room?.mode === "bot" && color === "w" && (
    <button
      className="chess-difficulty-trigger"
      ref={difficultyTriggerRef}
      aria-haspopup="dialog"
      onClick={() => setDifficultyOpen(true)}
      disabled={room.status !== "active" || busy}
    >
      <FiSliders /> {t("action.changeDifficulty")}
    </button>
  );

  return (
    <main className={`chess-page theme-${themeMode}`}>
      <header className="chess-header">
        <div className="chess-header-controls">
          <button
            type="button"
            className="chess-lang-btn"
            onClick={toggleLanguage}
            aria-label={t("header.langToggle")}
            title={
              userLanguage === "es" ? "Switch to English" : "Cambiar a Español"
            }
          >
            <span className={userLanguage === "en" ? "active" : ""}>EN</span>
            <span className="chess-control-divider">/</span>
            <span className={userLanguage === "es" ? "active" : ""}>ES</span>
          </button>
          <button
            type="button"
            className="chess-theme-btn"
            onClick={toggleTheme}
            aria-label={
              themeMode === "dark"
                ? t("header.themeLight")
                : t("header.themeDark")
            }
            title={
              themeMode === "dark"
                ? t("header.themeLight")
                : t("header.themeDark")
            }
          >
            {themeMode === "dark" ? <FiSun /> : <FiMoon />}
          </button>
        </div>
      </header>
      <div className="chess-shell">
        <div className="chess-heading">
          <p className="chess-intro">{t("hero.intro")}</p>
          <div className="chess-room-tag">
            <span className="chess-live-dot" /> {t("hero.room")}{" "}
            <strong>{room?.code || "······"}</strong>
          </div>
        </div>
        <div className="chess-layout">
          <section className="chess-game" aria-label="Chess game">
            <div className="chess-actions">
              <button
                className="chess-primary"
                onClick={copyInvite}
                disabled={!room || booting || room.mode === "bot"}
              >
                <FiUsers /> {t("action.invite")} <FiArrowUpRight />
              </button>
              <button
                className="chess-secondary chess-bot-btn"
                onClick={handleStartBot}
                disabled={
                  !room ||
                  booting ||
                  busy ||
                  room.status !== "waiting" ||
                  color !== "w"
                }
              >
                <FiCpu />
                <span className="chess-bot-btn-label">
                  <span className="chess-bot-btn-action">
                    {t("action.playBotTitle")}
                  </span>
                  <span className="chess-bot-btn-elo">
                    ({formatElo(botElo, userLanguage)} ELO)
                  </span>
                </span>
              </button>
            </div>
            {inviteOpen && (
              <div className="chess-invite">
                <label htmlFor="chess-invite-link">
                  {t("invite.shareHelp")}
                </label>
                <div>
                  <input
                    id="chess-invite-link"
                    readOnly
                    value={`${window.location.origin}/chess/${room.code}`}
                    onFocus={(event) => event.target.select()}
                  />
                  <button
                    onClick={copyInvite}
                    aria-label={t("invite.copyButtonAria")}
                  >
                    {copied ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>
                <small role="status">
                  {copied ? t("invite.copied") : t("invite.copyHelp")}
                </small>
                {room.status === "waiting" && room.white === profile?.npub && (
                  <button
                    type="button"
                    className="chess-secondary chess-test-join"
                    onClick={handleTestJoinBlack}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      marginTop: "0.6rem",
                      fontSize: "0.82rem",
                      padding: "0.4rem 0.75rem",
                    }}
                  >
                    <FiUserPlus /> {t("action.testJoinBlack")}
                  </button>
                )}
              </div>
            )}
            <div className="chess-player">
              <span className={`chess-avatar avatar-${topColor}`}>
                <ChessPiece type="k" color={topColor} />
              </span>
              <div>
                <strong>{playerLabel(topColor)}</strong>
                <small>
                  {topColor === "w"
                    ? t("player.whitePieces")
                    : room?.mode === "bot"
                      ? `${botLevel.label} · ~${formatElo(botElo, userLanguage)} Elo`
                      : t("player.blackPieces")}
                </small>
              </div>
              {topColor === "b" && difficultyButton}
              {room?.status === "active" && game.turn() === topColor && (
                <span className="chess-turn">
                  {thinking ? t("player.thinking") : t("player.toMove")}
                </span>
              )}
            </div>
            {room?.mode === "bot" && (thinking || displayThought) && (
              <div
                className={`chess-thought-card ${thinking ? "is-thinking" : displayThoughts.length > 0 ? "is-clickable" : ""} ${chainOpen ? "is-chain-open" : ""}`}
                role="region"
                aria-label="Gemini thought process"
                tabIndex={!thinking && displayThoughts.length > 0 ? 0 : undefined}
                onClick={() => {
                  if (!thinking && displayThoughts.length > 0) {
                    setChainOpen((prev) => !prev);
                  }
                }}
                onKeyDown={(e) => {
                  if (
                    !thinking &&
                    displayThoughts.length > 0 &&
                    (e.key === "Enter" || e.key === " ")
                  ) {
                    e.preventDefault();
                    setChainOpen((prev) => !prev);
                  }
                }}
              >
                <div className="chess-thought-header">
                  <span className="chess-thought-badge">
                    {thinking ? (
                      <>
                        <FiRefreshCw className="chess-spin" />{" "}
                        {activeThinkingStep
                          ? `${t("thought.thinking")} • ${t("thought.step", activeThinkingStepIndex + 1)}`
                          : t("thought.thinking")}
                      </>
                    ) : (
                      `💭 ${t("thought.title")}`
                    )}
                  </span>
                  <div className="chess-thought-meta">
                    {displaySignatures.length > 0 ? (
                      <span
                        className={`chess-thought-signature-badge ${thinking ? "pulsing is-live" : ""}`}
                        title={t("thought.signaturesBadgeTitle")}
                      >
                        ✓{" "}
                        {displaySignatures.length > 1
                          ? t(
                              "thought.signaturesCount",
                              displaySignatures.length,
                            )
                          : t("thought.signed")}
                      </span>
                    ) : null}
                    <span className="chess-thought-elo">
                      ~{formatElo(botElo, userLanguage)} Elo
                    </span>
                  </div>
                </div>
                <div className="chess-thought-body">
                  <p
                    key={
                      thinking
                        ? `step-${activeThinkingStepIndex}-${activeThinkingStep.slice(0, 16)}`
                        : "summary"
                    }
                    className={`chess-thought-text ${thinking ? "is-step is-thinking" : ""}`}
                  >
                    {thinking ? activeThinkingStep : displayThought}
                  </p>
                  {!thinking && displayThoughts.length > 0 && (
                    <button
                      type="button"
                      className="chess-thought-chain-toggle"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChainOpen(!chainOpen);
                      }}
                      aria-expanded={chainOpen}
                    >
                      <FiLayers />
                      <span>
                        {chainOpen
                          ? t("thought.hideChain")
                          : t("thought.viewChainSteps", displayThoughts.length)}
                      </span>
                      <FiChevronDown
                        className={`chess-chevron ${chainOpen ? "is-open" : ""}`}
                      />
                    </button>
                  )}
                  {!thinking && chainOpen && displayThoughts.length > 0 && (
                    <div
                      className="chess-thought-chain-drawer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="chess-thought-section">
                        <h4 className="chess-thought-section-title">
                          <FiLayers />
                          <span>{t("thought.chainHeading")}</span>
                        </h4>
                        <div className="chess-thought-steps">
                          {displayThoughts.map((step, idx) => (
                            <div key={idx} className="chess-thought-step">
                              <span className="chess-thought-step-badge">
                                {t("thought.step", idx + 1)}
                              </span>
                              <p>{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="chess-board-frame">
              <div
                className="chess-board"
                ref={boardRef}
                role="group"
                aria-label={`Chessboard, ${blackAtBottom ? "Black" : "White"} at bottom`}
              >
                {orderedSquares.map((square, index) => {
                  const piece = game.get(square);
                  const light =
                    (square.charCodeAt(0) + Number(square[1])) % 2 === 1;
                  const inCheck =
                    piece?.type === "k" &&
                    piece.color === game.turn() &&
                    game.isCheck();
                  const last =
                    room?.lastMove?.from === square ||
                    room?.lastMove?.to === square;
                  const land = territoryVisible ? territory[square] : "none";
                  const pieceLabel = piece
                    ? `${piece.color === "w" ? t("player.whitePieces") : t("player.blackPieces")} ${t("pieces." + piece.type)}`
                    : "";
                  return (
                    <button
                      key={square}
                      data-square={square}
                      className={`chess-square ${light ? "light" : "dark"} ${selected === square ? "selected" : ""} ${last ? "last-move" : ""} ${inCheck ? "in-check" : ""}`}
                      aria-label={`${square}${pieceLabel ? `, ${pieceLabel}` : ""}${destinations.has(square) ? ", legal move" : ""}`}
                      aria-pressed={selected === square}
                      onClick={() => chooseSquare(square)}
                      draggable={
                        canMove && piece?.color === color && !promotion
                      }
                      onDragStart={(event) => {
                        event.dataTransfer.setData("text/plain", square);
                        setSelected(square);
                      }}
                      onDragOver={(event) => {
                        if (canMove) event.preventDefault();
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        const from = event.dataTransfer.getData("text/plain");
                        if (/^[a-h][1-8]$/.test(from)) submitMove(from, square);
                      }}
                      onKeyDown={(event) => {
                        const offsets = {
                          ArrowLeft: -1,
                          ArrowRight: 1,
                          ArrowUp: -8,
                          ArrowDown: 8,
                        };
                        if (event.key in offsets) {
                          event.preventDefault();
                          boardRef.current?.children[
                            Math.max(
                              0,
                              Math.min(63, index + offsets[event.key]),
                            )
                          ]?.focus();
                        }
                      }}
                    >
                      <span className={`chess-territory territory-${land}`} />
                      {index % 8 === 0 && (
                        <span className="chess-rank">{square[1]}</span>
                      )}
                      {index >= 56 && (
                        <span className="chess-file">{square[0]}</span>
                      )}
                      {destinations.has(square) && (
                        <span
                          className={
                            piece ? "chess-capture-ring" : "chess-move-dot"
                          }
                        />
                      )}
                      {piece && (
                        <ChessPiece type={piece.type} color={piece.color} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            {promotion && (
              <section
                className="chess-promotion"
                aria-label={t("promotion.title")}
              >
                <strong>{t("promotion.title")}</strong>
                <div>
                  {["q", "r", "b", "n"].map((type) => (
                    <button
                      key={type}
                      aria-label={t("pieces." + type)}
                      onClick={() =>
                        submitMove(promotion.from, promotion.to, type)
                      }
                    >
                      <ChessPiece type={type} color={color} />
                    </button>
                  ))}
                  <button onClick={() => setPromotion(null)}>
                    {t("promotion.cancel")}
                  </button>
                </div>
              </section>
            )}
            <div className="chess-player">
              <span className={`chess-avatar avatar-${bottomColor}`}>
                <ChessPiece type="k" color={bottomColor} />
              </span>
              <div>
                <strong>{playerLabel(bottomColor)}</strong>
                <small>
                  {bottomColor === "w"
                    ? t("player.whitePieces")
                    : room?.mode === "bot"
                      ? `${botLevel.label} · ~${formatElo(botElo, userLanguage)} Elo`
                      : t("player.blackPieces")}
                  {room && !color ? ` · ${t("player.spectating")}` : ""}
                </small>
              </div>
              {bottomColor === "b" && difficultyButton}
              <button
                className="chess-flip"
                onClick={() => setFlipped(!flipped)}
                aria-label={t("action.flip")}
                title={t("action.flip")}
              >
                <FiRefreshCw />
              </button>
            </div>
            <div className="chess-status" role="status">
              <span
                className={
                  thinking || booting
                    ? "chess-live-dot pulsing"
                    : "chess-live-dot"
                }
              />
              {status}
            </div>
            {connectionError && (
              <p className="chess-error" role="alert">
                {connectionError}
                <button onClick={() => setListenerRetry((value) => value + 1)}>
                  {t("action.reconnect")}
                </button>
              </p>
            )}
            {error && (
              <div className="chess-error" role="alert">
                {error}
                <button
                  onClick={() => (!room ? setRetry(retry + 1) : setError(""))}
                >
                  {!room ? t("action.retryConnection") : t("action.dismiss")}
                </button>
              </div>
            )}
            {room?.mode === "bot" &&
              room.status === "active" &&
              game.turn() === "b" &&
              color === "w" &&
              !thinking && (
                <button
                  className="chess-secondary chess-retry"
                  onClick={() => setBotRetry(botRetry + 1)}
                >
                  {t("action.retryBot")}
                </button>
              )}
          </section>
          <aside className="chess-sidebar">
            <section className="chess-territory-card">
              <p className="chess-card-copy">{t("territory.copy")}</p>
              <div className="chess-legend">
                <div>
                  <span className="chess-swatch swatch-white" />
                  <div>
                    <strong>{t("territory.whiteReach")}</strong>
                    <small>{t("territory.possibleDestinations")}</small>
                  </div>
                  <span>{counts.white || 0}</span>
                </div>
                <div>
                  <span className="chess-swatch swatch-black" />
                  <div>
                    <strong>{t("territory.blackReach")}</strong>
                    <small>{t("territory.possibleDestinations")}</small>
                  </div>
                  <span>{counts.black || 0}</span>
                </div>
                <div>
                  <span className="chess-swatch swatch-overlap" />
                  <div>
                    <strong>{t("territory.overlap")}</strong>
                    <small>{t("territory.bothCanMove")}</small>
                  </div>
                  <span>{counts.overlap || 0}</span>
                </div>
              </div>
              <label className="chess-toggle">
                <span>{t("territory.toggleLabel")}</span>
                <input
                  type="checkbox"
                  checked={territoryVisible}
                  onChange={(event) =>
                    setTerritoryVisible(event.target.checked)
                  }
                />
                <span className="chess-toggle-track" />
              </label>
              <p className="chess-fine-print">{t("territory.finePrint")}</p>
            </section>
            <section className="chess-history-card">
              <div className="chess-card-heading">
                <h3>{t("history.title")}</h3>
                <span>
                  {Math.ceil((room?.moves.length || 0) / 2)
                    .toString()
                    .padStart(2, "0")}{" "}
                  {t("history.movesLabel")}
                </span>
              </div>
              <div className="chess-history" ref={movesRef}>
                {room?.moves.length ? (
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">{t("history.colWhite")}</th>
                        <th scope="col">{t("history.colBlack")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {room.moves
                        .filter((_, index) => index % 2 === 0)
                        .map((move, index) => (
                          <tr key={index}>
                            <th scope="row">{index + 1}.</th>
                            <td>{move}</td>
                            <td>{room.moves[index * 2 + 1] || "—"}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="chess-history-empty">
                    <span>↗</span>
                    <p>
                      {t("history.empty1")}
                      <br />
                      {t("history.empty2")}
                    </p>
                  </div>
                )}
              </div>
            </section>
            <div className="chess-room-controls">
              <a href="/chess">
                {t("action.newGame")} <FiArrowUpRight />
              </a>
              {room?.status === "active" && color && (
                <button onClick={() => setResignConfirm(!resignConfirm)}>
                  {t("action.resign")}
                </button>
              )}
            </div>
            {resignConfirm && (
              <div className="chess-resign">
                <p>{t("action.confirmResignTitle")}</p>
                <button onClick={handleResign} disabled={busy}>
                  {t("action.confirmResignYes")}
                </button>
                <button onClick={() => setResignConfirm(false)}>
                  {t("action.confirmResignCancel")}
                </button>
              </div>
            )}
            {room?.mode === "bot" && (
              <p className="chess-sidebar-note">
                {t("history.botNote", formatElo(botElo, userLanguage))}
              </p>
            )}
          </aside>
        </div>
      </div>
      {difficultyOpen && (
        <ChessDifficultyDialog
          elo={botElo}
          userLanguage={userLanguage}
          onClose={() => {
            setDifficultyOpen(false);
            requestAnimationFrame(() => difficultyTriggerRef.current?.focus());
          }}
          onSave={async (elo) => {
            if (!room) return;
            const next = {
              ...room,
              botElo: elo,
              updatedAt: Date.now(),
              revision: (room.revision || 0) + 1,
            };
            acceptRoom(next);
            try {
              setDoc(
                doc(getChessDatabase(), "chessRooms", room.code),
                sanitizeRoomForFirestore(next),
              ).catch(() => {});
            } catch {}
          }}
        />
      )}
    </main>
  );
}

export default function ChessApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/chess" element={<ChessRoom />} />
        <Route path="/chess/:code" element={<ChessRoom />} />
        <Route path="*" element={<Navigate to="/chess" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
