// src/components/CodeEditor.jsx
import React from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-javascript";

import "prismjs/components/prism-markup";
import "prismjs/themes/prism.css";
import "./editor-scroll-fix.css";

export default function CodeEditor({ value, onChange, height = 400 }) {
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
          highlight(code, languages.javascript, "javascript")
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
}
