// src/components/CodeEditor.jsx
import React from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-java";
import "prismjs/components/prism-python";
import "prismjs/components/prism-swift";

import "prismjs/components/prism-markup";
import "prismjs/themes/prism.css";
import "./editor-scroll-fix.css";

export const CodeEditor = ({ value, onChange, height = 400, userLanguage }) => {
  const pickLanguage = {
    en: "javascript",
    es: "javascript",
    "swift-en": "swift",
    "android-en": "java",
    "python-en": "python",
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
          highlight(
            code,
            languages[pickLanguage[userLanguage]],
            pickLanguage[userLanguage]
          )
        }
        textareaId="simple-code-editor"
        padding={16}
        style={{
          fontFamily: "Menlo, monospace",
          fontSize: 16,
          outline: 0,
          background: "white",
          minHeight: height,
          borderRadius: "8px",
        }}
      />
    </div>
  );
};
