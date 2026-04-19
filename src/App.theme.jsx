import {
  Box,
  Heading,
  ListItem,
  Text,
  UnorderedList,
  useColorMode,
} from "@chakra-ui/react";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  getThemedCodeBlockStyles,
  getThemedSyntaxHighlightTheme,
} from "./theme";

export const newTheme = {
  p: (props) => <Text mb={2} lineHeight="1.6" {...props} />,
  ul: (props) => <UnorderedList pl={6} spacing={2} {...props} />,
  ol: (props) => <UnorderedList as="ol" pl={6} spacing={2} {...props} />,
  li: (props) => <ListItem mb={1} {...props} />,
  h1: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h2: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h3: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  code: ({ inline, className, children, ...props }) => {
    const { colorMode } = useColorMode();
    const match = /language-(\w+)/.exec(className || "");

    return !inline && match ? (
      <SyntaxHighlighter
        language={match[1]}
        PreTag="div"
        style={getThemedSyntaxHighlightTheme(colorMode)}
        customStyle={getThemedCodeBlockStyles(colorMode)}
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <Box
        as="code"
        backgroundColor="appCodeInlineBg"
        color="appCodeColor"
        p={1}
        borderRadius="md"
        fontSize="sm"
        {...props}
      >
        {children}
      </Box>
    );
  },
};
