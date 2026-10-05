import { codingCourseEvidence } from "../achievements/codingProgress.js";
import { awardProgressionAchievements } from "./achievements.js";
import { readProgressLedger, recordProgressEvents } from "../achievements/progressionRuntime.js";
import { localDayKey } from "../achievements/progressionEvidence.js";
import { videoTranscript } from "./transcript.jsx";
const SOURCE = "robotsbuildingeducation";
export async function awardRobotsProgress({ npub, course, courseSteps, events = [] }) {
  if (!npub || !course || !courseSteps?.length) return [];
  recordProgressEvents(npub, SOURCE, events);
  return awardProgressionAchievements({ npub, source: SOURCE, evidence: codingCourseEvidence(course, courseSteps, readProgressLedger(npub, SOURCE), Object.keys(videoTranscript).filter(group => videoTranscript[group]?.videoSrc)) });
}
export const studyDayEvent = () => ({ metric: "calendar_streak", id: localDayKey() });
