// CodeEditor.jsx
import React from "react";
import Editor from "react-simple-code-editor";

// 1️⃣ pull in core + only the langs you need
import hljs from "highlight.js/lib/core";
import js from "highlight.js/lib/languages/javascript";
import java from "highlight.js/lib/languages/java";
import python from "highlight.js/lib/languages/python";
import swift from "highlight.js/lib/languages/swift";

// 2️⃣ register them
hljs.registerLanguage("javascript", js);
hljs.registerLanguage("java", java);
hljs.registerLanguage("python", python);
hljs.registerLanguage("swift", swift);

// 3️⃣ pick a style
import "highlight.js/styles/github.css";
import "./editor-scroll-fix.css";

export const CodeEditor = ({ value, onChange, height = 400, userLanguage }) => {
  const pick = {
    en: "javascript",
    es: "javascript",
    "swift-en": "swift",
    "android-en": "java",
    "py-en": "python",
  };

  return (
    <div
      className="code-editor-shell"
      style={{
        maxHeight: height,
        overflowX: "auto",
        overflowY: "auto",
      }}
    >
      <Editor
        className="editor-container"
        value={value}
        onValueChange={onChange}
        highlight={(code) =>
          // hljs returns an object with `.value` = HTML string of <span>…</span>
          hljs.highlight(code, { language: pick[userLanguage] }).value
        }
        padding={16}
        style={{
          fontFamily: "Menlo",
          fontSize: 16,
          minHeight: height,
          backgroundColor: "white",
          boxShadow: "0.5px 0.5px 1px 0px rgba(0,0,0,0.75)",
          borderRadius: 8,
        }}
      />
    </div>
  );
};
