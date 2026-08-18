import React, { useMemo, useEffect, useRef, useState } from "react";
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
import { translation } from "../../utility/translation";
import {
  transcript,
  videoTranscript,
  computerScienceTranscript,
} from "../../utility/transcript";
import { CloudCanvas } from "../../elements/SunsetCanvas";
import { useSharedNostr } from "../../hooks/useNOSTR";
import { soundManager } from "../../utility/soundManager";
import { getDittoBadgeUrl } from "../../utility/badgeUrl";

const AwardModal = ({ isOpen, onClose, step, userLanguage }) => {
  const langKey = useMemo(
    () => (userLanguage?.includes("es") ? "es" : "en"),
    [userLanguage]
  );
  const transcriptSet = useMemo(() => {
    if (userLanguage?.startsWith("compsci-")) return computerScienceTranscript;
    if (userLanguage?.startsWith("video-")) return videoTranscript;
    return transcript;
  }, [userLanguage]);

  const groupKey = step?.group;
  const badge = (groupKey && transcriptSet[groupKey]) || {};
  const displayName =
    (badge.name && (badge.name[langKey] || badge.name.en || badge.name.es)) ||
    badge.name ||
    "";
  const imageSrc = badge.imgSrc || badge.image || "";

  // 🔔 Play fan-fare once on open
  useEffect(() => {
    if (isOpen) {
      soundManager.play("fanFare");
    }
  }, [isOpen]);

  const [badges, setBadges] = useState([]);
  const [areBadgesLoading, setAreBadgesLoading] = useState(false);
  const { getUserBadges } = useSharedNostr();

  // Read creds from storage (or props, if you prefer)
  const npub =
    typeof window !== "undefined"
      ? localStorage.getItem("local_npub") || ""
      : "";
  const nsec =
    typeof window !== "undefined"
      ? localStorage.getItem("local_nsec") || ""
      : "";

  useEffect(() => {
    let cancelled = false;

    if (!isOpen) return;
    if (!npub) {
      setBadges([]);
      return;
    }

    setAreBadgesLoading(true);
    getUserBadges(npub)
      .then((b) => {
        if (!cancelled) {
          setBadges(b || []);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          console.error("Failed to load badges:", e);
          setBadges([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setAreBadgesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // 🚫 do NOT depend on getUserBadges (unstable identity). Depend on open state and creds only.
  }, [isOpen, npub, nsec]);
  // if you want to refetch when userLanguage changes, add it here safely:
  // }, [isOpen, npub, nsec, userLanguage]);

  const badgeAddress = badge.address || badge.badgeAddress || null;
  const badgeHref = getDittoBadgeUrl(badgeAddress);

  const awarenessCopy =
    translation?.[userLanguage]?.["modal.decentralizedTranscript.awareness"] ||
    translation?.[langKey]?.["modal.decentralizedTranscript.awareness"] ||
    "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      isCentered
      closeOnOverlayClick={false}
    >
      <ModalOverlay bg="appOverlay" backdropFilter="blur(8px)" />
      <ModalContent
        as={motion.div}
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.4 }}
        bg="appSurfaceElevated"
        borderRadius="xl"
        boxShadow="xl"
        p={0}
        sx={{
          position: "relative",
          border: "8px solid transparent",
          background:
            "linear-gradient(var(--chakra-colors-appSurfaceElevated), var(--chakra-colors-appSurfaceElevated)) padding-box, linear-gradient(135deg,#FFD700,#FF69B4,#DA70D6,#FFA500) border-box",
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
        <ModalBody p={6} textAlign="center" color="appText">
          <HStack justifyContent="center" mb={4}>
            <Text fontSize="xl" fontWeight="bold">
              {displayName ||
                translation?.[langKey]?.[
                  "modal.title.decentralizedTranscript"
                ] ||
                ""}
            </Text>
          </HStack>

          {imageSrc ? (
            <Box display="flex" justifyContent="center" mb={4}>
              {badgeHref ? (
                <a
                  href={badgeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      window.open(badgeHref, "_blank", "noopener,noreferrer");
                  }}
                >
                  <Image
                    src={imageSrc}
                    width={150}
                    borderRadius="33%"
                    boxShadow="0.5px 0.5px 1px rgba(0,0,0,0.75)"
                    alt={String(displayName || "Badge")}
                    loading="eager"
                  />
                </a>
              ) : (
                <Image
                  src={imageSrc}
                  width={150}
                  borderRadius="33%"
                  boxShadow="0.5px 0.5px 1px rgba(0,0,0,0.75)"
                  alt={String(displayName || "Badge")}
                  loading="eager"
                />
              )}
            </Box>
          ) : null}

          {awarenessCopy ? <Text mb={3}>{awarenessCopy}</Text> : null}

          <b>
            {translation?.[userLanguage]?.[
              "modal.decentralizedTranscript.awardsEarned"
            ] ||
              translation?.[langKey]?.[
                "modal.decentralizedTranscript.awardsEarned"
              ] ||
              ""}
          </b>

          {areBadgesLoading ? (
            <div style={{ width: "fit-content", margin: "0 auto" }}>
              <CloudCanvas />{" "}
              {translation?.[userLanguage]?.["loading"] ||
                translation?.[langKey]?.["loading"] ||
                "Loading"}
            </div>
          ) : badges.length < 1 ? (
            <div>
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
              {badges.map((b) => {
                const bHref = getDittoBadgeUrl(b.badgeAddress || b.address);
                const badgeImg = (
                  <Image
                    loading="eager"
                    src={b.image}
                    width={100}
                    style={{
                      borderRadius: "33%",
                      boxShadow: "0.5px 0.5px 1px 0px rgba(0,0,0,0.75)",
                      marginBottom: 4,
                    }}
                    alt={b.name || "Earned badge"}
                  />
                );

                return (
                  <div
                    key={b.badgeAddress || b.id || b.image}
                    style={{
                      margin: 6,
                      width: 250,
                      height: 100,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {bHref ? (
                      <a
                        href={bHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            window.open(bHref, "_blank", "noopener,noreferrer");
                        }}
                      >
                        {badgeImg}
                      </a>
                    ) : (
                      badgeImg
                    )}
                    <div
                      style={{
                        padding: 6,
                        marginLeft: "12px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Text fontSize="sm">
                        {translation?.[userLanguage]?.[b.name] ||
                          translation?.[langKey]?.[b.name] ||
                          b.name}
                      </Text>
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
            data-sound-close="true"
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

export default AwardModal;
