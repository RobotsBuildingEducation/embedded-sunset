/**
 * English and Spanish localization strings for the Chess module.
 */

export const chessTranslations = {
  en: {
    // Brand & Header
    "brand.tag": "THE PLAYGROUND",
    "header.back": "Back to learning",
    "header.themeLight": "Switch to light mode",
    "header.themeDark": "Switch to dark mode",
    "header.langEn": "English",
    "header.langEs": "Español",
    "header.langToggle": "Language",

    // Hero / Heading
    "hero.eyebrow": "A NEW WAY TO SEE THE GAME",
    "hero.title": "Chess, in color",
    "hero.intro": "See the possibilities. Find your next move.",
    "hero.room": "ROOM",

    // Actions
    "action.invite": "Invite player",
    "action.playBotTitle": "Play bot",
    "action.playBot": (elo) => `Play bot (${elo} ELO)`,
    "action.changeDifficulty": "Change difficulty level",
    "action.flip": "Flip board",
    "action.newGame": "New game",
    "action.resign": "Resign",
    "action.confirmResignTitle": "Resign and end this game?",
    "action.confirmResignYes": "Yes, resign",
    "action.confirmResignCancel": "Keep playing",
    "action.retryBot": "Retry Gemini’s turn",
    "action.reconnect": "Reconnect",
    "action.retryConnection": "Retry connection",
    "action.dismiss": "Dismiss",
    "action.testJoinBlack": "Testing locally? Join this tab as Black",

    // Invite Box
    "invite.shareHelp": "Share this link. Your friend will play Black.",
    "invite.copied": "Invite link copied.",
    "invite.copyHelp": "Select and copy the link to invite a friend.",
    "invite.copyButtonAria": "Copy invite link",

    // Players
    "player.you": "You",
    "player.youSuffix": "(you)",
    "player.openSeat": "Open seat",
    "player.whitePieces": "White pieces",
    "player.blackPieces": "Black pieces",
    "player.spectating": "Spectating",
    "player.thinking": "Thinking",
    "player.toMove": "To move",

    // Status
    "status.booting": "Setting up your room…",
    "status.ready": "Your board is ready",
    "status.waiting": "A good game starts with company.",
    "status.botThinking": "Gemini is thinking…",
    "status.whiteTurn": "White to move",
    "status.blackTurn": "Black to move",
    "status.check": "Check",
    "status.checkmate": "Checkmate",
    "status.stalemate": "Stalemate",
    "status.drawRepetition": "Draw by repetition",
    "status.drawFifty": "Draw by fifty-move rule",
    "status.whiteResign": "Black wins by resignation",
    "status.blackResign": "White wins by resignation",

    // Bot Thought Card & Signatures
    "thought.title": "Gemini’s Reasoning",
    "thought.thinking": "Thinking…",
    "thought.evaluating": (elo) =>
      `Evaluating candidate moves and calculating lines at ~${elo} Elo…`,
    "thought.signed": "Signed",
    "thought.signaturesCount": (n) => `${n} Signatures`,
    "thought.signaturesBadgeTitle":
      "Cryptographically signed by Gemini Thinking",
    "thought.hideChain": "Hide reasoning details",
    "thought.viewChainAndSignatures": (steps, sigs) =>
      `View chain of thoughts (${steps} steps) & signatures (${sigs})`,
    "thought.viewSignaturesOnly": (sigs) =>
      `View reasoning signatures (${sigs})`,
    "thought.viewChainSteps": (n) => `View thought summaries (${n} steps)`,
    "thought.viewChainDetails": "View chain of thoughts (details)",
    "thought.step": (n) => `Step ${n}`,
    "thought.chainHeading": "Thought summaries",
    "thought.signaturesHeading": "Cryptographic Reasoning Signatures",
    "thought.signaturesExplainer":
      "Opaque cryptographic proofs emitted by Gemini Thinking verifying that this move was produced through internal deliberation.",
    "thought.copySignature": "Copy signature",
    "thought.copiedSignature": "Copied!",

    // Pawn Promotion
    "promotion.title": "Promote your pawn",
    "promotion.cancel": "Cancel",
    "pieces.q": "Queen",
    "pieces.r": "Rook",
    "pieces.b": "Bishop",
    "pieces.n": "Knight",
    "pieces.p": "Pawn",
    "pieces.k": "King",

    // Territory Card
    "territory.eyebrow": "READ THE BOARD",
    "territory.title": "Every square has a story.",
    "territory.copy":
      "The colors reveal where each side can move. A little perspective for your next big idea.",
    "territory.whiteReach": "White’s reach",
    "territory.blackReach": "Black’s reach",
    "territory.overlap": "Common ground",
    "territory.possibleDestinations": "Possible destinations",
    "territory.bothCanMove": "Both sides can move here",
    "territory.toggleLabel": "Show territory",
    "territory.finePrint":
      "Reach shows legal destinations for each side as if it moved next. Pawn diagonals appear when a capture is available.",

    // History Card
    "history.title": "The game so far",
    "history.movesLabel": "MOVES",
    "history.colWhite": "White",
    "history.colBlack": "Black",
    "history.empty1": "A fresh board.",
    "history.empty2": "A world of possibilities.",
    "history.botNote": (elo) =>
      `Gemini aims for ~${elo} Elo play. Strength is approximate and unrated.`,
    "history.humanNote": "No clock. No rush. Just your next move.",

    // Footer
    "footer.line1": "LESS GUESSING. MORE SEEING.",
    "footer.line2": "A little play goes a long way.",

    // Difficulty Dialog
    "difficulty.eyebrow": "YOUR GAME, YOUR PACE",
    "difficulty.title1": "Find your kind",
    "difficulty.title2": "of challenge.",
    "difficulty.intro":
      "A gentle warm-up or a good brain stretch? Give Gemini a level that feels right for you.",
    "difficulty.label": "Gemini’s playing level",
    "difficulty.eloTarget": "ELO TARGET",
    "difficulty.gentle": "Gentle",
    "difficulty.demanding": "Demanding",
    "difficulty.presetStart": "Just starting",
    "difficulty.presetBalanced": "A balanced game",
    "difficulty.presetChallenge": "Challenge me",
    "difficulty.goodPlaceToPractice": "A good place to practice",
    "difficulty.disclaimer":
      "Elo is a guide to the challenge, not a measured rating. Gemini’s actual strength can vary. A move already in progress keeps its current level.",
    "difficulty.saving": "Saving your level…",
    "difficulty.playAtElo": (elo) => `Play at ${elo} Elo`,
    "difficulty.reassurance":
      "Applies to future turns. You can change it anytime.",
    "difficulty.close": "Close difficulty settings",

    // Errors
    "error.invalidRoom": "That room code is invalid. Start a new game below.",
    "error.reconnecting":
      "Reconnecting… Your game is saved. Moves will resume when connected.",
    "error.permissionDenied":
      "This room cannot be accessed right now. Please reconnect or start a new game.",
    "error.liveInterrupted":
      "Live updates were interrupted. Please reconnect to continue.",
    "error.liveUnable":
      "Unable to connect to live updates. Please reconnect to continue.",
    "error.syncFailed":
      "Unable to sync move to opponent. Check connection.",
    "error.botTurnFailed": "Gemini was unable to complete its turn.",
    "error.noLegalMove": "Gemini could not decide on a legal move.",
  },

  es: {
    // Brand & Header
    "brand.tag": "PATIO DE JUEGOS",
    "header.back": "Volver al aprendizaje",
    "header.themeLight": "Cambiar a modo claro",
    "header.themeDark": "Cambiar a modo oscuro",
    "header.langEn": "English",
    "header.langEs": "Español",
    "header.langToggle": "Idioma",

    // Hero / Heading
    "hero.eyebrow": "UNA NUEVA FORMA DE VER EL JUEGO",
    "hero.title": "Ajedrez, a color",
    "hero.intro": "Descubre las posibilidades. Encuentra tu siguiente jugada.",
    "hero.room": "SALA",

    // Actions
    "action.invite": "Invitar jugador",
    "action.playBotTitle": "Jugar contra bot",
    "action.playBot": (elo) => `Jugar contra bot (${elo} ELO)`,
    "action.changeDifficulty": "Cambiar dificultad",
    "action.flip": "Girar tablero",
    "action.newGame": "Nueva partida",
    "action.resign": "Rendirse",
    "action.confirmResignTitle": "¿Rendirte y terminar esta partida?",
    "action.confirmResignYes": "Sí, rendirme",
    "action.confirmResignCancel": "Seguir jugando",
    "action.retryBot": "Reintentar turno de Gemini",
    "action.reconnect": "Reconectar",
    "action.retryConnection": "Reintentar conexión",
    "action.dismiss": "Descartar",
    "action.testJoinBlack": "¿Probando localmente? Entrar como Negras",

    // Invite Box
    "invite.shareHelp": "Comparte este enlace. Tu rival jugará con negras.",
    "invite.copied": "Enlace de invitación copiado.",
    "invite.copyHelp": "Selecciona y copia el enlace para invitar a alguien.",
    "invite.copyButtonAria": "Copiar enlace de invitación",

    // Players
    "player.you": "Tú",
    "player.youSuffix": "(tú)",
    "player.openSeat": "Lugar disponible",
    "player.whitePieces": "Piezas blancas",
    "player.blackPieces": "Piezas negras",
    "player.spectating": "Espectador",
    "player.thinking": "Pensando",
    "player.toMove": "Por mover",

    // Status
    "status.booting": "Configurando tu sala…",
    "status.ready": "Tu tablero está listo",
    "status.waiting": "Una buena partida comienza con compañía.",
    "status.botThinking": "Gemini está pensando…",
    "status.whiteTurn": "Mueven blancas",
    "status.blackTurn": "Mueven negras",
    "status.check": "Jaque",
    "status.checkmate": "Jaque mate",
    "status.stalemate": "Tablas por ahogado",
    "status.drawRepetition": "Tablas por repetición",
    "status.drawFifty": "Tablas por la regla de 50 jugadas",
    "status.whiteResign": "Negras ganan por abandono",
    "status.blackResign": "Blancas ganan por abandono",

    // Bot Thought Card & Signatures
    "thought.title": "Razonamiento de Gemini",
    "thought.thinking": "Pensando…",
    "thought.evaluating": (elo) =>
      `Evaluando jugadas candidatas y calculando variantes a ~${elo} Elo…`,
    "thought.signed": "Firmado",
    "thought.signaturesCount": (n) => `${n} Firmas`,
    "thought.signaturesBadgeTitle":
      "Firmado criptográficamente por Gemini Thinking",
    "thought.hideChain": "Ocultar detalles de razonamiento",
    "thought.viewChainAndSignatures": (steps, sigs) =>
      `Ver cadena de razonamiento (${steps} pasos) y firmas (${sigs})`,
    "thought.viewSignaturesOnly": (sigs) =>
      `Ver firmas de razonamiento (${sigs})`,
    "thought.viewChainSteps": (n) =>
      `Ver resúmenes del razonamiento (${n} pasos)`,
    "thought.viewChainDetails": "Ver cadena de razonamiento (detalles)",
    "thought.step": (n) => `Paso ${n}`,
    "thought.chainHeading": "Resúmenes del razonamiento",
    "thought.signaturesHeading": "Firmas criptográficas de razonamiento",
    "thought.signaturesExplainer":
      "Pruebas criptográficas opacas generadas por Gemini Thinking que verifican que esta jugada fue calculada mediante deliberación interna.",
    "thought.copySignature": "Copiar firma",
    "thought.copiedSignature": "¡Copiada!",

    // Pawn Promotion
    "promotion.title": "Corona tu peón",
    "promotion.cancel": "Cancelar",
    "pieces.q": "Dama",
    "pieces.r": "Torre",
    "pieces.b": "Alfil",
    "pieces.n": "Caballo",
    "pieces.p": "Peón",
    "pieces.k": "Rey",

    // Territory Card
    "territory.eyebrow": "LEE EL TABLERO",
    "territory.title": "Cada casilla tiene una historia.",
    "territory.copy":
      "Los colores revelan a dónde puede mover cada bando. Una nueva perspectiva para tu siguiente jugada.",
    "territory.whiteReach": "Alcance de blancas",
    "territory.blackReach": "Alcance de negras",
    "territory.overlap": "Zona disputada",
    "territory.possibleDestinations": "Destinos posibles",
    "territory.bothCanMove": "Ambos bandos pueden mover aquí",
    "territory.toggleLabel": "Mostrar territorio",
    "territory.finePrint":
      "El alcance muestra los destinos legales de cada bando como si jugara en el siguiente turno. Las diagonales de peón aparecen cuando hay captura disponible.",

    // History Card
    "history.title": "La partida hasta ahora",
    "history.movesLabel": "JUGADAS",
    "history.colWhite": "Blancas",
    "history.colBlack": "Negras",
    "history.empty1": "Un tablero nuevo.",
    "history.empty2": "Un mundo de posibilidades.",
    "history.botNote": (elo) =>
      `Gemini apunta a ~${elo} Elo. La fuerza es aproximada y no oficial.`,
    "history.humanNote": "Sin reloj. Sin prisa. Solo tu siguiente jugada.",

    // Footer
    "footer.line1": "MENOS ADIVINAR. MÁS OBSERVAR.",
    "footer.line2": "Un poco de juego abre un gran camino.",

    // Difficulty Dialog
    "difficulty.eyebrow": "TU PARTIDA, A TU RITMO",
    "difficulty.title1": "Encuentra tu tipo",
    "difficulty.title2": "de desafío.",
    "difficulty.intro":
      "¿Un calentamiento suave o un buen reto mental? Dale a Gemini el nivel adecuado para ti.",
    "difficulty.label": "Nivel de juego de Gemini",
    "difficulty.eloTarget": "OBJETIVO ELO",
    "difficulty.gentle": "Suave",
    "difficulty.demanding": "Exigente",
    "difficulty.presetStart": "Comenzando",
    "difficulty.presetBalanced": "Partida equilibrada",
    "difficulty.presetChallenge": "Desafíame",
    "difficulty.goodPlaceToPractice": "Un buen nivel para practicar",
    "difficulty.disclaimer":
      "El Elo es una guía del desafío, no una puntuación oficial. La fuerza real de Gemini puede variar. Una jugada ya en curso conserva su nivel.",
    "difficulty.saving": "Guardando tu nivel…",
    "difficulty.playAtElo": (elo) => `Jugar a ${elo} Elo`,
    "difficulty.reassurance":
      "Aplica a turnos futuros. Puedes cambiarlo cuando quieras.",
    "difficulty.close": "Cerrar ajustes de dificultad",

    // Errors
    "error.invalidRoom":
      "Ese código de sala no es válido. Comienza una nueva partida abajo.",
    "error.reconnecting":
      "Reconectando… Tu partida está guardada. Las jugadas se reanudarán al conectar.",
    "error.permissionDenied":
      "No se puede acceder a esta sala ahora. Por favor reconecta o inicia una nueva partida.",
    "error.liveInterrupted":
      "Las actualizaciones en vivo se interrumpieron. Por favor reconecta para continuar.",
    "error.liveUnable":
      "No se pudo conectar a las actualizaciones en vivo. Por favor reconecta para continuar.",
    "error.syncFailed":
      "No se pudo sincronizar la jugada con el oponente. Revisa tu conexión.",
    "error.botTurnFailed": "Gemini no pudo completar su turno.",
    "error.noLegalMove": "Gemini no pudo decidir una jugada legal.",
  },
};

/**
 * Lookup helper returning localized string or calling a string generator.
 */
export function translate(lang, key, ...args) {
  const selectedLang = lang === "es" ? "es" : "en";
  const entry =
    chessTranslations[selectedLang]?.[key] ??
    chessTranslations.en[key] ??
    key;

  if (typeof entry === "function") {
    return entry(...args);
  }
  return entry;
}
