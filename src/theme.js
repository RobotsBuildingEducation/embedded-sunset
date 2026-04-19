import { extendTheme } from "@chakra-ui/react";

const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

export const appTheme = extendTheme({
  config,
  colors: {
    midnight: {
      50: "#eef4ff",
      100: "#d7e3ff",
      200: "#adc4ff",
      300: "#7c9bff",
      400: "#5878f6",
      500: "#3d59d0",
      600: "#2f45a4",
      700: "#24357d",
      800: "#1a2658",
      900: "#101836",
      950: "#050815",
    },
  },
  semanticTokens: {
    colors: {
      appBg: {
        default: "#F8F5F0",
        _dark: "#050815",
      },
      appBgMuted: {
        default: "#FBF8F5",
        _dark: "#091022",
      },
      appSurface: {
        default: "#FFFFFF",
        _dark: "#0C1528",
      },
      appSurfaceElevated: {
        default: "rgba(255,255,255,0.94)",
        _dark: "rgba(12,21,40,0.92)",
      },
      appSurfaceMuted: {
        default: "#F2EDE6",
        _dark: "#111C33",
      },
      appSurfaceGlass: {
        default: "rgba(255,255,255,0.72)",
        _dark: "rgba(16,25,46,0.72)",
      },
      appSurfaceInset: {
        default: "#ECE7DF",
        _dark: "#15213A",
      },
      appSurfaceStrong: {
        default: "#E9E2D8",
        _dark: "#1B2945",
      },
      appBorder: {
        default: "rgba(104,85,64,0.15)",
        _dark: "rgba(148,163,184,0.18)",
      },
      appBorderStrong: {
        default: "rgba(104,85,64,0.26)",
        _dark: "rgba(148,163,184,0.30)",
      },
      appText: {
        default: "#201B16",
        _dark: "#ECF2FF",
      },
      appTextMuted: {
        default: "#5E564C",
        _dark: "#A9B8D7",
      },
      appTextSubtle: {
        default: "#7B7166",
        _dark: "#7887A7",
      },
      appCodeBg: {
        default: "#F4F2F0",
        _dark: "#111B30",
      },
      appCodeInlineBg: {
        default: "#EDE7E0",
        _dark: "#18233D",
      },
      appCodeColor: {
        default: "#14110E",
        _dark: "#F5F7FF",
      },
      appOverlay: {
        default: "rgba(255,255,255,0.78)",
        _dark: "rgba(3,8,20,0.74)",
      },
      appToastBg: {
        default: "#FEEBC8",
        _dark: "#172744",
      },
      appToastColor: {
        default: "#1B1409",
        _dark: "#EEF4FF",
      },
      appAccentSoft: {
        default: "pink.50",
        _dark: "rgba(255,255,255,0.08)",
      },
      appAccentMuted: {
        default: "pink.100",
        _dark: "rgba(255,255,255,0.12)",
      },
      appAccentStrong: {
        default: "pink.300",
        _dark: "pink.400",
      },
      appSuccessSubtle: {
        default: "#F0FFF4",
        _dark: "rgba(52,211,153,0.15)",
      },
      appErrorSubtle: {
        default: "#FFF5F5",
        _dark: "rgba(248,113,113,0.16)",
      },
      appWarningSubtle: {
        default: "#FFFAF0",
        _dark: "rgba(251,191,36,0.16)",
      },
      appInfoSubtle: {
        default: "#EBF8FF",
        _dark: "rgba(96,165,250,0.16)",
      },
      appScrollThumb: {
        default: "#D8D2CA",
        _dark: "#223250",
      },
      appScrollTrack: {
        default: "#ECE7DF",
        _dark: "#0B1221",
      },
      appHeroBackdrop: {
        default: "rgba(255,255,255,0.68)",
        _dark: "rgba(8,12,24,0.5)",
      },
    },
  },
  components: {
    Modal: {
      baseStyle: {
        overlay: {
          bg: "appOverlay",
          backdropFilter: "blur(8px)",
        },
        dialog: {
          bg: "appSurfaceElevated",
          color: "appText",
          borderWidth: "1px",
          borderColor: "appBorder",
          boxShadow: "2xl",
          backdropFilter: "blur(18px)",
        },
        header: {
          color: "appText",
        },
        body: {
          color: "appText",
        },
        closeButton: {
          color: "appTextMuted",
          _hover: {
            bg: "appSurfaceMuted",
          },
        },
        footer: {
          bg: "transparent",
        },
      },
    },
    Drawer: {
      baseStyle: {
        overlay: {
          bg: "appOverlay",
          backdropFilter: "blur(8px)",
        },
        dialog: {
          bg: "appSurfaceElevated",
          color: "appText",
          borderColor: "appBorder",
        },
        header: {
          color: "appText",
        },
        body: {
          color: "appText",
        },
        closeButton: {
          color: "appTextMuted",
          _hover: {
            bg: "appSurfaceMuted",
          },
        },
      },
    },
    Menu: {
      baseStyle: {
        list: {
          bg: "appSurfaceElevated",
          borderColor: "appBorder",
          boxShadow: "xl",
          py: 2,
          backdropFilter: "blur(18px)",
        },
        item: {
          bg: "transparent",
          color: "appText",
          _hover: {
            bg: "appSurfaceMuted",
          },
          _focus: {
            bg: "appSurfaceMuted",
          },
        },
        divider: {
          borderColor: "appBorder",
        },
      },
    },
    Popover: {
      baseStyle: {
        content: {
          bg: "appSurfaceElevated",
          color: "appText",
          borderColor: "appBorder",
          boxShadow: "xl",
          backdropFilter: "blur(18px)",
        },
        header: {
          borderBottomColor: "appBorder",
        },
        body: {
          color: "appText",
        },
        closeButton: {
          color: "appTextMuted",
          _hover: {
            bg: "appSurfaceMuted",
          },
        },
        arrow: {
          bg: "appSurfaceElevated",
        },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            bg: "appSurface",
            borderColor: "appBorder",
            color: "appText",
            _placeholder: {
              color: "appTextSubtle",
            },
            _hover: {
              borderColor: "appBorderStrong",
            },
            _focusVisible: {
              bg: "appSurfaceElevated",
              borderColor: "pink.400",
              boxShadow: "0 0 0 1px var(--chakra-colors-pink-400)",
            },
          },
        },
      },
    },
    Textarea: {
      variants: {
        outline: {
          bg: "appSurface",
          borderColor: "appBorder",
          color: "appText",
          _placeholder: {
            color: "appTextSubtle",
          },
          _hover: {
            borderColor: "appBorderStrong",
          },
          _focusVisible: {
            bg: "appSurfaceElevated",
            borderColor: "pink.400",
            boxShadow: "0 0 0 1px var(--chakra-colors-pink-400)",
          },
        },
      },
    },
    Select: {
      variants: {
        outline: {
          field: {
            bg: "appSurface",
            borderColor: "appBorder",
            color: "appText",
            _placeholder: {
              color: "appTextSubtle",
            },
            _hover: {
              borderColor: "appBorderStrong",
            },
            _focusVisible: {
              bg: "appSurfaceElevated",
              borderColor: "pink.400",
              boxShadow: "0 0 0 1px var(--chakra-colors-pink-400)",
            },
          },
          icon: {
            color: "appTextMuted",
          },
        },
      },
    },
    Accordion: {
      baseStyle: {
        button: {
          _hover: {
            bg: "appSurfaceMuted",
          },
        },
        panel: {
          color: "appText",
        },
      },
    },
  },
  styles: {
    global: {
      "html, body, #root": {
        minHeight: "100%",
      },
      body: {
        background: "appBg",
        color: "appText",
        transitionProperty: "background-color, color, border-color, box-shadow",
        transitionDuration: "220ms",
      },
      "*::placeholder": {
        color: "var(--chakra-colors-appTextSubtle)",
      },
      "::selection": {
        background: "rgba(237, 100, 166, 0.28)",
      },
    },
  },
});

export const getThemedCodeBlockStyles = (colorMode = "light") => ({
  backgroundColor: colorMode === "dark" ? "#0D1730" : "#F4F2F0",
  color: colorMode === "dark" ? "#F7FAFF" : "#14110E",
  padding: "1.1rem 1.2rem",
  borderRadius: "18px",
  fontSize: 14,
  lineHeight: 1.7,
  fontFamily:
    '"Fira Code", "SFMono-Regular", Menlo, Monaco, Consolas, monospace',
  margin: 0,
  overflowX: "auto",
  textShadow: "none",
  border:
    colorMode === "dark"
      ? "1px solid rgba(148,163,184,0.22)"
      : "1px solid rgba(104,85,64,0.12)",
  boxShadow:
    colorMode === "dark"
      ? "0 18px 42px rgba(2, 6, 23, 0.34)"
      : "0 14px 28px rgba(15, 23, 42, 0.08)",
});

export const getThemedSyntaxHighlightTheme = (colorMode = "light") => {
  const dark = colorMode === "dark";

  return {
    'code[class*="language-"]': {
      color: dark ? "#F7FAFF" : "#14110E",
      background: "transparent",
      textShadow: "none",
      fontFamily:
        '"Fira Code", "SFMono-Regular", Menlo, Monaco, Consolas, monospace',
      fontSize: "14px",
      lineHeight: "1.7",
    },
    'pre[class*="language-"]': {
      color: dark ? "#F7FAFF" : "#14110E",
      background: "transparent",
      textShadow: "none",
      fontFamily:
        '"Fira Code", "SFMono-Regular", Menlo, Monaco, Consolas, monospace',
      fontSize: "14px",
      lineHeight: "1.7",
      margin: 0,
    },
    comment: {
      color: dark ? "#7D8AA8" : "slategray",
      fontStyle: dark ? "italic" : "normal",
    },
    prolog: {
      color: dark ? "#7D8AA8" : "slategray",
    },
    doctype: {
      color: dark ? "#7D8AA8" : "slategray",
    },
    cdata: {
      color: dark ? "#7D8AA8" : "slategray",
    },
    punctuation: {
      color: dark ? "#9FB0D4" : "#999",
    },
    namespace: {
      opacity: 0.7,
    },
    property: {
      color: dark ? "#C4B5FD" : "#905",
    },
    tag: {
      color: dark ? "#C4B5FD" : "#905",
    },
    boolean: {
      color: dark ? "#8EA4FF" : "#905",
    },
    number: {
      color: dark ? "#F8C27A" : "#905",
    },
    constant: {
      color: dark ? "#F8C27A" : "#905",
    },
    symbol: {
      color: dark ? "#F8C27A" : "#905",
    },
    deleted: {
      color: dark ? "#FB7185" : "#905",
    },
    selector: {
      color: dark ? "#86EFC5" : "#690",
    },
    "attr-name": {
      color: dark ? "#86EFC5" : "#690",
    },
    string: {
      color: dark ? "#86EFC5" : "#690",
    },
    char: {
      color: dark ? "#86EFC5" : "#690",
    },
    builtin: {
      color: dark ? "#86EFC5" : "#690",
    },
    inserted: {
      color: dark ? "#86EFC5" : "#690",
    },
    operator: {
      color: dark ? "#CBD5F5" : "#9A6E3A",
      background: "transparent",
    },
    entity: {
      color: dark ? "#CBD5F5" : "#9A6E3A",
      background: "transparent",
      cursor: "help",
    },
    url: {
      color: dark ? "#CBD5F5" : "#9A6E3A",
      background: "transparent",
    },
    atrule: {
      color: dark ? "#8EA4FF" : "#07A",
    },
    "attr-value": {
      color: dark ? "#86EFC5" : "#07A",
    },
    keyword: {
      color: dark ? "#8EA4FF" : "#07A",
    },
    function: {
      color: dark ? "#7DD3FC" : "#DD4A68",
    },
    "class-name": {
      color: dark ? "#7DD3FC" : "#DD4A68",
    },
    regex: {
      color: dark ? "#F8C27A" : "#E90",
    },
    important: {
      color: dark ? "#F8C27A" : "#E90",
      fontWeight: "bold",
    },
    variable: {
      color: dark ? "#F9FAFB" : "#E90",
    },
    bold: {
      fontWeight: "bold",
    },
    italic: {
      fontStyle: "italic",
    },
  };
};
