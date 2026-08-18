import { getQuestionType } from "./questionTypes.js";

export const CHAPTER_SALARY_BANDS = {
  tutorial: [50, 1000],
  1: [1250, 10000],
  2: [11000, 25000],
  3: [27000, 70000],
  4: [72000, 95000],
  5: [97000, 120000],
};

const roundSalary = (value, group) => {
  const increment = group === "tutorial" ? 25 : 250;
  return Math.round(value / increment) * increment;
};

export const TUTORIAL_REWARD_COPY = {
  en: {
    multipleChoice:
      "You distinguished a JavaScript number from string, boolean, and null values.",
    multipleAnswer:
      "You identified `let` and `const` as JavaScript variable-declaration keywords.",
    matchPairs:
      "You connected parameters, return values, and function calls to the roles they play.",
    selectOrder:
      "You arranged initialization, mutation, and output in the order JavaScript executes them.",
    relevantLine:
      "You located the exact statement that changes `total` from 1 to 3.",
    codeTracing:
      "You followed a variable update and correctly predicted the program’s final output.",
    fillCodeBlanks:
      "You completed a constant declaration with `const`, reinforcing variable syntax.",
    codeCompletion:
      "You recognized array-literal syntax instead of confusing a list with a string or object.",
    parsons:
      "You assembled a complete function body in valid structural order.",
    shortAnswer:
      "You recalled `const` as the keyword for a binding that cannot be reassigned.",
    openResponse:
      "You explained how variables let programs name, store, and reuse information.",
    codeWriting:
      "You translated a simple requirement into an executable `age` variable declaration.",
    terminal:
      "You used `cd` to enter `new_folder`, building your first command-line navigation habit.",
    bestImplementation:
      "You chose `forEach` so every array item is handled even when the list changes size.",
    fixBug:
      "You diagnosed a reassignment bug and changed `const` to `let` so the score can update.",
    refactoring:
      "You replaced repeated log statements with a loop while preserving the program’s output.",
    conversationReview:
      "You chose a small app idea and turned it into the first project milestone of your course.",
  },
  es: {
    multipleChoice:
      "Distinguiste un número de JavaScript de valores string, boolean y null.",
    multipleAnswer:
      "Identificaste `let` y `const` como palabras de JavaScript para declarar variables.",
    matchPairs:
      "Relacionaste parámetros, valores de retorno y llamadas de función con el papel que cumplen.",
    selectOrder:
      "Ordenaste la inicialización, actualización y salida según el orden en que JavaScript las ejecuta.",
    relevantLine:
      "Ubicaste la instrucción exacta que cambia `total` de 1 a 3 durante la ejecución.",
    codeTracing:
      "Seguiste la actualización de una variable y predijiste correctamente el resultado final.",
    fillCodeBlanks:
      "Completaste una declaración constante con `const` y reforzaste la sintaxis de variables.",
    codeCompletion:
      "Reconociste la sintaxis de un arreglo sin confundir una lista con un string o un objeto.",
    parsons:
      "Ensamblaste el cuerpo completo de una función en un orden estructural válido.",
    shortAnswer:
      "Recordaste `const` como la palabra para un enlace que no puede reasignarse.",
    openResponse:
      "Explicaste cómo las variables permiten nombrar, guardar y reutilizar información.",
    codeWriting:
      "Convertiste un requisito sencillo en una declaración ejecutable de la variable `age`.",
    terminal:
      "Usaste `cd` para entrar en `new_folder` y comenzaste a navegar desde la terminal.",
    bestImplementation:
      "Elegiste `forEach` para procesar todos los elementos aunque cambie el tamaño del arreglo.",
    fixBug:
      "Diagnosticaste un error de reasignación y cambiaste `const` por `let` para actualizar el puntaje.",
    refactoring:
      "Reemplazaste instrucciones repetidas de log con un ciclo sin cambiar el resultado.",
    conversationReview:
      "Elegiste una pequeña idea de aplicación y la convertiste en el primer avance del proyecto.",
  },
};

const rewardCopy = {
  en: {
    studyGuide: ({ title }) =>
      `“${title}” prepares you to use the course effectively; projected skill value starts at $0.`,
    tutorial: ({ title, type }) =>
      TUTORIAL_REWARD_COPY.en[type] ||
      `Completing “${title}” adds an early step to your projected skill value.`,
    multipleChoice: ({ title }) =>
      `Choosing the sound reasoning in “${title}” strengthens your technical judgment.`,
    multipleAnswer: ({ title }) =>
      `Identifying every valid answer in “${title}” strengthens complete technical analysis.`,
    matchPairs: ({ title }) =>
      `Connecting the concepts in “${title}” strengthens your working mental model.`,
    selectOrder: ({ title }) =>
      `Ordering “${title}” correctly strengthens reliable workflow execution.`,
    relevantLine: ({ title }) =>
      `Locating the decisive line in “${title}” strengthens debugging speed.`,
    codeTracing: ({ title }) =>
      `Tracing “${title}” strengthens your ability to predict runtime behavior.`,
    fillCodeBlanks: ({ title }) =>
      `Completing “${title}” reinforces syntax and implementation recall.`,
    codeCompletion: ({ title }) =>
      `Completing “${title}” strengthens your ability to finish existing code accurately.`,
    parsons: ({ title }) =>
      `Assembling “${title}” strengthens code structure and sequencing.`,
    shortAnswer: ({ title }) =>
      `Recalling “${title}” strengthens precise technical communication.`,
    openResponse: ({ title }) =>
      `Explaining “${title}” strengthens reasoning and technical communication.`,
    codeWriting: ({ title }) =>
      `Implementing “${title}” adds hands-on construction practice.`,
    terminal: ({ title }) =>
      `Practicing “${title}” builds command-line fluency.`,
    bestImplementation: ({ title }) =>
      `Evaluating “${title}” strengthens production-minded decision-making.`,
    fixBug: ({ title }) =>
      `Repairing “${title}” strengthens diagnosis and debugging skill.`,
    refactoring: ({ title }) =>
      `Improving “${title}” strengthens maintainable-code judgment.`,
    conversationReview: ({ group, title }) =>
      `The “${title}” milestone connects Chapter ${group} skills to your growing project.`,
    unknown: ({ title }) =>
      `Completing “${title}” adds another practiced skill to your course progress.`,
  },
  es: {
    studyGuide: ({ title }) =>
      `“${title}” te prepara para aprovechar el curso; el valor proyectado de tus habilidades comienza en $0.`,
    tutorial: ({ title, type }) =>
      TUTORIAL_REWARD_COPY.es[type] ||
      `Completar “${title}” añade un primer avance al valor proyectado de tus habilidades.`,
    multipleChoice: ({ title }) =>
      `Elegir el razonamiento correcto en “${title}” fortalece tu criterio técnico.`,
    multipleAnswer: ({ title }) =>
      `Identificar todas las respuestas válidas en “${title}” fortalece un análisis técnico completo.`,
    matchPairs: ({ title }) =>
      `Relacionar los conceptos de “${title}” fortalece tu modelo mental de trabajo.`,
    selectOrder: ({ title }) =>
      `Ordenar correctamente “${title}” fortalece la ejecución confiable de procesos.`,
    relevantLine: ({ title }) =>
      `Localizar la línea decisiva en “${title}” fortalece tu velocidad de depuración.`,
    codeTracing: ({ title }) =>
      `Rastrear “${title}” fortalece tu capacidad para predecir el comportamiento en ejecución.`,
    fillCodeBlanks: ({ title }) =>
      `Completar “${title}” refuerza la sintaxis y el recuerdo de implementación.`,
    codeCompletion: ({ title }) =>
      `Completar “${title}” fortalece tu capacidad para terminar código existente con precisión.`,
    parsons: ({ title }) =>
      `Construir “${title}” fortalece la estructura y secuencia del código.`,
    shortAnswer: ({ title }) =>
      `Recordar “${title}” fortalece una comunicación técnica precisa.`,
    openResponse: ({ title }) =>
      `Explicar “${title}” fortalece el razonamiento y la comunicación técnica.`,
    codeWriting: ({ title }) =>
      `Implementar “${title}” añade práctica real de construcción.`,
    terminal: ({ title }) =>
      `Practicar “${title}” desarrolla fluidez en la línea de comandos.`,
    bestImplementation: ({ title }) =>
      `Evaluar “${title}” fortalece decisiones orientadas a producción.`,
    fixBug: ({ title }) =>
      `Reparar “${title}” fortalece tus habilidades de diagnóstico y depuración.`,
    refactoring: ({ title }) =>
      `Mejorar “${title}” fortalece tu criterio para crear código mantenible.`,
    conversationReview: ({ group, title }) =>
      `El avance “${title}” conecta las habilidades del capítulo ${group} con tu proyecto.`,
    unknown: ({ title }) =>
      `Completar “${title}” añade otra habilidad practicada a tu progreso.`,
  },
};

const buildGroupIndexes = (course) => {
  const indexes = new Map();
  course.forEach((step, index) => {
    const group = String(step?.group ?? "");
    if (!CHAPTER_SALARY_BANDS[group]) return;
    indexes.set(group, [...(indexes.get(group) || []), index]);
  });
  return indexes;
};

const getSalary = (step, index, groupIndexes) => {
  const group = String(step?.group ?? "");
  const band = CHAPTER_SALARY_BANDS[group];
  if (!band) return 0;

  const indexes = groupIndexes.get(group) || [];
  const position = indexes.indexOf(index);
  const progress = indexes.length <= 1 ? 1 : position / (indexes.length - 1);
  return roundSalary(band[0] + (band[1] - band[0]) * progress, group);
};

const getLocalizedDetail = (locale, step, type) => {
  const group = String(step?.group ?? "");
  const copyKey = step?.isStudyGuide
    ? "studyGuide"
    : group === "tutorial"
      ? "tutorial"
      : type;
  const formatter = rewardCopy[locale][copyKey] || rewardCopy[locale].unknown;
  return formatter({ title: step?.title || "Untitled", group, type });
};

export const buildCourseLoot = (courseMap) => {
  const english = courseMap?.en || [];
  const spanish = courseMap?.es || [];

  if (english.length !== spanish.length) {
    throw new Error(
      `Cannot align course loot: English has ${english.length} steps and Spanish has ${spanish.length}.`,
    );
  }

  const groupIndexes = buildGroupIndexes(english);

  return english.map((englishStep, stepIndex) => {
    const spanishStep = spanish[stepIndex];
    const questionType = getQuestionType(englishStep);
    const spanishQuestionType = getQuestionType(spanishStep);
    const group = String(englishStep?.group ?? "");

    if (questionType !== spanishQuestionType) {
      throw new Error(
        `Cannot align course loot at step ${stepIndex}: English is ${questionType} and Spanish is ${spanishQuestionType}.`,
      );
    }

    if (
      group !== String(spanishStep?.group ?? "") &&
      questionType !== "studyGuide"
    ) {
      throw new Error(
        `Cannot align course loot at step ${stepIndex}: chapter groups differ.`,
      );
    }

    return {
      stepIndex,
      group,
      questionType,
      enTitle: englishStep?.title || "",
      esTitle: spanishStep?.title || "",
      monetaryValue: getSalary(englishStep, stepIndex, groupIndexes),
      en: getLocalizedDetail("en", englishStep, questionType),
      es: getLocalizedDetail("es", spanishStep, questionType),
    };
  });
};
