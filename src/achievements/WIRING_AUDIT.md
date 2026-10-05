# Achievement wiring audit

Catalog: **104 active awards: 75 Piyali, 28 Robots, 1 shared**.

This is a reproducible automated integration audit, using isolated accounts and
transaction/listener fixtures. It does not complete work on real user accounts
or contact deployed Firebase, Nostr relays or grading services.

For every host award, the audit checks incomplete progress, the exact qualifying
completion, a genuine award and feedback, repeated delivery, durable local
records and account isolation. Piyali uses production proof builders, committed
listeners and real curriculum totals. Robots executes its production host adapter
against both actual curricula and review assets. The shared award checks both
genuine course records, excludes test-only completion, and restores through a
second persistence adapter. Existing recovery suites also cover offline retries,
storage failures, device unions and one-time historical catch-up.

Proficiency completion is cumulative within its category: a complete higher
level grants earlier level awards. C2 completion in all three tracks in one
language qualifies for full-course completion. Placement and partial work do
not qualify. The cumulative proficiency suite also checks existing-award
recovery, test exclusion, duplicate feedback and unchanged actual task counts.

Production save functions and listener wiring are exercised separately:

- Piyali's actual lesson/Tutor transactions: failed save, retry, fifth completion, repeat and language isolation.
- Piyali's actual achievement hook: pending/cache rejection, server acknowledgement, stale account rejection and listener disposal.
- Piyali phonics: a final save arriving after an incomplete read still triggers evaluation.
- Robots' actual review handlers: seeking to 90%, completion before a slow initial load, preservation of new checkmarks and saved checklist awards.

The audit found and fixed two timing gaps: Piyali's one-shot phonics read could
miss a later completion; Robots' initial review read could overwrite newly
completed work and fail to trigger its save. These now have regression coverage.

## Reproduce

Piyali:

```sh
node --test src/achievements/*.test.js src/utils/achievements.test.js src/utils/piyaliAchievement*.test.js src/utils/piyaliFlashcardAchievements.test.js src/utils/progressTrackingAchievementAudit.test.js src/hooks/achievementHookWiring.test.js
node scripts/auditAchievementWiring.mjs
```

Robots, from its repository:

```sh
node --test src/achievements/*.test.js src/utility/achievements.test.js src/utility/chapterAchievements.test.js src/utility/reviewCompletion.test.js src/utility/robotsAchievementAudit.test.js src/utility/reviewLoadAudit.test.js
```

Primary per-award tests: Piyali `src/utils/piyaliAchievementAudit.test.js`;
Robots `src/utility/robotsAchievementAudit.test.js`;
shared `src/achievements/capstoneAudit.test.js` (both hosts).

## Checklist

“Covered” means the automated boundary/integration case exists and must pass;
this generated checklist is not itself a test runner or a live service check.

| App | Achievement / permanent ID | Requirement | Production trigger | Coverage |
| --- | --- | --- | --- | --- |
| Piyali | Ready for Takeoff · A2<br>`tutor_reach_a2` | Reach A2 in Tutor lessons. | Tutor: highest fully completed level → awardTutorLevelAchievements; genuine Tutor awards recover reach | Covered |
| Piyali | Spread Your Wings · B1<br>`tutor_reach_b1` | Reach B1 in Tutor lessons. | Tutor: highest fully completed level → awardTutorLevelAchievements; genuine Tutor awards recover reach | Covered |
| Piyali | Flying High · B2<br>`tutor_reach_b2` | Reach B2 in Tutor lessons. | Tutor: highest fully completed level → awardTutorLevelAchievements; genuine Tutor awards recover reach | Covered |
| Shared | Two worlds mastered<br>`two_worlds_complete_v4` | Complete a full language course in Piyali and a full coding course in Robots Building Education. | Both genuine full-course records → completeCollectionAwards | Covered |
| Piyali | Tutor Triumph · Pre-A1<br>`piyali_tutor_complete_pre_a1` | Complete all Tutor lessons at Pre-A1 or higher. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Tutor Triumph · A1<br>`piyali_tutor_complete_a1` | Complete all Tutor lessons at A1 or higher. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Tutor Triumph · A2<br>`piyali_tutor_complete_a2` | Complete all Tutor lessons at A2 or higher. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Tutor Triumph · B1<br>`piyali_tutor_complete_b1` | Complete all Tutor lessons at B1 or higher. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Tutor Triumph · B2<br>`piyali_tutor_complete_b2` | Complete all Tutor lessons at B2 or higher. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Tutor Triumph · C1<br>`piyali_tutor_complete_c1` | Complete all Tutor lessons at C1 or higher. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Tutor Triumph · C2<br>`piyali_tutor_complete_c2` | Complete all Tutor lessons at C2 or higher. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Level Explorer · Pre-A1<br>`piyali_skillTree_complete_pre_a1` | Complete all lessons at Pre-A1 or higher. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Level Explorer · A1<br>`piyali_skillTree_complete_a1` | Complete all lessons at A1 or higher. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Level Explorer · A2<br>`piyali_skillTree_complete_a2` | Complete all lessons at A2 or higher. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Level Explorer · B1<br>`piyali_skillTree_complete_b1` | Complete all lessons at B1 or higher. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Level Explorer · B2<br>`piyali_skillTree_complete_b2` | Complete all lessons at B2 or higher. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Level Explorer · C1<br>`piyali_skillTree_complete_c1` | Complete all lessons at C1 or higher. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Level Explorer · C2<br>`piyali_skillTree_complete_c2` | Complete all lessons at C2 or higher. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Word Wizard · Pre-A1<br>`piyali_flashcards_complete_pre_a1` | Complete all flashcards at Pre-A1 or higher. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Word Wizard · A1<br>`piyali_flashcards_complete_a1` | Complete all flashcards at A1 or higher. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Word Wizard · A2<br>`piyali_flashcards_complete_a2` | Complete all flashcards at A2 or higher. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Word Wizard · B1<br>`piyali_flashcards_complete_b1` | Complete all flashcards at B1 or higher. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Word Wizard · B2<br>`piyali_flashcards_complete_b2` | Complete all flashcards at B2 or higher. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Word Wizard · C1<br>`piyali_flashcards_complete_c1` | Complete all flashcards at C1 or higher. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Word Wizard · C2<br>`piyali_flashcards_complete_c2` | Complete all flashcards at C2 or higher. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Mission Accomplished · Pre-A1<br>`piyali_goals_complete_pre_a1` | Complete a plan at Pre-A1 or higher in personal goal practice. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Mission Accomplished · A1<br>`piyali_goals_complete_a1` | Complete a plan at A1 or higher in personal goal practice. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Mission Accomplished · A2<br>`piyali_goals_complete_a2` | Complete a plan at A2 or higher in personal goal practice. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Mission Accomplished · B1<br>`piyali_goals_complete_b1` | Complete a plan at B1 or higher in personal goal practice. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Mission Accomplished · B2<br>`piyali_goals_complete_b2` | Complete a plan at B2 or higher in personal goal practice. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Mission Accomplished · C1<br>`piyali_goals_complete_c1` | Complete a plan at C1 or higher in personal goal practice. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Mission Accomplished · C2<br>`piyali_goals_complete_c2` | Complete a plan at C2 or higher in personal goal practice. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Comeback Kid · Pre-A1<br>`piyali_repairs_complete_pre_a1` | Complete a plan at Pre-A1 or higher in repair practice. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Comeback Kid · A1<br>`piyali_repairs_complete_a1` | Complete a plan at A1 or higher in repair practice. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Comeback Kid · A2<br>`piyali_repairs_complete_a2` | Complete a plan at A2 or higher in repair practice. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Comeback Kid · B1<br>`piyali_repairs_complete_b1` | Complete a plan at B1 or higher in repair practice. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Comeback Kid · B2<br>`piyali_repairs_complete_b2` | Complete a plan at B2 or higher in repair practice. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Comeback Kid · C1<br>`piyali_repairs_complete_c1` | Complete a plan at C1 or higher in repair practice. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Comeback Kid · C2<br>`piyali_repairs_complete_c2` | Complete a plan at C2 or higher in repair practice. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Sound Collector<br>`nosabos_phonics_cards_all` | Complete all phonics cards. | AlphabetBootcamp: confirmed alphabetPractice listener → phonicsCompletionEvidence | Covered |
| Piyali | Sound Safari · 1<br>`nosabos_phonics_decks_1` | Complete one phonics deck. | AlphabetBootcamp: confirmed alphabetPractice listener → phonicsCompletionEvidence | Covered |
| Piyali | Sound Safari · 5<br>`nosabos_phonics_decks_5` | Complete 5 phonics decks. | AlphabetBootcamp: confirmed alphabetPractice listener → phonicsCompletionEvidence | Covered |
| Piyali | Sound Safari · 20<br>`nosabos_phonics_decks_20` | Complete 20 phonics decks. | AlphabetBootcamp: confirmed alphabetPractice listener → phonicsCompletionEvidence | Covered |
| Piyali | Out in the World · 1<br>`nosabos_immersion_checklists_1` | Complete 1 immersion checklist. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Out in the World · 10<br>`nosabos_immersion_checklists_10` | Complete 10 immersion checklists. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Out in the World · 30<br>`nosabos_immersion_checklists_30` | Complete 30 immersion checklists. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Real-World Explorer · 5<br>`nosabos_immersion_tasks_5` | Complete 5 immersion tasks. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Real-World Explorer · 50<br>`nosabos_immersion_tasks_50` | Complete 50 immersion tasks. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Real-World Explorer · 200<br>`nosabos_immersion_tasks_200` | Complete 200 immersion tasks. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Robots | Chapter Hopper · 1<br>`robotsbuildingeducation_chapters_1` | Complete 1 chapter. | App: completed course step → awardRobotsProgress → codingCourseEvidence | Covered |
| Robots | Chapter Hopper · 3<br>`robotsbuildingeducation_chapters_3` | Complete 3 chapters. | App: completed course step → awardRobotsProgress → codingCourseEvidence | Covered |
| Robots | Chapter Hopper · 5<br>`robotsbuildingeducation_chapters_5` | Complete 5 chapters. | App: completed course step → awardRobotsProgress → codingCourseEvidence | Covered |
| Robots | Cover to Cover<br>`robotsbuildingeducation_chapters_all` | Complete all chapters in one course. | App: completed course step → awardRobotsProgress → codingCourseEvidence | Covered |
| Robots | Encore! · 1<br>`robotsbuildingeducation_review_videos_1` | Watch a chapter review video. | LectureModal: 90% timeline / summary / practice → reviewCompletionEvents → awardRobotsProgress | Covered |
| Robots | Full Replay<br>`robotsbuildingeducation_review_videos_all` | Complete all review videos in one course. | LectureModal: 90% timeline / summary / practice → reviewCompletionEvents → awardRobotsProgress | Covered |
| Robots | Reviewed and Ready · 1<br>`robotsbuildingeducation_review_checklists_1` | Complete 1 review checklist. | LectureModal: 90% timeline / summary / practice → reviewCompletionEvents → awardRobotsProgress | Covered |
| Robots | Nothing Missed<br>`robotsbuildingeducation_review_checklists_all` | Complete all review checklists in one course. | LectureModal: 90% timeline / summary / practice → reviewCompletionEvents → awardRobotsProgress | Covered |
| Robots | Beyond the Diploma · 1<br>`robotsbuildingeducation_post_course_questions_1` | Solve one post-course question. | App: positive question grade → correctQuestionEvents → awardRobotsProgress | Covered |
| Robots | Beyond the Diploma · 25<br>`robotsbuildingeducation_post_course_questions_25` | Solve 25 post-course questions. | App: positive question grade → correctQuestionEvents → awardRobotsProgress | Covered |
| Robots | Beyond the Diploma · 100<br>`robotsbuildingeducation_post_course_questions_100` | Solve 100 post-course questions. | App: positive question grade → correctQuestionEvents → awardRobotsProgress | Covered |
| Piyali | Language Legend<br>`piyali_full_curriculum_v4` | Complete all C2 lessons, Tutor lessons and flashcards in one language; earlier level awards are included. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Robots | Code Legend<br>`robots_full_curriculum_v4` | Complete a coding course, including every chapter and review. | App: completed course step → awardRobotsProgress → codingCourseEvidence | Covered |
| Piyali | Tutor Trailblazer · 5<br>`nosabos_tutor_lessons_5` | Complete 5 Tutor lessons. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Tutor Trailblazer · 10<br>`nosabos_tutor_lessons_10` | Complete 10 Tutor lessons. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Tutor Trailblazer · 25<br>`nosabos_tutor_lessons_25` | Complete 25 Tutor lessons. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Tutor Trailblazer · 50<br>`nosabos_tutor_lessons_50` | Complete 50 Tutor lessons. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Tutor Trailblazer · 100<br>`nosabos_tutor_lessons_100` | Complete 100 Tutor lessons. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Tutor Trailblazer · 200<br>`nosabos_tutor_lessons_200` | Complete 200 Tutor lessons. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Lesson Quest · 5<br>`nosabos_skill_tree_lessons_5` | Complete 5 lessons. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Lesson Quest · 10<br>`nosabos_skill_tree_lessons_10` | Complete 10 lessons. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Lesson Quest · 25<br>`nosabos_skill_tree_lessons_25` | Complete 25 lessons. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Lesson Quest · 50<br>`nosabos_skill_tree_lessons_50` | Complete 50 lessons. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Lesson Quest · 100<br>`nosabos_skill_tree_lessons_100` | Complete 100 lessons. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Lesson Quest · 200<br>`nosabos_skill_tree_lessons_200` | Complete 200 lessons. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Word Collector · 5<br>`nosabos_flashcards_completed_5` | Complete 5 flashcards. | App: successful canonical-card review → awardPiyaliFlashcardProgress; hydration and cloud receipts recover it | Covered |
| Piyali | Word Collector · 10<br>`nosabos_flashcards_completed_10` | Complete 10 flashcards. | App: successful canonical-card review → awardPiyaliFlashcardProgress; hydration and cloud receipts recover it | Covered |
| Piyali | Word Collector · 25<br>`nosabos_flashcards_completed_25` | Complete 25 flashcards. | App: successful canonical-card review → awardPiyaliFlashcardProgress; hydration and cloud receipts recover it | Covered |
| Piyali | Word Collector · 50<br>`nosabos_flashcards_completed_50` | Complete 50 flashcards. | App: successful canonical-card review → awardPiyaliFlashcardProgress; hydration and cloud receipts recover it | Covered |
| Piyali | Word Collector · 100<br>`nosabos_flashcards_completed_100` | Complete 100 flashcards. | App: successful canonical-card review → awardPiyaliFlashcardProgress; hydration and cloud receipts recover it | Covered |
| Piyali | Word Collector · 200<br>`nosabos_flashcards_completed_200` | Complete 200 flashcards. | App: successful canonical-card review → awardPiyaliFlashcardProgress; hydration and cloud receipts recover it | Covered |
| Robots | Code Cracker · 10<br>`robotsbuildingeducation_solved_questions_10` | Solve 10 coding questions. | App: positive question grade → correctQuestionEvents → awardRobotsProgress | Covered |
| Robots | Code Cracker · 20<br>`robotsbuildingeducation_solved_questions_20` | Solve 20 coding questions. | App: positive question grade → correctQuestionEvents → awardRobotsProgress | Covered |
| Robots | Code Cracker · 50<br>`robotsbuildingeducation_solved_questions_50` | Solve 50 coding questions. | App: positive question grade → correctQuestionEvents → awardRobotsProgress | Covered |
| Robots | Code Cracker · 100<br>`robotsbuildingeducation_solved_questions_100` | Solve 100 coding questions. | App: positive question grade → correctQuestionEvents → awardRobotsProgress | Covered |
| Piyali | Tutor Trailblazer · 20<br>`nosabos_tutor_lessons_20` | Complete 20 Tutor lessons. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Lesson Quest · 20<br>`nosabos_skill_tree_lessons_20` | Complete 20 lessons. | Saved profile/courseProgress/questDays → usePiyaliAchievements → piyaliCompletionProof | Covered |
| Piyali | Word Collector · 20<br>`nosabos_flashcards_completed_20` | Complete 20 flashcards. | App: successful canonical-card review → awardPiyaliFlashcardProgress; hydration and cloud receipts recover it | Covered |
| Piyali | Talk of the Town · 5<br>`nosabos_conversation_goals_5` | Complete 5 conversation goals. | Conversations: positive goal verdict → conversationCompletionEvent | Covered |
| Piyali | Talk of the Town · 20<br>`nosabos_conversation_goals_20` | Complete 20 conversation goals. | Conversations: positive goal verdict → conversationCompletionEvent | Covered |
| Piyali | Talk of the Town · 50<br>`nosabos_conversation_goals_50` | Complete 50 conversation goals. | Conversations: positive goal verdict → conversationCompletionEvent | Covered |
| Piyali | Talk of the Town · 100<br>`nosabos_conversation_goals_100` | Complete 100 conversation goals. | Conversations: positive goal verdict → conversationCompletionEvent | Covered |
| Piyali | Talk of the Town · 200<br>`nosabos_conversation_goals_200` | Complete 200 conversation goals. | Conversations: positive goal verdict → conversationCompletionEvent | Covered |
| Robots | Liftoff! · Chapter 0<br>`robots_chapter_0_complete` | Complete Chapter 0. | App: completed course step → awardRobotsProgress → codingCourseEvidence | Covered |
| Robots | Launch Check · Chapter 0<br>`robots_chapter_0_review` | Watch the Chapter 0 review and complete its checklist. | LectureModal: 90% timeline / summary / practice → reviewCompletionEvents → awardRobotsProgress | Covered |
| Robots | Hello, World! · Chapter 1<br>`robots_chapter_1_complete` | Complete Chapter 1. | App: completed course step → awardRobotsProgress → codingCourseEvidence | Covered |
| Robots | Back to Basics · Chapter 1<br>`robots_chapter_1_review` | Watch the Chapter 1 review and complete its checklist. | LectureModal: 90% timeline / summary / practice → reviewCompletionEvents → awardRobotsProgress | Covered |
| Robots | Object Champion · Chapter 2<br>`robots_chapter_2_complete` | Complete Chapter 2. | App: completed course step → awardRobotsProgress → codingCourseEvidence | Covered |
| Robots | Objects in Focus · Chapter 2<br>`robots_chapter_2_review` | Watch the Chapter 2 review and complete its checklist. | LectureModal: 90% timeline / summary / practice → reviewCompletionEvents → awardRobotsProgress | Covered |
| Robots | Front Row · Chapter 3<br>`robots_chapter_3_complete` | Complete Chapter 3. | App: completed course step → awardRobotsProgress → codingCourseEvidence | Covered |
| Robots | Frontend Rewind · Chapter 3<br>`robots_chapter_3_review` | Watch the Chapter 3 review and complete its checklist. | LectureModal: 90% timeline / summary / practice → reviewCompletionEvents → awardRobotsProgress | Covered |
| Robots | Behind the Scenes · Chapter 4<br>`robots_chapter_4_complete` | Complete Chapter 4. | App: completed course step → awardRobotsProgress → codingCourseEvidence | Covered |
| Robots | Backend Rewind · Chapter 4<br>`robots_chapter_4_review` | Watch the Chapter 4 review and complete its checklist. | LectureModal: 90% timeline / summary / practice → reviewCompletionEvents → awardRobotsProgress | Covered |
| Robots | App Maker · Chapter 5<br>`robots_chapter_5_complete` | Complete Chapter 5. | App: completed course step → awardRobotsProgress → codingCourseEvidence | Covered |
| Robots | App Inspection · Chapter 5<br>`robots_chapter_5_review` | Watch the Chapter 5 review and complete its checklist. | LectureModal: 90% timeline / summary / practice → reviewCompletionEvents → awardRobotsProgress | Covered |
