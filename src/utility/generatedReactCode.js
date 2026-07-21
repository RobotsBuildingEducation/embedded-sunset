const REACT_HOOKS = [
  "useState",
  "useEffect",
  "useLayoutEffect",
  "useMemo",
  "useCallback",
  "useRef",
  "useReducer",
  "useContext",
  "useId",
  "useTransition",
  "useDeferredValue",
  "useImperativeHandle",
  "useSyncExternalStore",
];

const REACT_HOOK_SET = new Set(REACT_HOOKS);

export const GENERATED_REACT_RUNTIME_REQUIREMENTS = `
CRITICAL PREVIEW-RUNTIME LIMITATION FOR ALL REACT CODE:
- React and the supported UI/runtime dependencies are already in scope. Never
  import or require React or any dependency.
- Never declare, destructure, or alias React hooks. In particular, never write
  "const { useState, useEffect } = React", "const useState = React.useState",
  or any equivalent declaration.
- Never call a bare hook such as useState(...), useEffect(...), useMemo(...),
  useCallback(...), or useRef(...). Every React hook must be called directly
  through React, for example React.useState(...) and React.useEffect(...).
- Chakra components and hooks are also already provided as direct identifiers.
  Use Box, Flex, Button, useToast, and other supported names directly. Never
  write "const { Box, Button } = ChakraUI", access ChakraUI.Box, alias a Chakra
  component or hook, import from @chakra-ui/react, or render ChakraProvider.
- Before returning code, inspect every hook call and remove every hook import,
  React/Chakra destructuring statement, and alias. This renderer treats any
  redeclared runtime identifier as a syntax error.
`;

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const normalizeGeneratedReactCode = (source = "") => {
  let code = String(source);
  const hookAliases = new Map();
  const chakraAliases = new Map();

  // The preview runtime provides React and Chakra. Their imports are invalid.
  code = code.replace(
    /^\s*import\s+.+?\s+from\s+["'](?:react|@chakra-ui\/react)["'];?\s*$/gm,
    "",
  );

  // Remove hook bindings while preserving any non-hook React bindings.
  code = code.replace(
    /^\s*(?:const|let|var)\s*\{([^}]*)\}\s*=\s*React\s*;?\s*$/gm,
    (_statement, bindings) => {
      const remainingBindings = [];

      for (const rawBinding of bindings.split(",")) {
        const binding = rawBinding.trim();
        if (!binding) continue;

        const match = binding.match(
          /^([A-Za-z_$][\w$]*)(?:\s*:\s*([A-Za-z_$][\w$]*))?$/,
        );
        const sourceName = match?.[1];
        const localName = match?.[2] || sourceName;

        if (sourceName && REACT_HOOK_SET.has(sourceName)) {
          if (localName && localName !== sourceName) {
            hookAliases.set(localName, sourceName);
          }
          continue;
        }

        remainingBindings.push(binding);
      }

      return remainingBindings.length
        ? `const { ${remainingBindings.join(", ")} } = React;`
        : "";
    },
  );

  // Chakra identifiers already exist in react-live's scope. Remove generated
  // ChakraUI destructuring and remember aliases so their usages can be fixed.
  code = code.replace(
    /^\s*(?:const|let|var)\s*\{([^}]*)\}\s*=\s*ChakraUI\s*;?\s*$/gm,
    (_statement, bindings) => {
      for (const rawBinding of bindings.split(",")) {
        const binding = rawBinding.trim();
        const match = binding.match(
          /^([A-Za-z_$][\w$]*)(?:\s*:\s*([A-Za-z_$][\w$]*))?$/,
        );
        const sourceName = match?.[1];
        const localName = match?.[2] || sourceName;

        if (sourceName && localName && localName !== sourceName) {
          chakraAliases.set(localName, sourceName);
        }
      }

      return "";
    },
  );

  // Handle direct Chakra aliases, including `const Box = ChakraUI.Box`.
  code = code.replace(
    /^\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*ChakraUI\.([A-Za-z_$][\w$]*)\s*;?\s*$/gm,
    (_statement, localName, sourceName) => {
      if (localName !== sourceName) {
        chakraAliases.set(localName, sourceName);
      }
      return "";
    },
  );

  // Remove direct hook aliases such as `const useState = React.useState`.
  for (const hook of REACT_HOOKS) {
    const directAliasPattern = new RegExp(
      `^\\s*(?:const|let|var)\\s+(${escapeRegExp(
        hook,
      )})\\s*=\\s*React\\.${escapeRegExp(hook)}\\s*;?\\s*$`,
      "gm",
    );
    code = code.replace(directAliasPattern, "");
  }

  // Rewrite aliases captured from React destructuring.
  for (const [alias, hook] of hookAliases) {
    const aliasCallPattern = new RegExp(
      `(^|[^\\w$.])${escapeRegExp(alias)}\\s*\\(`,
      "g",
    );
    code = code.replace(aliasCallPattern, `$1React.${hook}(`);
  }

  // Rewrite any Chakra aliases to the direct identifiers supplied by scope.
  for (const [alias, sourceName] of chakraAliases) {
    const aliasPattern = new RegExp(`\\b${escapeRegExp(alias)}\\b`, "g");
    code = code.replace(aliasPattern, sourceName);
  }

  // Fully qualify every remaining bare React hook call.
  for (const hook of REACT_HOOKS) {
    const bareHookPattern = new RegExp(
      `(^|[^\\w$.])${escapeRegExp(hook)}\\s*\\(`,
      "g",
    );
    code = code.replace(bareHookPattern, `$1React.${hook}(`);
  }

  return code.replace(/^\s*\n/gm, "").trim();
};
