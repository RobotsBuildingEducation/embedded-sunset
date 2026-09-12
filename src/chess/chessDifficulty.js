import difficulty from "../../functions/chessDifficulty.json" with { type: "json" };

export { difficulty };

const spanishBands = {
  700: {
    label: "Primeros movimientos",
    tagline: "Espacio para aprender.",
    description:
      "Un punto de partida tranquilo mientras aprendes cómo se mueven las piezas. Espera planes simples, amenazas pasadas por alto y oportunidades para probar jugadas.",
    focus: "Familiarízate con el movimiento de piezas y las capturas.",
  },
  1100: {
    label: "Afianzando el juego",
    tagline: "Desarrolla tu confianza en el ajedrez.",
    description:
      "Un reto relajado con jugadas más intencionadas. Gemini busca capturas obvias pero aún puede pasar por alto un ataque doble o descuidar la apertura.",
    focus: "Protege tus piezas y presta atención a las amenazas de tu oponente.",
  },
  1500: {
    label: "Práctica de club",
    tagline: "Tu partida de reflexión cotidiana.",
    description:
      "Un rival equilibrado que desarrolla piezas, protege su rey y detecta tácticas sencillas. Ideal para planificar un par de jugadas hacia adelante.",
    focus: "Busca ataques dobles, clavadas y un plan para tus próximas jugadas.",
  },
  1900: {
    label: "Desafío táctico",
    tagline: "Examina tu jugada dos veces.",
    description:
      "Un oponente más incisivo que busca combinaciones y presiona las piezas desprotegidas. Tendrás que calcular bien las respuestas del rival.",
    focus: "Calcula respuestas y transforma pequeñas ventajas en un plan claro.",
  },
  2400: {
    label: "Máximo reto",
    tagline: "Exprime tus mejores ideas.",
    description:
      "El nivel más exigente: Gemini calcula con precisión y despliega un juego posicional paciente, concediendo muy pocas oportunidades fáciles.",
    focus: "Anticipa planes, calcula a fondo y practica la técnica de finales.",
  },
};

export const difficultyFor = (elo, language = "en") => {
  const baseBand = difficulty.bands.find((band) => elo <= band.max) || difficulty.bands[difficulty.bands.length - 1];
  if (language === "es" && spanishBands[baseBand.max]) {
    return {
      ...baseBand,
      ...spanishBands[baseBand.max],
    };
  }
  return baseBand;
};

export const formatElo = (elo, language = "en") =>
  elo.toLocaleString(language === "es" ? "es-ES" : "en-US");
