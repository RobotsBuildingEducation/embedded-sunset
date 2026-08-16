const codeText = (children) =>
  Array.isArray(children) ? children.join("") : String(children ?? "");

export const isInlineMarkdownCode = ({ inline, className, children, node }) => {
  if (typeof inline === "boolean") return inline;
  if (/\blanguage-[\w-]+/.test(className || "")) return false;

  const startLine = node?.position?.start?.line;
  const endLine = node?.position?.end?.line;
  if (Number.isInteger(startLine) && Number.isInteger(endLine)) {
    return startLine === endLine;
  }

  return !codeText(children).includes("\n");
};

const markdownTextBlockRegexes = [
  /^#{1,6}\s+/,
  /^[-*+]\s+/,
  /^\d+[.)]\s+/,
  /^>\s+/,
  /^\*\*[^*]+/,
];

const wordRegex = /[A-Za-zÀ-ÖØ-öø-ÿ]{2,}/g;

const countWords = (value = "") => value.match(wordRegex)?.length || 0;

const stripInlineCode = (value = "") => value.replace(/`[^`]*`/g, " ");

export const isFenceLine = (line = "") => line.trim().startsWith("```");

export const trimTrailingBlankLines = (lines) => {
  const trimmed = [...lines];
  while (trimmed.length > 0 && !trimmed[trimmed.length - 1].trim()) {
    trimmed.pop();
  }
  return trimmed;
};

export const looksLikeMarkdownTextBlock = (value = "") =>
  markdownTextBlockRegexes.some((regex) => regex.test(String(value ?? "").trim()));

export const looksLikeDefiniteCodeLine = (value = "") => {
  const syntaxValue = stripInlineCode(value).trim();
  if (!syntaxValue) return false;

  return (
    // General programming & security rules keywords at the start of a statement
    // Programming keywords are case-sensitive. Keeping this expression
    // case-sensitive prevents prose such as "Let us start...", "Class names
    // are...", or "Return values..." from being mistaken for source code.
    /^(const|let|var|function|class|return|import|export|try|catch|finally|async|await|throw|new|def|func|val|struct|enum|type|interface|public|private|protected|static|override|service|match|allow|rules_version)\b/.test(
      syntaxValue,
    ) ||
    // Control flow statements
    /^(if|else|for|while|switch|case|default|do|with|yield)\s*(?:\(|{|:|$)/i.test(
      syntaxValue,
    ) ||
    // Firestore rules specific syntax
    /^allow\s+[\w,\s]+:\s*if\b/i.test(syntaxValue) ||
    /^match\s+[\w/{}$*.-]+\s*\{/i.test(syntaxValue) ||
    // Console / method calls / assignments
    /^console\./.test(syntaxValue) ||
    /^[\w$.[\]'"]+\s*=\s*.+/.test(syntaxValue) ||
    /^[\w$.]+\(.*\);?$/.test(syntaxValue) ||
    // Object property keys (single identifier / quoted property followed by colon and value)
    /^([`"'\w$]+)\s*:\s*([`"'[{(]|\d|true|false|null|undefined|[\w$])/i.test(
      syntaxValue,
    ) ||
    // JSX tags & arrows
    /=>|<\/?[A-Z_a-z][^>]*>/.test(syntaxValue) ||
    // Logical & comparison operators, increments, arrows
    /[!=]==?|&&|\|\||=>|->|\+=|-=|\*=|\/=|::/.test(syntaxValue) ||
    // Comments
    /^\s*(\/\/|\/\*|\*|\*\/|#|<!--|--)/.test(value) ||
    // Brackets, braces, punctuation only lines
    /^[{}[\](),;.]+$/.test(syntaxValue) ||
    // Ending with code punctuation like { ; ( [
    /[;{}(\[]$/.test(syntaxValue) ||
    // Known SDK objects & security rule objects
    /\b(request\.auth|request\.resource|resource\.data|document\.|window\.|process\.env)\b/.test(
      syntaxValue,
    )
  );
};

export const looksLikeProseLine = (line = "") => {
  const value = line.trim();
  if (!value) return false;
  if (looksLikeMarkdownTextBlock(value)) return true;
  if (looksLikeDefiniteCodeLine(value)) return false;

  // If line ends with code punctuation, contains code operators, or has code keywords, it is not prose
  if (/[;{(\[]$/.test(value)) return false;
  if (/[!=]==?|&&|\|\||=>|->|\+=|-=/.test(value)) return false;

  const withoutInlineCode = stripInlineCode(value);
  const proseWords = countWords(withoutInlineCode);
  const hasInlineCode = /`[^`]+`/.test(value);
  const hasSentencePunctuation = /[.!?](?:\s|$)|[,;:]\s/.test(
    withoutInlineCode,
  );
  const startsLikeSentence = /^[A-ZÀ-ÖØ-Þ¿¡]/.test(withoutInlineCode);

  return (
    proseWords >= 6 ||
    (proseWords >= 4 &&
      (hasInlineCode || hasSentencePunctuation || startsLikeSentence)) ||
    (hasInlineCode && proseWords >= 2) ||
    (proseWords >= 2 && hasSentencePunctuation && startsLikeSentence)
  );
};

export const looksLikeCodeContinuation = (line = "") => {
  const value = line.trim();
  if (!value || looksLikeMarkdownTextBlock(value)) return false;
  if (looksLikeDefiniteCodeLine(value)) return true;
  if (looksLikeProseLine(value)) return false;

  return (
    /^[}\])]/.test(value) ||
    /^(&&|\|\||[+\-*/%?:]|\.)/.test(value) ||
    /^[\w$]+\s*:/.test(value) ||
    /[,;]$/.test(value) ||
    /^[+\-*/%]?=/.test(value) ||
    // Indented lines (e.g. 2+ spaces or tab at start of line)
    /^\s{2,}|\t/.test(line)
  );
};

export const looksLikeLooseCode = (line = "") => {
  const value = line.trim();
  if (!value) return false;
  if (looksLikeMarkdownTextBlock(value)) return false;
  if (looksLikeDefiniteCodeLine(value)) return true;
  if (looksLikeProseLine(value)) return false;

  return (
    /^[{}[\](),;]+$/.test(value) ||
    (/[;{}]/.test(value) && !looksLikeProseLine(value))
  );
};

export const repairFencedMarkdown = (openingLine, bodyLines) => {
  if (!Array.isArray(bodyLines) || bodyLines.length === 0) {
    return [openingLine, "```"];
  }

  let braceDepth = 0;
  const lineTypes = bodyLines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return { type: "blank", line };

    const opens = (trimmed.match(/{/g) || []).length;
    const closes = (trimmed.match(/}/g) || []).length;

    if (looksLikeMarkdownTextBlock(trimmed)) {
      braceDepth = Math.max(0, braceDepth + opens - closes);
      return { type: "text", line };
    }

    if (looksLikeDefiniteCodeLine(trimmed) || looksLikeCodeContinuation(line)) {
      braceDepth = Math.max(0, braceDepth + opens - closes);
      return { type: "code", line };
    }

    // Even inside an accidentally unclosed code scope, a clear explanatory
    // sentence should render as prose. Definite code was checked first, so
    // declarations and statements containing human-readable strings remain
    // safely inside the code block.
    if (looksLikeProseLine(trimmed)) {
      braceDepth = Math.max(0, braceDepth + opens - closes);
      return { type: "text", line };
    }

    if (braceDepth > 0) {
      braceDepth = Math.max(0, braceDepth + opens - closes);
      return { type: "code", line };
    }

    braceDepth = Math.max(0, braceDepth + opens - closes);
    return { type: "code", line };
  });

  const segments = [];
  let currentType = null;
  let currentLines = [];

  const pushSegment = () => {
    if (currentLines.length < 1) return;
    segments.push({ type: currentType, lines: [...currentLines] });
    currentType = null;
    currentLines = [];
  };

  lineTypes.forEach(({ type, line }) => {
    if (type === "blank") {
      if (currentType) {
        currentLines.push(line);
      }
      return;
    }

    if (currentType && currentType !== type) {
      pushSegment();
    }

    if (!currentType) {
      currentType = type;
    }

    currentLines.push(line);
  });

  pushSegment();

  if (!segments.some((s) => s.type === "text")) {
    return [openingLine, ...bodyLines, "```"];
  }

  return segments.flatMap((segment, index) => {
    if (segment.type === "text") {
      const textLines = trimTrailingBlankLines(segment.lines);
      if (textLines.length === 0) return [];
      if (index > 0 && segments[index - 1].type === "code") {
        return ["", ...textLines];
      }
      return textLines;
    }
    const trimmedCode = trimTrailingBlankLines(segment.lines);
    if (trimmedCode.length === 0) return [];
    if (index > 0 && segments[index - 1].type === "text") {
      return ["", openingLine, ...trimmedCode, "```"];
    }
    return [openingLine, ...trimmedCode, "```"];
  });
};

export const normalizeLearnMarkdown = (content = "") => {
  const lines = String(content || "")
    .trimStart()
    .split("\n");
  const output = [];
  let inFence = false;
  let fenceOpeningLine = "";
  let fenceBodyLines = [];
  let inLooseCode = false;
  let looseCodeBraceDepth = 0;

  const closeLooseCode = () => {
    if (!inLooseCode) return;
    output.push("```");
    inLooseCode = false;
    looseCodeBraceDepth = 0;
  };

  const appendContentLine = (line) => {
    const trimmed = line.trim();
    const opens = (trimmed.match(/{/g) || []).length;
    const closes = (trimmed.match(/}/g) || []).length;

    const isCode =
      (looseCodeBraceDepth > 0 && !looksLikeMarkdownTextBlock(trimmed)) ||
      looksLikeLooseCode(line) ||
      (inLooseCode && looksLikeCodeContinuation(line));

    if (isCode) {
      if (!inLooseCode) {
        output.push("```javascript");
        inLooseCode = true;
      }
      looseCodeBraceDepth = Math.max(0, looseCodeBraceDepth + opens - closes);
      output.push(line);
      return;
    }

    closeLooseCode();
    output.push(line);
  };

  const closeFence = () => {
    output.push(...repairFencedMarkdown(fenceOpeningLine, fenceBodyLines));
    inFence = false;
    fenceOpeningLine = "";
    fenceBodyLines = [];
  };

  lines.forEach((line) => {
    if (isFenceLine(line)) {
      closeLooseCode();

      if (inFence) {
        closeFence();
      } else {
        inFence = true;
        fenceOpeningLine = line;
        fenceBodyLines = [];
      }

      return;
    }

    if (inFence) {
      fenceBodyLines.push(line);
      return;
    }

    appendContentLine(line);
  });

  if (inFence) {
    closeFence();
  }

  closeLooseCode();

  return output.join("\n");
};
