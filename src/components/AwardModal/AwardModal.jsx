import AchievementCelebrationModal from "../AchievementCelebrationModal.jsx";

// Chapter review keeps its close-to-lecture flow while using the shared transcript.
export default function AwardModal({ isOpen, onClose, userLanguage }) {
  return <AchievementCelebrationModal isOpen={isOpen} onClose={onClose} language={userLanguage} />;
}
