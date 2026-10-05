import AchievementCollection from "../achievements/AchievementCollection.jsx";
import * as services from "../utility/achievements.js";

export default function AchievementCelebrationModal(props) {
  return <AchievementCollection {...props} services={services} appSource="robotsbuildingeducation" />;
}
