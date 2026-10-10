import React, { useRef } from "react";
import {
  Box,
  Button,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import policy from "../../docs/privacy-policy-draft.md?raw";

const COPY = {
  en: { title: "Privacy policy", close: "Close" },
  es: { title: "Política de privacidad", close: "Cerrar" },
  pt: { title: "Política de privacidade", close: "Fechar" },
  it: { title: "Informativa sulla privacy", close: "Chiudi" },
  fr: { title: "Politique de confidentialité", close: "Fermer" },
  de: { title: "Datenschutzrichtlinie", close: "Schließen" },
  ja: { title: "プライバシーポリシー", close: "閉じる" },
  hi: { title: "गोपनीयता नीति", close: "बंद करें" },
  ar: { title: "سياسة الخصوصية", close: "إغلاق" },
  zh: { title: "隐私政策", close: "关闭" },
};

const getCopy = (language) => COPY[String(language).split(/[-_]/)[0]] || COPY.en;

export function PrivacyPolicyModal({
  isOpen,
  onClose,
  language = "en",
  isLightTheme,
  finalFocusRef,
}) {
  const { colorMode } = useColorMode();
  const light = isLightTheme ?? colorMode === "light";
  const copy = getCopy(language);
  // Piyali reverses Chakra's gray tokens in light mode. Use paired colors
  // here so the shared modal stays readable with either app's theme.
  const colors = light
    ? { bg: "#fffdf9", text: "#2f261d", link: "#0f766e", border: "#d6c7b5", hover: "#f3eadf" }
    : { bg: "#0b1220", text: "#f1f5f9", link: "#5eead4", border: "#475569", hover: "#1f2937" };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      finalFocusRef={finalFocusRef}
      size="2xl"
      scrollBehavior="inside"
      isCentered
    >
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(3px)" />
      <ModalContent
        bg={colors.bg}
        color={colors.text}
        borderRadius="xl"
        mx={4}
        maxH="calc(100dvh - 3rem)"
      >
        <ModalHeader pr={14} color={colors.text}>{copy.title}</ModalHeader>
        <ModalCloseButton aria-label={copy.close} color={colors.text} _hover={{ bg: colors.hover }} />
        <ModalBody px={{ base: 5, md: 8 }} color={colors.text}>
          <Box
            lang="en"
            dir="ltr"
            textAlign="left"
            color={colors.text}
            fontSize="md"
            lineHeight="1.8"
            overflowWrap="anywhere"
            sx={{
              "& h2": { fontSize: "lg", fontWeight: 700, mt: 7, mb: 3 },
              "& p": { mb: 4 },
              "& ul": { ps: 5, mb: 4 },
              "& li": { mb: 2 },
              "& strong": { fontWeight: 700 },
              "& a": { color: colors.link, textDecoration: "underline" },
            }}
          >
            <ReactMarkdown
              components={{
                h1: () => null,
                a: ({ href, children }) => (
                  <Link href={href} isExternal={!href?.startsWith("mailto:")}>
                    {children}
                  </Link>
                ),
              }}
            >
              {policy}
            </ReactMarkdown>
          </Box>
        </ModalBody>
        <ModalFooter color={colors.text}>
          <Button
            onClick={onClose}
            variant="outline"
            color={colors.text}
            borderColor={colors.border}
            bg="transparent"
            _hover={{ bg: colors.hover }}
          >
            {copy.close}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function PrivacyPolicyLink({ language = "en", isLightTheme }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const triggerRef = useRef(null);

  return (
    <>
      <Link
        as="button"
        type="button"
        ref={triggerRef}
        onClick={onOpen}
        aria-haspopup="dialog"
        fontSize="inherit"
        color="inherit"
        textDecoration="underline"
        textUnderlineOffset="3px"
        minH="44px"
        px={2}
      >
        {getCopy(language).title}
      </Link>
      <PrivacyPolicyModal
        isOpen={isOpen}
        onClose={onClose}
        language={language}
        isLightTheme={isLightTheme}
        finalFocusRef={triggerRef}
      />
    </>
  );
}

export function LinksPageLink() {
  return (
    <Link
      href="https://piyali.app/links"
      display="inline-flex"
      alignItems="center"
      fontSize="inherit"
      color="inherit"
      textDecoration="underline"
      textUnderlineOffset="3px"
      minH="44px"
      px={2}
    >
      Links
    </Link>
  );
}

export default function PrivacyPolicyFooter({ language = "en", isLightTheme }) {
  return (
    <Box as="footer" position="relative" zIndex={1} textAlign="center" px={4} py={5} fontSize="sm" color="inherit">
      <PrivacyPolicyLink language={language} isLightTheme={isLightTheme} />
    </Box>
  );
}
