import React from "react";
import {
  Box,
  Heading,
  Text,
  UnorderedList,
  ListItem,
  HStack,
} from "@chakra-ui/react";
import { translation } from "../../utility/translation";

/**
 * TechOverview
 *
 * Displays technology details based on the selected language.
 * If a language's curriculum hasn't been fleshed out yet, a placeholder is shown.
 */
export const TechOverview = ({ userLanguage }) => {
  const difficultyMap = {
    en: 1,
    "py-en": 3,
    "android-en": 2,
    "swift-en": 2,
    es: 1,
    "compsci-en": 4,
  };

  const currentDifficulty = difficultyMap[userLanguage] || 0;

  const colorMap = {
    1: "green.400",
    2: "yellow.400",
    3: "orange.400",
    4: "red.400",
  };
  const activeColor = colorMap[currentDifficulty] || "teal.400";
  const content = {
    /** ───────────────────────── JavaScript Track (en / es) ───────────────────── */
    en: {
      heading: "Why JavaScript? (Recommended)",
      description:
        "JavaScript is the language of the web. It lets you build web apps, social media experiences, mobile apps and more that work on any device. This helps you go from idea to product to distribution smoothly.",
      core: "JavaScript, React, Firebase",

      lists: {
        languages: [
          {
            name: "JavaScript",
            description:
              "Lets you build interactive web pages, games, and apps.",
          },
          {
            name: "HTML / JSX",
            description: "A markup language to define user interface elements.",
          },
          {
            name: "CSS",
            description:
              "Styles your web pages to look attractive and responsive on any device.",
          },
          {
            name: "Bash / Shell",
            description:
              "A way to directly communicate with your computer or outside systems.",
          },
        ],
        frameworks: [
          {
            name: "React",
            description: "The JavaScript library for building user interfaces.",
          },
          {
            name: "Chakra UI",
            description:
              "One of mny modular React component libraries to use pre-made user interface elements.",
          },
          {
            name: "Vite",
            description:
              "A fast build tool to quickly setup light react projects",
          },
          {
            name: "Firebase SDK",
            description:
              "A library used to connect and use out-of-the-box to backend services like authenticating users, storing data, hosting applications or using AI.",
          },
        ],
        devTools: [
          {
            name: "Node.js",
            description:
              "A way to run JavaScript on your computer to build apps and tools.",
          },
          {
            name: "npm",
            description:
              "A tool to help you install, update, and manage JavaScript programs that your project needs.",
          },
          {
            name: "VS Code",
            description:
              "Write and debug your code efficiently with a powerful, extensible editor.",
          },
          {
            name: "Git CLI & GitHub",
            description:
              "Version control tools for managing code and collaboration with others.",
          },
          {
            name: "Firebase CLI",
            description:
              "Command-line tools to interact with Firebase projects.",
          },
          {
            name: "Vercel",
            description:
              "A platform for deploying Javascript applications and sites.",
          },
          {
            name: "Terminal basics",
            description:
              "Essential commands for navigating and managing the filesystem.",
          },
        ],
      },
    },

    /** ───────────────────────── Python Track (py‑en) ─────────────────────────── */
    "py-en": {
      heading: "Why Python?",
      description:
        "Python is used to build backend systems and pipelines for data. Many large and complex systems will use python behind-the-scenes to prepare and organize data for usage.",
      core: "Python, Flask, React, SQL, Firebase",
      lists: {
        languages: [
          {
            name: "Python",
            description:
              "Write scripts and back-end code to power web services and automate tasks.",
          },
          {
            name: "Bash / Shell",
            description:
              "Run commands and scripts to manage computers, servers and projects.",
          },
          {
            name: "SQL (PostgreSQL)",
            description:
              "Store and query structured data in a powerful relational database.",
          },
          {
            name: "JavaScript / JSX (front‑end React)",
            description:
              "Build interactive front-ends that talk to your Python back-end.",
          },
        ],
        frameworks: [
          {
            name: "Flask",
            description:
              "Quickly connect to systems and web services in Python.",
          },
          {
            name: "Django",
            description:
              "Build full-featured web apps with authentication, admin panels, and more.",
          },
          {
            name: "SQLAlchemy",
            description:
              "Map your Python objects to database tables without writing SQL by hand.",
          },
          {
            name: "pandas",
            description:
              "Clean, analyze, and reshape data tables for reports and insights.",
          },
          {
            name: "React",
            description: "A JavaScript library for building user interfaces.",
          },

          {
            name: "Vite",
            description:
              "A fast build tool and development server for modern web projects.",
          },
          {
            name: "Firebase Admin SDK",
            description:
              "Server-side library for interacting with pre-made backend services.",
          },
          {
            name: "PyJWT",
            description:
              "A library to encode and decode JSON Web Tokens in Python.",
          },
          {
            name: "Gunicorn",
            description: "A Python WSGI HTTP server for UNIX.",
          },
        ],
        devTools: [
          {
            name: "pip",
            description:
              "Tools for installing packages and creating isolated Python environments.",
          },
          {
            name: "Node.js / npm",
            description:
              "A JavaScript runtime and package manager for frontend tooling.",
          },
          {
            name: "VS Code",
            description:
              "A lightweight source code editor with extensive plugin support.",
          },
          {
            name: "Git CLI & GitHub",
            description:
              "Version control tools for managing code and collaboration.",
          },
          {
            name: "Firebase CLI",
            description:
              "Command-line tools to interact with Firebase projects.",
          },
          {
            name: "PostgreSQL / psycopg2",
            description:
              "A relational database and its Python adapter library.",
          },
          {
            name: "Terminal",
            description:
              "Essential commands for navigating and managing the filesystem.",
          },
        ],
      },
    },

    /** ───────────────────────── Swift Track (swift‑en) ───────────────────────── */
    "swift-en": {
      heading: "Why Swift & iOS?",
      description:
        "Swift powers everything from Apple‑watch widgets to enterprise-grade iPhone apps. It's Apple's programming language to build on top of any iOS systems.",
      core: "Swift, SwiftUI, Vapor, Firebase",
      lists: {
        languages: [
          {
            name: "Swift",
            description: "A modern language for iOS, macOS, and beyond.",
          },
          {
            name: "SwiftUI",
            description:
              "A declarative framework for building UI across Apple platforms.",
          },
          {
            name: "Bash / Shell",
            description:
              "Command language for interacting with Unix-based systems.",
          },
          {
            name: "SQL (PostgreSQL via Fluent)",
            description:
              "Structured query language integrated with Fluent ORM.",
          },
        ],
        frameworks: [
          {
            name: "SwiftUI",
            description: "A declarative UI framework for Apple platforms.",
          },
          {
            name: "Vapor (server‑side Swift)",
            description: "A server-side Swift web framework for building APIs.",
          },
          {
            name: "Fluent ORM",
            description: "An ORM for fluent database interactions in Swift.",
          },
          {
            name: "Firebase iOS SDK (Auth, Firestore, Storage, Functions, Analytics)",
            description: "Client library for Firebase services on iOS.",
          },
          {
            name: "CocoaPods / Swift Package Manager",
            description: "Dependency managers for Swift projects.",
          },
        ],
        devTools: [
          {
            name: "Xcode",
            description: "Apple's IDE for developing across all its platforms.",
          },
          {
            name: "SwiftPM",
            description:
              "Swift Package Manager for managing Swift dependencies.",
          },
          {
            name: "Homebrew",
            description: "A package manager for macOS to install software.",
          },
          {
            name: "CocoaPods",
            description:
              "A dependency manager for Swift and Objective-C Cocoa projects.",
          },
          {
            name: "Vapor Toolbox",
            description:
              "CLI tools for creating and managing Vapor applications.",
          },
          {
            name: "Firebase CLI",
            description:
              "Command-line tools to interact with Firebase projects.",
          },
          {
            name: "Terminal basics",
            description:
              "Essential commands for navigating and managing the filesystem.",
          },
        ],
      },
    },

    /** ───────────────────────── Android Track (android‑en) ──────────────────── */
    "android-en": {
      heading: "Why Java & Android?",
      description:
        "Java powers billions of phones, TVs, and cars. Mastering Java plus the Android toolset lets you publish apps on Google Play, connect to cloud backends, and even participate in open systems with robotics.",
      core: "Java, Android, Spring Boot, Firebase",
      lists: {
        languages: [
          {
            name: "Java",
            description: "A class-based, object-oriented programming language.",
          },
          {
            name: "XML",
            description:
              "Markup language for defining Android interfaces and layouts.",
          },
          {
            name: "Bash / Shell",
            description:
              "Command language for interacting with Unix-based operating systems.",
          },
          {
            name: "SQL",
            description:
              "Structured query language operate and manage databases.",
          },
        ],
        frameworks: [
          {
            name: "Android SDK & Jetpack",
            description: "Official libraries for building Android apps.",
          },
          {
            name: "Retrofit",
            description:
              "Type-safe HTTP client and network library for Android.",
          },

          {
            name: "Firebase Android SDK (Auth, Firestore, Storage, Functions, Analytics)",
            description:
              "Client library for out-of-the-box backend services on Android.",
          },
          {
            name: "Gradle Build System",
            description: "Build automation tool used by Android projects.",
          },
          {
            name: "Spring Boot (backend track)",
            description:
              "A Java-based framework for creating backend microservices.",
          },
        ],
        devTools: [
          {
            name: "Android Studio",
            description: "Official studio for Android development.",
          },
          {
            name: "Java JDK",
            description:
              "Development kits for compiling and running Java applications.",
          },
          {
            name: "Gradle CLI",
            description: "Command-line interface for the Gradle build system.",
          },
          {
            name: "Firebase CLI",
            description:
              "Command-line tools to interact with Firebase projects.",
          },
          {
            name: "Terminal basics",
            description:
              "Essential commands for navigating operating systems and managing files.",
          },
        ],
      },
    },

    /** ─────── Computer Science Track (compsci-en) ─────── */
    "compsci-en": {
      heading: "Why Python for Computer Science?",
      description:
        "Practice and learn the foundations of computer science to gain a deeper understanding of how software systems work.",
      core: "Python, Data Structures, Algorithms, Operating Systems",
      lists: {
        languages: [
          {
            name: "Python",
            description:
              "High-level language used throughout the course for lists, trees, sorting, searching, graph traversals and file I/O.",
          },
        ],
        frameworks: [
          {
            name: "Foundations of Data Structures",
            description:
              "Understand what data structures are, why Big-O matters, and how memory layout drives performance.",
          },
          {
            name: "Linear Structures: Arrays, Lists, Stacks & Queues",
            description:
              "Learn the go-to ways of storing items in order and build stacks and queues while weighing time-space trade-offs.",
          },
          {
            name: "Hierarchical & Associative Structures: Trees, Heaps & Hash Tables",
            description:
              "Organize data for fast lookups and prioritization using trees, heaps, and hash tables.",
          },
          {
            name: "Core Algorithms: Sorting, Searching & Graph Traversal",
            description:
              "Practice the classic searching, sorting, and graph-traversal techniques that power real-world software.",
          },
          {
            name: "Operating Systems Essentials",
            description:
              "Peek under the hood to see how processes, memory, and file I/O are managed so your programs run smoothly and securely.",
          },
        ],

        // devTools: [
        //   {
        //     name: "Python REPL",
        //     description:
        //       "Interactive shell for stepping through your code snippets and inspecting data structures.",
        //   },
        // ],
      },
    },

    /** ───────────────────────── JavaScript Track – Spanish (es) ─────────────── */
    es: {
      heading: "¿Por qué JavaScript? (Recomendado)",
      description:
        "JavaScript es el lenguaje de la web. Te permite crear aplicaciones web, experiencias en redes sociales, aplicaciones móviles y más que funcionan en cualquier dispositivo. Esto te ayuda a pasar de la idea al producto y a la distribución sin problemas.",
      core: "JavaScript, React, Firebase",

      lists: {
        languages: [
          {
            name: "JavaScript",
            description:
              "Te permite crear páginas web interactivas, juegos y aplicaciones.",
          },
          {
            name: "HTML / JSX",
            description:
              "Un lenguaje de marcado para definir elementos de la interfaz de usuario.",
          },
          {
            name: "CSS",
            description:
              "Da estilo a tus páginas web para que sean atractivas y adaptables en cualquier dispositivo.",
          },
          {
            name: "Bash / Shell",
            description:
              "Una forma de comunicarte directamente con tu computadora o con sistemas externos.",
          },
        ],
        frameworks: [
          {
            name: "React",
            description:
              "La biblioteca de JavaScript para construir interfaces de usuario.",
          },
          {
            name: "Chakra UI",
            description:
              "Una de las muchas bibliotecas modulares de componentes de React para usar elementos de interfaz de usuario prefabricados.",
          },
          {
            name: "Vite",
            description:
              "Una herramienta de construcción rápida para configurar proyectos ligeros de React.",
          },
          {
            name: "Firebase SDK",
            description:
              "Una biblioteca para conectar y usar servicios de backend como autenticación de usuarios, almacenamiento de datos, alojamiento de aplicaciones o IA.",
          },
        ],
        devTools: [
          {
            name: "Node.js",
            description:
              "Una forma de ejecutar JavaScript en tu computadora para crear aplicaciones y herramientas.",
          },
          {
            name: "npm",
            description:
              "Una herramienta para instalar, actualizar y gestionar los paquetes de JavaScript que tu proyecto necesita.",
          },
          {
            name: "VS Code",
            description:
              "Escribe y depura tu código de forma eficiente con un editor potente y extensible.",
          },
          {
            name: "Git CLI & GitHub",
            description:
              "Herramientas de control de versiones para gestionar el código y colaborar con otros.",
          },
          {
            name: "Firebase CLI",
            description:
              "Herramientas de línea de comandos para interactuar con proyectos de Firebase.",
          },
          {
            name: "Vercel",
            description:
              "Una plataforma para desplegar aplicaciones y sitios de JavaScript.",
          },
          {
            name: "Terminal basics",
            description:
              "Comandos esenciales para navegar y gestionar el sistema de archivos.",
          },
        ],
      },
    },
  };

  console.log("userLanauge", userLanguage);
  const data = content[userLanguage] || {};

  return (
    <Box p={4}>
      <Text fontSize="lg" mb={2} fontWeight={"bold"} mt={6}>
        {data.heading || "Technology Overview"}
      </Text>

      {data.description ? (
        <Text mb={4} textAlign={"left"}>
          {data.description}
        </Text>
      ) : (
        <Text mb={4}>{data.placeholder}</Text>
      )}

      <Box mb={6}>
        <Text fontSize="md" fontWeight="bold" mb={2}>
          {translation[userLanguage]["languages.header.difficulty"]}
        </Text>
        <HStack spacing={1}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <Box
              key={idx}
              flex="1"
              height="10px"
              borderRadius="4px"
              bg={idx < currentDifficulty ? activeColor : "gray.200"}
              transition="background-color 0.2s"
              _hover={
                idx < currentDifficulty
                  ? { bg: `${activeColor.replace(".400", ".500")}` }
                  : {}
              }
            />
          ))}
        </HStack>
      </Box>

      <Text fontSize="lg" fontWeight={"bold"} mt={8}>
        {translation[userLanguage]["languages.header.subjects"]}
      </Text>
      <Text fontSize="sm">{data.core}</Text>

      {data.lists && (
        <Box textAlign={"left"}>
          {/* Languages */}
          <Text fontWeight={"bold"} fontSize="md" mt={4} mb={1}>
            {translation[userLanguage]["languages.header.languages"]}
          </Text>
          <UnorderedList mb={3} display="inline-block" fontSize="md">
            {data.lists.languages.map((item) => (
              <ListItem textAlign="left" key={item} mb={3}>
                <Text>{item.name}</Text>
                <Text fontSize="sm">{item.description}</Text>
              </ListItem>
            ))}
          </UnorderedList>

          {/* Frameworks & Libraries */}
          <Text fontWeight={"bold"} fontSize="md" mb={1}>
            {translation[userLanguage]["languages.header.frameworks"]}
          </Text>
          <UnorderedList mb={3} display="inline-block" fontSize="md">
            {data.lists.frameworks.map((item) => (
              <ListItem key={item} mb={3}>
                {" "}
                <Text>{item.name}</Text>
                <Text fontSize="sm">{item.description}</Text>
              </ListItem>
            ))}
          </UnorderedList>

          {/* Developer Tools */}
          {data.lists?.devTools ? (
            <>
              <Text fontWeight={"bold"} fontSize="md" mb={1}>
                {translation[userLanguage]["languages.header.devTools"]}
              </Text>
              <UnorderedList display="inline-block" fontSize="md">
                {data.lists.devTools.map((item) => (
                  <ListItem key={item} mb={3}>
                    {" "}
                    <Text>{item.name}</Text>
                    <Text fontSize="sm">{item.description}</Text>
                  </ListItem>
                ))}
              </UnorderedList>
            </>
          ) : null}
        </Box>
      )}
    </Box>
  );
};
