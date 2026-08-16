const MODE_FLAGS = [
  "isMultipleChoice",
  "isMultipleAnswerChoice",
  "isSelectOrder",
  "isCodeCompletion",
  "isCode",
  "isTerminal",
  "isSingleLineText",
  "isText",
  "isConversationReview",
  "isCodeTracing",
  "isFillCodeBlanks",
  "isParsonsProblem",
  "isMatchPairs",
  "isRelevantLine",
  "isBestImplementation",
  "isFixBug",
  "isRefactoringChallenge",
  "isProjectCheckpoint",
];

const TARGET_FLAGS = {
  trace: "isCodeTracing",
  fill: "isFillCodeBlanks",
  parsons: "isParsonsProblem",
  match: "isMatchPairs",
  relevant: "isRelevantLine",
  best: "isBestImplementation",
  fix: "isFixBug",
  refactor: "isRefactoringChallenge",
  project: "isProjectCheckpoint",
};

const localeCopy = {
  en: {
    trace: "Trace the code and determine its final output.",
    fill: "Complete the missing parts of the code.",
    parsons: "Reorder the lines to create a working solution.",
    match: "Match each concept with the description that fits it.",
    relevant: "Select the line most directly responsible for the behavior.",
    best: "Choose the clearest and most reliable implementation.",
    fix: "Repair the bug while preserving the intended behavior.",
    refactor: "Improve the code without changing its behavior.",
    project: "Complete this chapter checkpoint in your growing application.",
    tests: [
      "The code addresses the requirement",
      "The result remains readable",
    ],
  },
  es: {
    trace: "Sigue la ejecución del código y determina su resultado final.",
    fill: "Completa las partes faltantes del código.",
    parsons: "Ordena las líneas para crear una solución funcional.",
    match: "Relaciona cada concepto con la descripción correcta.",
    relevant: "Selecciona la línea responsable del comportamiento.",
    best: "Elige la implementación más clara y confiable.",
    fix: "Corrige el error sin cambiar el comportamiento esperado.",
    refactor: "Mejora el código sin cambiar su comportamiento.",
    project: "Completa este punto de control de tu aplicación.",
    tests: ["El código cumple el requisito", "El resultado es legible"],
  },
};

const exerciseCopy = {
  en: {
    trace: {
      1: {
        title: "Trace Array Operations",
        prompt:
          "Run the code line by line. After 10 is added and the odd values are filtered out, what exact value is logged?",
      },
      2: {
        title: "Trace an Object Method",
        prompt:
          "A Counter starts with value 1 and increment adds 2. What value does the final console.log output?",
      },
      3: {
        title: "Trace Rendered Props",
        prompt:
          'The Greeting component receives name="Ada". What text does the component render?',
      },
      4: {
        title: "Trace an Authorization Check",
        prompt:
          "The scopes array contains only 'profile'. Which message does this code log when it checks for the 'email' scope?",
      },
      5: {
        title: "Trace a Boolean Condition",
        prompt:
          "Track changedFiles through the code, then determine the exact value logged for canCommit.",
      },
    },
    fill: {
      1: {
        title: "Complete a Greeting Function",
        prompt:
          "Fill both blanks so greet receives a name parameter and logs `Hello ${name}` using a template literal.",
      },
      2: {
        title: "Complete a Class Method",
        prompt:
          "Fill the blanks with a method named updateModel and an assignment that stores the provided model on this.model.",
      },
      3: {
        title: "Complete React State",
        prompt:
          "Complete the useState declaration with the conventional setter name for liked and the React hook that creates state.",
      },
      4: {
        title: "Connect Firebase to Firestore",
        prompt:
          "Complete the Firebase setup with the function that initializes the app and the function that creates a Firestore connection.",
      },
      5: {
        title: "Connect Firebase Authentication",
        prompt:
          "Complete the setup with the function that initializes Firebase and the function that connects Authentication to the app.",
      },
    },
    parsons: {
      1: {
        title: "Assemble a For Loop",
        prompt:
          "Reorder the lines to create a JavaScript for loop that prints the numbers 1 through 5.",
      },
      2: {
        title: "Assemble a Student Class",
        prompt:
          "Reorder the lines to define Student as a subclass of Person, call super(name), and store course.",
      },
      3: {
        title: "Assemble a Data-fetching Effect",
        prompt:
          "Reorder the lines to fetch /api/tweets once when the component mounts and store the parsed response in tweets state.",
      },
      4: {
        title: "Assemble an Authentication Flow",
        prompt:
          "Reorder the lines so the server reads an authorization token, verifies it, loads the matching user, and creates a session.",
      },
      5: {
        title: "Assemble a Git Publishing Workflow",
        prompt:
          "Reorder the commands to initialize a repository, commit the project, connect the remote, and push the main branch.",
      },
    },
    match: {
      1: {
        title: "Match Function Concepts",
        prompt:
          "Match parameter, return value, and function call with the description that defines each concept.",
      },
      2: {
        title: "Match Class Concepts",
        prompt:
          "Match constructor, method, and property with the role each one has in a class or object.",
      },
      3: {
        title: "Match React Concepts",
        prompt:
          "Match props, state, and render with the way each concept is used in a React component.",
      },
      4: {
        title: "Match Backend Concepts",
        prompt:
          "Match API, database, and server with the responsibility each has in a backend system.",
      },
      5: {
        title: "Match Deployment Concepts",
        prompt:
          "Match serverless, hosting, and repository with the role each plays when building and publishing an application.",
      },
    },
    relevant: {
      1: {
        title: "Find the Dashboard Decision",
        prompt:
          "Select the line that decides whether the adult dashboard or student dashboard will be shown.",
      },
      2: {
        title: "Find the Inheritance Declaration",
        prompt:
          "Select the line that establishes ElectricCar as a subclass of Car.",
      },
      3: {
        title: "Find the Side Effect",
        prompt:
          "Select the line that updates the browser document title whenever count changes.",
      },
      4: {
        title: "Find the Environment Variable",
        prompt:
          "Select the line that reads the API key from the project's environment variables.",
      },
      5: {
        title: "Find the Sign-in Action",
        prompt: "Select the line that actually opens the Google sign-in popup.",
      },
    },
    best: {
      1: {
        title: "Choose a Scalable Email Loop",
        prompt:
          "The users array can contain any number of users. Which implementation most concisely calls sendEmail once for every user without manual indexing?",
      },
      2: {
        title: "Choose a Property Assignment",
        prompt:
          "You need to change car.model to 'Nova'. Which implementation uses valid, conventional JavaScript assignment syntax?",
      },
      3: {
        title: "Choose an Immutable State Update",
        prompt:
          "In React, add newItem to the items array and update state without mutating the existing array. Which implementation does that correctly?",
      },
      4: {
        title: "Choose a Firestore Query",
        prompt:
          "You need to retrieve every document in the Firestore users collection. Which implementation uses the supported Firestore API?",
      },
      5: {
        title: "Choose a Safe VS Code Workflow",
        prompt:
          "You need to edit and run an existing project in VS Code. Which workflow keeps you working in the source project with access to its integrated terminal?",
      },
    },
    fix: {
      1: {
        title: "Fix a Conditional Comparison",
        prompt:
          "The function must return 'zero' for 0 and classify positive and negative numbers correctly. Fix the comparison bug without changing the function's purpose.",
      },
      2: {
        title: "Fix an Object Property Assignment",
        prompt:
          "The code should add a year property with value 2026 to car. Fix the invalid property-assignment syntax.",
      },
      3: {
        title: "Fix Prop Mutation",
        prompt:
          "Profile should display the provided name or use 'Ada' as a fallback, but React props must remain read-only. Repair the component.",
      },
      4: {
        title: "Fix a Firebase User Lookup",
        prompt:
          "The code should load the signed-in user's Firestore document. Fix the identifier used to build the document reference.",
      },
      5: {
        title: "Fix Firebase Initialization",
        prompt:
          "The code should initialize Firebase with firebaseConfig and pass the resulting app to getAuth. Repair the initialization bug.",
      },
    },
    refactor: {
      1: {
        title: "Refactor Repeated Logging",
        prompt:
          "Refactor the repeated console.log statements into one loop that still prints every number from 1 through 5 in order.",
      },
      2: {
        title: "Refactor Shared Class Setup",
        prompt:
          "Refactor the classes so ElectricCar extends Car and reuses Car's brand initialization while keeping batteryLife.",
      },
      3: {
        title: "Refactor Shared React State",
        prompt:
          "Move the duplicated liked state into a parent component and pass the state and update behavior to LikeButton and ShareButton through props.",
      },
      4: {
        title: "Refactor Duplicated User Data",
        prompt:
          "Refactor the post model so it references an author by user ID instead of copying the author's name and email into every post.",
      },
      5: {
        title: "Refactor a Sign-in Component",
        prompt:
          "Refactor SignIn so authentication dependencies can be reused and the inline sign-in logic becomes a descriptively named event handler.",
      },
    },
    project: {
      1: {
        title: "Checkpoint: Update a Fruit List",
        prompt:
          "Complete the starter code: add one fruit, remove the first fruit, and log the final fruits array.",
      },
      2: {
        title: "Checkpoint: Build a Student Model",
        prompt:
          "Add a Student class that extends Person, stores a course, and create at least one Student instance.",
      },
      3: {
        title: "Checkpoint: Build a Tweet Interface",
        prompt:
          "Complete TweetApp so it renders a list of tweets and lets a user like a tweet using an immutable state update.",
      },
      4: {
        title: "Checkpoint: Load the Current User",
        prompt:
          "Complete loadCurrentUser so it reads the authenticated user's document from the Firestore users collection and returns its data.",
      },
      5: {
        title: "Checkpoint: Update a User Profile",
        prompt:
          "Complete updateProfile so it targets the current user's Firestore document, updates only the supplied changes, and returns a useful result.",
      },
    },
  },
  es: {
    trace: {
      1: {
        title: "Seguir Operaciones de Arreglo",
        prompt:
          "Ejecuta el código línea por línea. Después de agregar 10 y filtrar los valores impares, ¿qué valor exacto se imprime?",
      },
      2: {
        title: "Seguir un Método de Objeto",
        prompt:
          "Counter comienza con value igual a 1 e increment agrega 2. ¿Qué valor imprime el console.log final?",
      },
      3: {
        title: "Seguir Props Renderizadas",
        prompt:
          'El componente Greeting recibe name="Ada". ¿Qué texto renderiza el componente?',
      },
      4: {
        title: "Seguir una Verificación de Autorización",
        prompt:
          "El arreglo scopes contiene solamente 'profile'. ¿Qué mensaje imprime el código cuando busca el permiso 'email'?",
      },
      5: {
        title: "Seguir una Condición Booleana",
        prompt:
          "Sigue el valor de changedFiles y determina el valor exacto que se imprime para canCommit.",
      },
    },
    fill: {
      1: {
        title: "Completar una Función de Saludo",
        prompt:
          "Completa ambos espacios para que greet reciba el parámetro name e imprima `Hello ${name}` usando un template literal.",
      },
      2: {
        title: "Completar un Método de Clase",
        prompt:
          "Completa los espacios con un método llamado updateModel y una asignación que guarde el modelo recibido en this.model.",
      },
      3: {
        title: "Completar Estado de React",
        prompt:
          "Completa la declaración con el nombre convencional del setter de liked y el hook de React que crea estado.",
      },
      4: {
        title: "Conectar Firebase con Firestore",
        prompt:
          "Completa la configuración con la función que inicializa la aplicación y la función que crea la conexión a Firestore.",
      },
      5: {
        title: "Conectar Firebase Authentication",
        prompt:
          "Completa la configuración con la función que inicializa Firebase y la función que conecta Authentication con la aplicación.",
      },
    },
    parsons: {
      1: {
        title: "Construir un Ciclo For",
        prompt:
          "Ordena las líneas para crear un ciclo for de JavaScript que imprima los números del 1 al 5.",
      },
      2: {
        title: "Construir una Clase Student",
        prompt:
          "Ordena las líneas para definir Student como subclase de Person, llamar super(name) y guardar course.",
      },
      3: {
        title: "Construir un Efecto de Carga",
        prompt:
          "Ordena las líneas para solicitar /api/tweets una vez al montar el componente y guardar la respuesta procesada en el estado tweets.",
      },
      4: {
        title: "Construir un Flujo de Autenticación",
        prompt:
          "Ordena las líneas para leer un token, verificarlo, cargar al usuario correspondiente y crear una sesión.",
      },
      5: {
        title: "Construir un Flujo de Publicación con Git",
        prompt:
          "Ordena los comandos para iniciar el repositorio, guardar un commit, conectar el remoto y publicar la rama main.",
      },
    },
    match: {
      1: {
        title: "Relacionar Conceptos de Funciones",
        prompt:
          "Relaciona parámetro, valor de retorno y llamada de función con la definición de cada concepto.",
      },
      2: {
        title: "Relacionar Conceptos de Clases",
        prompt:
          "Relaciona constructor, método y propiedad con el papel de cada uno en una clase u objeto.",
      },
      3: {
        title: "Relacionar Conceptos de React",
        prompt:
          "Relaciona props, estado y renderizado con el uso de cada concepto en un componente de React.",
      },
      4: {
        title: "Relacionar Conceptos de Backend",
        prompt:
          "Relaciona API, base de datos y servidor con la responsabilidad de cada uno en un sistema backend.",
      },
      5: {
        title: "Relacionar Conceptos de Despliegue",
        prompt:
          "Relaciona serverless, hosting y repositorio con el papel de cada uno al construir y publicar una aplicación.",
      },
    },
    relevant: {
      1: {
        title: "Encontrar la Decisión del Panel",
        prompt:
          "Selecciona la línea que decide si se muestra el panel de adulto o el panel de estudiante.",
      },
      2: {
        title: "Encontrar la Declaración de Herencia",
        prompt:
          "Selecciona la línea que establece ElectricCar como subclase de Car.",
      },
      3: {
        title: "Encontrar el Efecto Secundario",
        prompt:
          "Selecciona la línea que actualiza el título del documento cuando cambia count.",
      },
      4: {
        title: "Encontrar la Variable de Entorno",
        prompt:
          "Selecciona la línea que lee la clave API de las variables de entorno del proyecto.",
      },
      5: {
        title: "Encontrar la Acción de Inicio de Sesión",
        prompt:
          "Selecciona la línea que abre la ventana de inicio de sesión con Google.",
      },
    },
    best: {
      1: {
        title: "Elegir un Ciclo de Correos Escalable",
        prompt:
          "El arreglo users puede tener cualquier cantidad de usuarios. ¿Qué implementación llama sendEmail una vez por usuario de la forma más concisa y sin índices manuales?",
      },
      2: {
        title: "Elegir una Asignación de Propiedad",
        prompt:
          "Necesitas cambiar car.model a 'Nova'. ¿Qué implementación usa una asignación válida y convencional de JavaScript?",
      },
      3: {
        title: "Elegir una Actualización Inmutable",
        prompt:
          "En React, agrega newItem al arreglo items sin modificar el arreglo existente. ¿Qué implementación lo hace correctamente?",
      },
      4: {
        title: "Elegir una Consulta de Firestore",
        prompt:
          "Necesitas obtener todos los documentos de la colección users de Firestore. ¿Qué implementación usa la API compatible?",
      },
      5: {
        title: "Elegir un Flujo Seguro en VS Code",
        prompt:
          "Necesitas editar y ejecutar un proyecto existente en VS Code. ¿Qué flujo trabaja con el código fuente y permite usar la terminal integrada?",
      },
    },
    fix: {
      1: {
        title: "Corregir una Comparación Condicional",
        prompt:
          "La función debe devolver 'zero' para 0 y clasificar correctamente números positivos y negativos. Corrige la comparación sin cambiar su propósito.",
      },
      2: {
        title: "Corregir una Asignación de Propiedad",
        prompt:
          "El código debe agregar a car una propiedad year con valor 2026. Corrige la sintaxis de asignación inválida.",
      },
      3: {
        title: "Corregir la Mutación de Props",
        prompt:
          "Profile debe mostrar el nombre recibido o usar 'Ada' como alternativa, pero las props deben permanecer inmutables. Corrige el componente.",
      },
      4: {
        title: "Corregir una Consulta de Usuario",
        prompt:
          "El código debe cargar de Firestore el documento del usuario autenticado. Corrige el identificador usado en la referencia.",
      },
      5: {
        title: "Corregir la Inicialización de Firebase",
        prompt:
          "El código debe inicializar Firebase con firebaseConfig y pasar la aplicación resultante a getAuth. Corrige el error.",
      },
    },
    refactor: {
      1: {
        title: "Refactorizar Impresiones Repetidas",
        prompt:
          "Reemplaza los console.log repetidos con un ciclo que siga imprimiendo, en orden, los números del 1 al 5.",
      },
      2: {
        title: "Refactorizar Configuración Compartida",
        prompt:
          "Refactoriza las clases para que ElectricCar extienda Car y reutilice la inicialización de brand sin perder batteryLife.",
      },
      3: {
        title: "Refactorizar Estado Compartido de React",
        prompt:
          "Mueve el estado liked duplicado a un componente padre y pásalo con su función de actualización a ambos botones mediante props.",
      },
      4: {
        title: "Refactorizar Datos de Usuario Duplicados",
        prompt:
          "Refactoriza el modelo para que el post use el ID del autor en vez de copiar su nombre y correo en cada publicación.",
      },
      5: {
        title: "Refactorizar un Componente de Acceso",
        prompt:
          "Refactoriza SignIn para reutilizar las dependencias de autenticación y mover la lógica inline a un manejador con nombre descriptivo.",
      },
    },
    project: {
      1: {
        title: "Punto de Control: Actualizar una Lista",
        prompt:
          "Completa el código inicial: agrega una fruta, elimina la primera fruta e imprime el arreglo fruits final.",
      },
      2: {
        title: "Punto de Control: Crear un Modelo Student",
        prompt:
          "Agrega una clase Student que extienda Person, guarde course y crea al menos una instancia de Student.",
      },
      3: {
        title: "Punto de Control: Crear una Interfaz de Tweets",
        prompt:
          "Completa TweetApp para mostrar una lista de tweets y permitir dar like mediante una actualización de estado inmutable.",
      },
      4: {
        title: "Punto de Control: Cargar al Usuario Actual",
        prompt:
          "Completa loadCurrentUser para leer el documento del usuario autenticado en la colección users y devolver sus datos.",
      },
      5: {
        title: "Punto de Control: Actualizar un Perfil",
        prompt:
          "Completa updateProfile para modificar el documento del usuario actual, actualizar solo los cambios recibidos y devolver un resultado útil.",
      },
    },
  },
};

const codeBanks = {
  fill: {
    1: {
      template:
        "function greet({{parameter}}) {\n  console.log({{message}});\n}",
      answer: { parameter: "name", message: "`Hello ${name}`" },
      blanks: [
        { key: "parameter", hint: "The value received by the function" },
        { key: "message", hint: "A template literal that uses the parameter" },
      ],
    },
    2: {
      template:
        "class Car {\n  {{method}}(model) {\n    {{assignment}};\n  }\n}",
      answer: { method: "updateModel", assignment: "this.model = model" },
      blanks: [
        { key: "method", hint: "Name the method" },
        { key: "assignment", hint: "Update the instance property" },
      ],
    },
    3: {
      template: "const [liked, {{setter}}] = {{hook}}(false);",
      answer: { setter: "setLiked", hook: "useState" },
      blanks: [
        { key: "setter", hint: "State update function" },
        { key: "hook", hint: "React state hook" },
      ],
    },
    4: {
      template:
        "const app = {{initialize}}(firebaseConfig);\nconst db = {{database}}(app);",
      answer: { initialize: "initializeApp", database: "getFirestore" },
      blanks: [
        { key: "initialize", hint: "Initialize Firebase" },
        { key: "database", hint: "Create the Firestore connection" },
      ],
    },
    5: {
      template:
        "const app = {{initialize}}(firebaseConfig);\nconst auth = {{auth}}(app);",
      answer: { initialize: "initializeApp", auth: "getAuth" },
      blanks: [
        { key: "initialize", hint: "Create the Firebase app" },
        { key: "auth", hint: "Connect Authentication" },
      ],
    },
  },
  fix: {
    1: {
      starterCode:
        "const describeNumber = (num) => {\n  if (num = 0) return 'zero';\n  return num > 0 ? 'positive' : 'negative';\n};",
      answer:
        "const describeNumber = (num) => {\n  if (num === 0) return 'zero';\n  return num > 0 ? 'positive' : 'negative';\n};",
      tests: [
        "0 returns zero",
        "Positive and negative numbers follow the correct branch",
      ],
    },
    2: {
      starterCode: "const car = { model: 'Roadster' };\ncar.year: 2026;",
      answer: "const car = { model: 'Roadster' };\ncar.year = 2026;",
      tests: ["car.year equals 2026", "The object remains valid JavaScript"],
    },
    3: {
      starterCode:
        "function Profile(props) {\n  props.name = 'Ada';\n  return <h2>{props.name}</h2>;\n}",
      answer:
        "function Profile(props) {\n  const name = props.name || 'Ada';\n  return <h2>{name}</h2>;\n}",
      acceptedAnswers: [
        "function Profile(props) {\n  const name = props.name || 'Ada';\n  return <h2>{name}</h2>;\n}",
        "function Profile({ name = 'Ada' }) {\n  return <h2>{name}</h2>;\n}",
      ],
      tests: ["Props are not mutated", "A fallback name is displayed"],
    },
    4: {
      starterCode:
        "const user = auth.currentUser;\nconst ref = doc(db, 'users', user.id);\nconst snapshot = await getDoc(ref);",
      answer:
        "const user = auth.currentUser;\nconst ref = doc(db, 'users', user.uid);\nconst snapshot = await getDoc(ref);",
      tests: [
        "The authenticated Firebase identifier is used",
        "The document can be retrieved",
      ],
    },
    5: {
      starterCode: "const app = initializeApp;\nconst auth = getAuth(app);",
      answer:
        "const app = initializeApp(firebaseConfig);\nconst auth = getAuth(app);",
      tests: [
        "Firebase receives its configuration",
        "Authentication receives the initialized app",
      ],
    },
  },
  refactor: {
    1: {
      starterCode:
        "console.log(1);\nconsole.log(2);\nconsole.log(3);\nconsole.log(4);\nconsole.log(5);",
      tests: [
        "Prints the numbers 1 through 5",
        "Uses one loop instead of repeated statements",
      ],
    },
    2: {
      starterCode:
        "class ElectricCar {\n  constructor(brand, batteryLife) {\n    this.brand = brand;\n    this.batteryLife = batteryLife;\n  }\n}\n\nclass Car {\n  constructor(brand) { this.brand = brand; }\n}",
      tests: ["ElectricCar extends Car", "Shared brand setup lives in Car"],
    },
    3: {
      starterCode:
        "function LikeButton() {\n  const [liked, setLiked] = useState(false);\n}\nfunction ShareButton() {\n  const [liked, setLiked] = useState(false);\n}",
      tests: [
        "Shared state moves to a parent",
        "Both buttons receive state through props",
      ],
    },
    4: {
      starterCode:
        "const post = {\n  title: 'Hello',\n  authorName: 'Ada',\n  authorEmail: 'ada@example.com'\n};",
      tests: [
        "The post references a user identifier",
        "User details are not duplicated in every post",
      ],
    },
    5: {
      starterCode:
        "function SignIn() {\n  const provider = new GoogleAuthProvider();\n  return <button onClick={() => signInWithPopup(getAuth(), provider)}>Sign in</button>;\n}",
      tests: [
        "Authentication dependencies are reusable",
        "The event handler has a descriptive name",
      ],
    },
  },
  project: {
    1: {
      checkpointId: "01-data-list",
      starterCode:
        "const fruits = ['apple', 'banana'];\n\n// Add and remove items here\n",
      tests: [
        "Adds one fruit",
        "Removes the first fruit",
        "Logs the final list",
      ],
    },
    2: {
      checkpointId: "02-data-model",
      starterCode:
        "class Person {\n  constructor(name) {\n    this.name = name;\n  }\n}\n\n// Add Student here\n",
      tests: [
        "Student extends Person",
        "Student stores a course",
        "At least one Student is created",
      ],
    },
    3: {
      checkpointId: "03-interface",
      starterCode:
        "function TweetApp() {\n  // Add state and render the interface\n  return <main />;\n}",
      tests: [
        "Renders a list of tweets",
        "A user can like a tweet",
        "State updates without mutating props",
      ],
    },
    4: {
      checkpointId: "04-persistence",
      starterCode:
        "async function loadCurrentUser(db, user) {\n  // Retrieve the user's Firestore document\n}",
      tests: [
        "Uses the authenticated user uid",
        "Reads from the users collection",
        "Returns the document data",
      ],
    },
    5: {
      checkpointId: "05-profile",
      starterCode:
        "async function updateProfile(db, uid, changes) {\n  // Persist the profile changes\n}",
      tests: [
        "Targets the current user's document",
        "Updates only the supplied fields",
        "Returns a useful result",
      ],
    },
  },
};

const traceBanks = {
  1: {
    code: "let values = [1, 2, 3, 4];\nvalues.push(10);\nvalues = values.filter((n) => n % 2 === 0);\nconsole.log(values);",
    options: ["[1, 2, 3, 4, 10]", "[2, 4, 10]", "[1, 3]", "10"],
    answer: "[2, 4, 10]",
  },
  2: {
    code: "class Counter {\n  constructor() { this.value = 1; }\n  increment() { this.value += 2; }\n}\nconst counter = new Counter();\ncounter.increment();\nconsole.log(counter.value);",
    options: ["1", "2", "3", "undefined"],
    answer: "3",
  },
  3: {
    code: 'function Greeting({ name }) {\n  return <h1>Hello {name}</h1>;\n}\n<Greeting name="Ada" />;',
    options: ["Hello", "Hello Ada", "name", "Nothing"],
    answer: "Hello Ada",
  },
  4: {
    code: "const scopes = ['profile'];\nif (scopes.includes('email')) {\n  console.log('email granted');\n} else {\n  console.log('email denied');\n}",
    options: ["email granted", "email denied", "profile", "undefined"],
    answer: "email denied",
  },
  5: {
    code: "let changedFiles = 2;\nchangedFiles += 1;\nconst canCommit = changedFiles > 0;\nconsole.log(canCommit);",
    options: ["0", "2", "3", "true"],
    answer: "true",
  },
};

const parsonsBanks = {
  1: ["for (let i = 1; i <= 5; i++) {", "  console.log(i);", "}"],
  2: [
    "class Student extends Person {",
    "  constructor(name, course) {",
    "    super(name);",
    "    this.course = course;",
    "  }",
    "}",
  ],
  3: [
    "useEffect(() => {",
    "  fetch('/api/tweets')",
    "    .then((response) => response.json())",
    "    .then((data) => setTweets(data));",
    "}, []);",
  ],
  4: [
    "const token = request.headers.authorization;",
    "const payload = verifyToken(token);",
    "const user = await findUser(payload.userId);",
    "return createSession(user);",
  ],
  5: [
    "git init",
    "git add .",
    "git commit -m 'Initial commit'",
    "git branch -M main",
    "git remote add origin <repository-url>",
    "git push -u origin main",
  ],
};

const matchBanks = {
  en: {
    1: [
      ["Parameter", "A value a function receives"],
      ["Return value", "The result a function sends back"],
      ["Function call", "An instruction that runs a function"],
    ],
    2: [
      ["Constructor", "Initializes a new instance"],
      ["Method", "Behavior attached to a class"],
      ["Property", "Data stored on an object"],
    ],
    3: [
      ["Props", "Read-only input from a parent"],
      ["State", "Data a component can update"],
      ["Render", "Produces the visible interface"],
    ],
    4: [
      ["API", "A contract for systems to communicate"],
      ["Database", "Persistent structured storage"],
      ["Server", "Processes requests and applies application logic"],
    ],
    5: [
      ["Serverless", "Runs managed functions without maintaining servers"],
      ["Hosting", "Publishes an application to the web"],
      ["Repository", "Stores code and its change history"],
    ],
  },
  es: {
    1: [
      ["Parámetro", "Valor que recibe una función"],
      ["Valor de retorno", "Resultado que devuelve una función"],
      ["Llamada", "Instrucción que ejecuta una función"],
    ],
    2: [
      ["Constructor", "Inicializa una instancia nueva"],
      ["Método", "Comportamiento de una clase"],
      ["Propiedad", "Dato almacenado en un objeto"],
    ],
    3: [
      ["Props", "Entrada de solo lectura de un componente padre"],
      ["Estado", "Datos que un componente puede actualizar"],
      ["Renderizado", "Produce la interfaz visible"],
    ],
    4: [
      ["API", "Contrato para comunicar sistemas"],
      ["Base de datos", "Almacenamiento estructurado persistente"],
      ["Servidor", "Procesa solicitudes y lógica de la aplicación"],
    ],
    5: [
      ["Serverless", "Ejecuta funciones administradas sin mantener servidores"],
      ["Hosting", "Publica una aplicación en la web"],
      ["Repositorio", "Guarda código y su historial de cambios"],
    ],
  },
};

const relevantBanks = {
  1: {
    code: "const age = 20;\nif (age >= 18) {\n  showAdultDashboard();\n} else {\n  showStudentDashboard();\n}",
    answer: [2],
  },
  2: {
    code: "class ElectricCar extends Car {\n  constructor(brand, batteryLife) {\n    super(brand);\n    this.batteryLife = batteryLife;\n  }\n}",
    answer: [1],
  },
  3: {
    code: "function Counter() {\n  const [count, setCount] = useState(0);\n  useEffect(() => document.title = count, [count]);\n  return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}",
    answer: [3],
  },
  4: {
    code: "const apiKey = import.meta.env.VITE_API_KEY;\nconst endpoint = '/api/profile';\nconst response = await fetch(endpoint, {\n  headers: { Authorization: apiKey }\n});",
    answer: [1],
  },
  5: {
    code: "const provider = new GoogleAuthProvider();\nconst auth = getAuth(app);\nawait signInWithPopup(auth, provider);\nconsole.log(auth.currentUser);",
    answer: [3],
  },
};

const bestBanks = {
  en: {
    1: [
      "for (let i = 0; i < users.length; i++) { sendEmail(users[i]); }",
      "users.forEach(sendEmail);",
      "sendEmail(users[0]); sendEmail(users[1]);",
    ],
    2: ["car.model = 'Nova';", "car.model == 'Nova';", "car.model: 'Nova';"],
    3: [
      "const next = [...items, newItem]; setItems(next);",
      "items.push(newItem); setItems(items);",
      "setItems = items + newItem;",
    ],
    4: [
      "const users = await getDocs(collection(db, 'users'));",
      "const users = db.users.all;",
      "fetch('firebase://users');",
    ],
    5: [
      "Open the project folder as a workspace and use its integrated terminal.",
      "Copy every file into a new unnamed folder before each edit.",
      "Edit the production build output instead of the source files.",
    ],
  },
  es: {
    1: [
      "for (let i = 0; i < users.length; i++) { sendEmail(users[i]); }",
      "users.forEach(sendEmail);",
      "sendEmail(users[0]); sendEmail(users[1]);",
    ],
    2: ["car.model = 'Nova';", "car.model == 'Nova';", "car.model: 'Nova';"],
    3: [
      "const next = [...items, newItem]; setItems(next);",
      "items.push(newItem); setItems(items);",
      "setItems = items + newItem;",
    ],
    4: [
      "const users = await getDocs(collection(db, 'users'));",
      "const users = db.users.all;",
      "fetch('firebase://users');",
    ],
    5: [
      "Abrir la carpeta como espacio de trabajo y usar su terminal integrada.",
      "Copiar todos los archivos a una carpeta nueva antes de cada cambio.",
      "Editar la compilación de producción en lugar del código fuente.",
    ],
  },
};

const bestAnswers = {
  1: "users.forEach(sendEmail);",
  2: "car.model = 'Nova';",
  3: "const next = [...items, newItem]; setItems(next);",
  4: "const users = await getDocs(collection(db, 'users'));",
};

const buildModeQuestion = (mode, group, locale) => {
  const language = locale === "es" ? "es" : "en";
  const exercise = exerciseCopy[language]?.[mode]?.[group];
  if (!exercise?.prompt) {
    throw new Error(
      `Missing ${language} curriculum copy for ${mode} in chapter ${group}`,
    );
  }
  const questionText = exercise.prompt;

  if (mode === "trace") return { questionText, ...traceBanks[group] };
  if (mode === "fill") return { questionText, ...codeBanks.fill[group] };
  if (mode === "parsons") {
    const lines = parsonsBanks[group];
    return { questionText, lines, answer: [...lines] };
  }
  if (mode === "match") {
    const rawPairs = matchBanks[language][group];
    const pairs = rawPairs.map(([left, right]) => ({ left, right }));
    return {
      questionText,
      pairs,
      choices: rawPairs.map(([, right]) => right),
      answer: Object.fromEntries(rawPairs),
    };
  }
  if (mode === "relevant") return { questionText, ...relevantBanks[group] };
  if (mode === "best") {
    const options = bestBanks[language][group];
    return { questionText, options, answer: bestAnswers[group] || options[0] };
  }
  if (mode === "fix") return { questionText, ...codeBanks.fix[group] };
  if (mode === "refactor")
    return { questionText, ...codeBanks.refactor[group] };
  if (mode === "project")
    return {
      questionText,
      ...codeBanks.project[group],
      projectId: "course-app",
    };
  return originalQuestion;
};

const conversionRules = [
  // One of every new modality in each chapter. Occurrences are counted within
  // the original question type, keeping chapter length and learning order stable.
  { group: "1", source: "isCode", occurrence: 0, mode: "fill" },
  { group: "1", source: "isCode", occurrence: 1, mode: "fix" },
  { group: "1", source: "isCode", occurrence: 2, mode: "refactor" },
  { group: "1", source: "isCode", occurrence: 3, mode: "project" },
  { group: "1", source: "isSingleLineText", occurrence: 1, mode: "trace" },
  { group: "1", source: "isSelectOrder", occurrence: 1, mode: "parsons" },
  { group: "1", source: "isText", occurrence: 0, mode: "match" },
  { group: "1", source: "isText", occurrence: 1, mode: "relevant" },
  { group: "1", source: "isText", occurrence: 2, mode: "best" },

  { group: "2", source: "isCode", occurrence: 0, mode: "fill" },
  { group: "2", source: "isCode", occurrence: 1, mode: "fix" },
  { group: "2", source: "isCode", occurrence: 3, mode: "refactor" },
  { group: "2", source: "isCode", occurrence: 5, mode: "project" },
  { group: "2", source: "isSingleLineText", occurrence: 1, mode: "trace" },
  {
    group: "2",
    source: "isMultipleAnswerChoice",
    occurrence: 0,
    mode: "parsons",
  },
  { group: "2", source: "isText", occurrence: 0, mode: "match" },
  { group: "2", source: "isText", occurrence: 1, mode: "relevant" },
  { group: "2", source: "isText", occurrence: 2, mode: "best" },

  { group: "3", source: "isCode", occurrence: 0, mode: "fill" },
  { group: "3", source: "isCode", occurrence: 1, mode: "fix" },
  { group: "3", source: "isCode", occurrence: 3, mode: "refactor" },
  { group: "3", source: "isCode", occurrence: 5, mode: "project" },
  { group: "3", source: "isSingleLineText", occurrence: 0, mode: "trace" },
  { group: "3", source: "isSelectOrder", occurrence: 1, mode: "parsons" },
  { group: "3", source: "isText", occurrence: 0, mode: "match" },
  { group: "3", source: "isText", occurrence: 1, mode: "relevant" },
  { group: "3", source: "isText", occurrence: 2, mode: "best" },

  { group: "4", source: "isCode", occurrence: 0, mode: "fill" },
  { group: "4", source: "isCode", occurrence: 1, mode: "fix" },
  { group: "4", source: "isCode", occurrence: 3, mode: "refactor" },
  { group: "4", source: "isCode", occurrence: 2, mode: "project" },
  { group: "4", source: "isSingleLineText", occurrence: 1, mode: "trace" },
  { group: "4", source: "isSelectOrder", occurrence: 1, mode: "parsons" },
  { group: "4", source: "isText", occurrence: 0, mode: "match" },
  { group: "4", source: "isText", occurrence: 5, mode: "relevant" },
  { group: "4", source: "isText", occurrence: 4, mode: "best" },

  { group: "5", source: "isCode", occurrence: 0, mode: "fill" },
  { group: "5", source: "isCode", occurrence: 1, mode: "fix" },
  { group: "5", source: "isCode", occurrence: 2, mode: "refactor" },
  { group: "5", source: "isCode", occurrence: 4, mode: "project" },
  { group: "5", source: "isSingleLineText", occurrence: 3, mode: "trace" },
  { group: "5", source: "isSelectOrder", occurrence: 1, mode: "parsons" },
  { group: "5", source: "isText", occurrence: 0, mode: "match" },
  { group: "5", source: "isText", occurrence: 3, mode: "relevant" },
  { group: "5", source: "isText", occurrence: 1, mode: "best" },
];

const applyChapterConversions = (courseSteps, locale) => {
  const candidateMap = new Map();
  conversionRules.forEach((rule) => {
    const key = `${rule.group}:${rule.source}`;
    if (candidateMap.has(key)) return;
    candidateMap.set(
      key,
      courseSteps.filter((step) => {
        if (String(step?.group) !== rule.group) return false;
        if (rule.source === "isCode") return step?.isCode && !step?.isTerminal;
        return Boolean(step?.[rule.source]);
      }),
    );
  });
  conversionRules.forEach((rule) => {
    const candidates = candidateMap.get(`${rule.group}:${rule.source}`) || [];
    const step = candidates[rule.occurrence];
    if (!step) return;
    MODE_FLAGS.forEach((flag) => delete step[flag]);
    step[TARGET_FLAGS[rule.mode]] = true;
    const language = locale === "es" ? "es" : "en";
    const exercise = exerciseCopy[language][rule.mode][Number(rule.group)];
    step.title = exercise.title;
    delete step.description;
    step.question = buildModeQuestion(rule.mode, Number(rule.group), locale);
  });
};

export const tutorialSteps = (locale) => {
  const es = locale === "es";
  const t = (en, spanish) => (es ? spanish : en);
  const steps = [
    {
      group: "tutorial",
      title: t("Multiple Choice", "Opción Múltiple"),
      description: t("Choose one answer.", "Elige una respuesta."),
      isMultipleChoice: true,
      question: {
        questionText: t(
          "Which value is a JavaScript number?",
          "¿Qué valor es un número de JavaScript?",
        ),
        options: ["42", "'42'", "true", "null"],
        answer: "42",
      },
    },
    {
      group: "tutorial",
      title: t("Multiple Answer", "Respuesta Múltiple"),
      description: t(
        "Choose every correct answer.",
        "Elige todas las respuestas correctas.",
      ),
      isMultipleAnswerChoice: true,
      question: {
        questionText: t(
          "Which names can declare a JavaScript variable?",
          "¿Qué palabras pueden declarar una variable de JavaScript?",
        ),
        options: ["let", "const", "style", "return"],
        answer: ["let", "const"],
      },
    },
    {
      group: "tutorial",
      title: t("Match the Pairs", "Relacionar Pares"),
      description: t(
        "Connect related concepts.",
        "Conecta conceptos relacionados.",
      ),
      isMatchPairs: true,
      question: buildModeQuestion("match", 1, locale),
    },
    {
      group: "tutorial",
      title: t("Select Order", "Ordenar Pasos"),
      description: t(
        "Learn the correct order of program execution.",
        "Aprende el orden correcto de la ejecución de programas.",
      ),
      isSelectOrder: true,
      question: {
        questionText: t(
          "Arrange the steps to show how a program moves from an idea to execution.",
          "Ordena los pasos para mostrar cómo un programa pasa de una idea a su ejecución.",
        ),
        options: t(
          [
            "Code Compilation",
            "Writing Code",
            "Executing Program",
            "Debugging",
          ],
          [
            "Compilación del Código",
            "Escritura del Código",
            "Ejecución del Programa",
            "Depuración",
          ],
        ),
        answer: t(
          [
            "Writing Code",
            "Code Compilation",
            "Debugging",
            "Executing Program",
          ],
          [
            "Escritura del Código",
            "Compilación del Código",
            "Depuración",
            "Ejecución del Programa",
          ],
        ),
      },
    },
    {
      group: "tutorial",
      title: t("Find the Relevant Line", "Encontrar la Línea Relevante"),
      description: t(
        "Locate behavior in code.",
        "Localiza un comportamiento en el código.",
      ),
      isRelevantLine: true,
      question: {
        questionText: t(
          "Which line changes total from 1 to 3?",
          "¿Qué línea cambia total de 1 a 3?",
        ),
        code: "let total = 1;\ntotal += 2;\nconsole.log(total);",
        answer: [2],
      },
    },
    {
      group: "tutorial",
      title: t("Code Tracing", "Seguimiento de Código"),
      description: t(
        "Follow values as code runs.",
        "Sigue los valores mientras se ejecuta el código.",
      ),
      isCodeTracing: true,
      question: {
        questionText: localeCopy[es ? "es" : "en"].trace,
        code: "let count = 1;\ncount += 2;\nconsole.log(count);",
        options: ["1", "2", "3", "undefined"],
        answer: "3",
      },
    },
    {
      group: "tutorial",
      title: t("Fill in the Code Blanks", "Completar el Código"),
      description: t(
        "Supply missing syntax.",
        "Completa la sintaxis faltante.",
      ),
      isFillCodeBlanks: true,
      question: {
        questionText: localeCopy[es ? "es" : "en"].fill,
        template: "{{keyword}} age = 25;",
        blanks: [
          {
            key: "keyword",
            hint: t(
              "A variable keyword",
              "Una palabra para declarar variables",
            ),
          },
        ],
        answer: { keyword: "const" },
      },
    },
    {
      group: "tutorial",
      title: t("Code Completion", "Finalización de Código"),
      description: t(
        "Choose a complete code solution.",
        "Elige una solución de código completa.",
      ),
      isCodeCompletion: true,
      question: {
        questionText: t(
          "Which code declares a list?",
          "¿Qué código declara una lista?",
        ),
        options: [
          "const items = ['apple'];",
          "const items = 'apple';",
          "const items = { apple: true };",
        ],
        answer: "const items = ['apple'];",
      },
    },
    {
      group: "tutorial",
      title: t("Parsons Problem", "Problema Parsons"),
      description: t(
        "Assemble code in the right order.",
        "Ensambla el código en el orden correcto.",
      ),
      isParsonsProblem: true,
      question: {
        questionText: localeCopy[es ? "es" : "en"].parsons,
        lines: ["function greet() {", "  console.log('Hello');", "}"],
        answer: ["function greet() {", "  console.log('Hello');", "}"],
      },
    },
    {
      group: "tutorial",
      title: t("Short Answer", "Respuesta Corta"),
      description: t("Enter a concise answer.", "Escribe una respuesta breve."),
      isSingleLineText: true,
      question: {
        questionText: t(
          "Which keyword declares a constant?",
          "¿Qué palabra declara una constante?",
        ),
        placeholder: t("Type your answer", "Escribe tu respuesta"),
        answer: "const",
      },
    },
    {
      group: "tutorial",
      title: t("Open Response", "Respuesta Abierta"),
      description: t(
        "Explain an idea in your own words.",
        "Explica una idea con tus propias palabras.",
      ),
      isText: true,
      question: {
        questionText: t(
          "Why are variables useful?",
          "¿Por qué son útiles las variables?",
        ),
      },
    },
    {
      group: "tutorial",
      title: t("Code Writing", "Escritura de Código"),
      description: t(
        "Create code from a requirement.",
        "Crea código a partir de un requisito.",
      ),
      isCode: true,
      isTerminal: false,
      question: {
        questionText: t(
          "Declare a variable named age with the value 25.",
          "Declara una variable llamada age con el valor 25.",
        ),
      },
    },
    {
      group: "tutorial",
      title: t("Terminal Practice", "Práctica de Terminal"),
      description: t(
        "Practice a command in context.",
        "Practica un comando en contexto.",
      ),
      isCode: true,
      isTerminal: true,
      question: {
        questionText: t(
          "Change into the new_folder directory.",
          "Cambia al directorio new_folder.",
        ),
      },
    },
    {
      group: "tutorial",
      title: t(
        "Choose the Best Implementation",
        "Elegir la Mejor Implementación",
      ),
      description: t(
        "Compare ways to handle every item in a list.",
        "Compara formas de procesar cada elemento de una lista.",
      ),
      isBestImplementation: true,
      question: {
        questionText: t(
          "You have an array named items and a function named printItem. Which implementation prints every item and continues to work if the array grows or shrinks?",
          "Tienes un arreglo llamado items y una función llamada printItem. ¿Qué implementación imprime cada elemento y sigue funcionando si el arreglo crece o se reduce?",
        ),
        options: [
          "items.forEach(printItem);",
          "printItem(items[0]); printItem(items[1]);",
          "items = printItem;",
        ],
        answer: "items.forEach(printItem);",
      },
    },
    {
      group: "tutorial",
      title: t("Fix the Bug", "Corregir el Error"),
      description: t("Repair broken code.", "Repara código defectuoso."),
      isFixBug: true,
      question: {
        questionText: localeCopy[es ? "es" : "en"].fix,
        starterCode: "const score = 1;\nscore += 1;",
        answer: "let score = 1;\nscore += 1;",
        tests: [t("score can be updated", "score se puede actualizar")],
      },
    },
    {
      group: "tutorial",
      title: t("Refactoring Challenge", "Reto de Refactorización"),
      description: t(
        "Improve code without changing the result.",
        "Mejora el código sin cambiar el resultado.",
      ),
      isRefactoringChallenge: true,
      question: {
        questionText: localeCopy[es ? "es" : "en"].refactor,
        starterCode: "console.log(1);\nconsole.log(2);\nconsole.log(3);",
        tests: [
          t("Still prints 1, 2, and 3", "Aún imprime 1, 2 y 3"),
          t("Uses a loop", "Usa un ciclo"),
        ],
      },
    },
    {
      group: "tutorial",
      title: t("Mini-project Checkpoint", "Punto de Control del Mini-Proyecto"),
      description: t(
        "Name the small application you will build.",
        "Nombra la pequeña aplicación que construirás.",
      ),
      isProjectCheckpoint: true,
      question: {
        questionText: t(
          "Replace the empty string in the starter code with a name for your app. For example: const appName = 'Study Buddy';",
          "Reemplaza la cadena vacía del código inicial con un nombre para tu aplicación. Por ejemplo: const appName = 'Compañero de Estudio';",
        ),
        projectId: "tutorial-app",
        checkpointId: t("Name your app", "Nombra tu aplicación"),
        starterCode: "const appName = '';",
        tests: [
          t(
            "appName contains a non-empty name",
            "appName contiene un nombre que no está vacío",
          ),
        ],
      },
    },
    {
      group: "tutorial",
      title: t(
        "Build Your App",
        "Construye tu Aplicación",
      ),
      description: t(
        "Build an app with what you learned in this chapter.",
        "Construye una aplicación con lo aprendido en este capítulo.",
      ),
      isConversationReview: true,
      question: {
        questionText: t(
          "Enter an app idea and build it as you make progress!",
          "¡Ingresa una idea de aplicación y constrúyela a medida que avanzas!",
        ),
        range: [],
      },
    },
  ];

  steps.forEach((step) => {
    if (Object.values(TARGET_FLAGS).some((flag) => step[flag])) {
      delete step.description;
    }
  });

  return steps;
};

const updateConversationRanges = (courseSteps) => {
  const groups = new Map();
  courseSteps.forEach((step, index) => {
    const group = String(step?.group || "");
    if (!group || group === "introduction") return;
    const indices = groups.get(group) || [];
    indices.push(index);
    groups.set(group, indices);
  });
  courseSteps.forEach((step) => {
    if (!step?.isConversationReview || !step.question) return;
    const indices = groups.get(String(step.group)) || [];
    step.question.range = indices.length
      ? [indices[0], indices[indices.length - 1]]
      : [];
  });
};

export const revampCourse = (courseSteps, locale) => {
  if (!Array.isArray(courseSteps) || courseSteps.__curriculumRevamped)
    return courseSteps;
  applyChapterConversions(courseSteps, locale);
  const firstTutorial = courseSteps.findIndex(
    (step) => step?.group === "tutorial",
  );
  if (firstTutorial >= 0) {
    let tutorialCount = 0;
    while (courseSteps[firstTutorial + tutorialCount]?.group === "tutorial")
      tutorialCount += 1;
    courseSteps.splice(firstTutorial, tutorialCount, ...tutorialSteps(locale));
  }
  updateConversationRanges(courseSteps);
  Object.defineProperty(courseSteps, "__curriculumRevamped", { value: true });
  return courseSteps;
};

export const getTutorialEndIndex = (courseSteps) => {
  let lastTutorialIndex = -1;
  courseSteps.forEach((step, index) => {
    if (step?.group === "tutorial") lastTutorialIndex = index;
  });
  return lastTutorialIndex;
};
