import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Box,
  Button,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  HStack,
  Image,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
// import ReactConfetti from "react-confetti";
import { translation } from "../../../utility/translation";
import {
  transcript,
  videoTranscript,
  computerScienceTranscript,
} from "../../../utility/transcript";
import { useSharedNostr } from "../../../hooks/useNOSTR";
import { CloudCanvas } from "../../../elements/SunsetCanvas";

const TranscriptModal = ({ isOpen, onClose, userLanguage }) => {
  // pick transcript set (kept for parity, even if unused here)
  const transcriptset = useMemo(
    () =>
      userLanguage === "compsci-en" ? computerScienceTranscript : transcript,
    [userLanguage]
  );

  // safe localStorage reads
  const npub =
    typeof window !== "undefined" ? localStorage.getItem("local_npub") : null;
  const nsec =
    typeof window !== "undefined" ? localStorage.getItem("local_nsec") : null;

  const { getUserBadges } = useSharedNostr(npub, nsec);

  const [badges, setBadges] = useState([]);
  const [areBadgesLoading, setAreBadgesLoading] = useState(false);
  const inFlightRef = useRef(false);

  // fetch badges when the modal opens
  useEffect(() => {
    if (!isOpen) return;
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    let cancelled = false;

    (async () => {
      try {
        setAreBadgesLoading(true);
        const data = await getUserBadges();
        console.log("data....", data);
        if (!cancelled) setBadges(Array.isArray(data) ? data : []);
      } finally {
        if (!cancelled) setAreBadgesLoading(false);
        inFlightRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
    // intentionally NOT depending on getUserBadges to avoid identity loops
  }, [isOpen, npub, nsec]);

  const langKey = useMemo(
    () => (userLanguage?.includes("es") ? "es" : "en"),
    [userLanguage]
  );

  const cardImage = badges[0]?.image || null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay bg="rgba(255,255,255,0.8)" backdropFilter="blur(8px)" />
      <ModalContent
        as={motion.div}
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.4 }}
        bg="white"
        borderRadius="xl"
        boxShadow="xl"
        p={0}
        sx={{
          position: "relative",
          border: "8px solid transparent",
          background:
            "linear-gradient(white, white) padding-box, linear-gradient(135deg,#FFD700,#FF69B4,#DA70D6,#FFA500) border-box",
          "&::before": {
            content: '""',
            position: "absolute",
            top: "8px",
            left: "8px",
            right: "8px",
            bottom: "8px",
            border: "2px solid #FFD700",
            borderRadius: "calc(var(--chakra-radii-xl) - 8px)",
            pointerEvents: "none",
          },
        }}
      >
        <ModalBody p={6} color="gray.800">
          <HStack justifyContent="center" mb={4}>
            <Text fontSize="xl" fontWeight="bold">
              {translation?.[userLanguage]?.[
                "modal.title.decentralizedTranscript"
              ] ||
                translation?.[langKey]?.[
                  "modal.title.decentralizedTranscript"
                ] ||
                "Your Transcript"}
            </Text>
          </HStack>

          <Text mb={4}>
            {translation?.[userLanguage]?.[
              "modal.decentralizedTranscript.awareness"
            ] ||
              translation?.[langKey]?.[
                "modal.decentralizedTranscript.awareness"
              ] ||
              ""}
          </Text>

          {/* Earned badges grid (same states as Award modal) */}
          <b>
            {translation?.[userLanguage]?.[
              "modal.decentralizedTranscript.awardsEarned"
            ] ||
              translation?.[langKey]?.[
                "modal.decentralizedTranscript.awardsEarned"
              ] ||
              "Awards earned"}
          </b>

          {areBadgesLoading ? (
            <div style={{ width: "fit-content", margin: "8px auto 0" }}>
              <CloudCanvas />{" "}
              {translation?.[userLanguage]?.["loading"] ||
                translation?.[langKey]?.["loading"] ||
                "Loading"}
            </div>
          ) : badges.length < 1 ? (
            <div style={{ marginTop: 8 }}>
              {translation?.[userLanguage]?.["noTranscriptFound"] ||
                translation?.[langKey]?.["noTranscriptFound"] ||
                "No transcript found"}
            </div>
          ) : (
            <Box
              display="flex"
              m={2}
              width="fit-content"
              flexWrap="wrap"
              height="min-content"
              justifyContent="center"
              marginInline="auto"
            >
              {badges.map((badge) => {
                const title =
                  translation?.[userLanguage]?.[badge.name] ||
                  translation?.[langKey]?.[badge.name] ||
                  badge.name ||
                  "";
                const key =
                  badge.badgeAddress || badge.id || `${badge.image}-${title}`;
                const href = badge.badgeAddress
                  ? `https://badges.page/a/${badge.badgeAddress}`
                  : null;

                const imageEl = (
                  <Image
                    src={badge.image}
                    width={100}
                    style={{
                      borderRadius: "33%",
                      boxShadow: "0.5px 0.5px 1px 0px rgba(0,0,0,0.75)",
                      marginBottom: 4,
                    }}
                    alt={title || "Earned badge"}
                    loading="eager"
                  />
                );

                return (
                  <div
                    key={key}
                    style={{
                      margin: 6,
                      width: 250,
                      height: 100,
                      display: "flex",
                      alignItems: "center",
                      marginTop: 18,
                    }}
                  >
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            window.open(href, "_blank", "noopener,noreferrer");
                          }
                        }}
                        style={{ display: "inline-flex" }}
                      >
                        {imageEl}
                      </a>
                    ) : (
                      imageEl
                    )}
                    <div
                      style={{
                        padding: 6,
                        marginLeft: "12px",

                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Text fontSize="sm">{title}</Text>
                    </div>
                  </div>
                );
              })}
            </Box>
          )}
        </ModalBody>

        <ModalFooter justifyContent="center">
          <Button
            onMouseDown={onClose}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onClose();
            }}
          >
            {translation?.[userLanguage]?.["button.close"] ||
              translation?.[langKey]?.["button.close"] ||
              "Close"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TranscriptModal;
