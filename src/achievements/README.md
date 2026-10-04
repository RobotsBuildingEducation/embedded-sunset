# Shared learning transcript

Catalog v7 contains **104 completion awards**: 40 beginner, 28 intermediate, 35 advanced and one shared capstone. Piyali contributes 75; Robots Building Education contributes 28. See [CHALLENGES.md](./CHALLENGES.md) for the complete requirements.

The current catalog contains evidenced learning completion: curriculum-earned Tutor levels, completed Tutor/Skill Tree/flashcard levels, completed goal and repair plans at each proficiency level, phonics collections and generated decks, completed immersion tasks and checklists, coding chapters, review videos and checklists, correctly answered questions, and full courses. Conversational micro behaviors, hint restrictions, perfect-answer challenges, app usage, streaks, pet unlocks/health, XP/Score, timers and sats-spent awards are retired. No theme collection depends on those retired behaviors.

## Completion counts

Piyali has **5, 10, 20, 25, 50, 100 and 200** distinct completions separately for Tutor lessons, Skill Tree lessons and flashcards. Committed curriculum summaries count unique completed items across all seven proficiency levels within one practice language. Valid existing saved completions qualify; replays do not increase counts.

Robots has **10, 20, 50 and 100** correctly answered distinct coding questions, covering course and post-course practice. The separate post-course milestones remain at 1, 25 and 100. Only a successful grade emits a completion. Existing tracked correct post-course answers qualify, with duplicates removed. Legacy navigation history cannot prove correct answers, so ordinary course questions begin counting with the grading integration.

Piyali full-course completion requires all three tracks, Pre-A1–C2, in one practice language. Robots requires every course step and chapter plus every required review video and checklist in one coding course. The shared capstone requires both genuine full-course awards; test rewards never qualify.

Piyali also awards **5, 20, 50, 100 and 200 completed conversation goals**. These reuse the existing conversation goal grader, require a positive completion verdict and deduplicate callbacks for the same goal. They do not count replies or add another grading request. New goals begin counting with this integration; previous turn/XP totals cannot certify completed goals.

Robots has separate completion and full-review awards for **every playable chapter, 0–5**. Completion requires every step in that chapter in one course. A full review requires both the chapter’s watched video and completed checklist in that same course. Chapter 6 has review assets but no playable chapter in the current curriculum, so it is not included. Existing tracked completion IDs can qualify immediately.

Award titles are playful, descriptions state only what to complete, and the visible Skill Tree brand is now Lessons. The internal skillTree metric and existing protocol IDs remain unchanged.

## Evidence and compatibility

Piyali listens to confirmed account, course-summary and current quest-day documents, bypassing optimistic writes, placement and dev overrides. Server acknowledgement triggers evaluation even when a save finishes after the UI update. Goals and repair plans require completion of assigned practice; repair plans come from the persisted `questDays` subcollection. Phonics verifies persisted correct recall against known collections and generated-deck manifests. Robots derives chapters from course-prefixed steps in the actual curriculum; review videos require at least 95% distinct played ranges, and checklist evidence is course-specific.

Every retained award keeps its protocol ID, requirement, collection number and orb personality. Presentation colors follow the current collection theme. Retired numbers remain reserved, so the active list has gaps. The UI derives its total from the current catalog. Retired and unknown records remain in local storage and Nostr payloads, but cannot be awarded again, appear in the transcript, inflate progress or qualify for the capstone. Test buttons sample only the active host catalog and mark their awards as tests.

Completion events are deduplicated by stable IDs in identity- and host-scoped local storage and an IndexedDB journal. Each host also saves individual events under `users/{npub}/achievementProgress/{source}/events/{sha256(metric, completionId)}` in Firestore. Two devices union IDs instead of adding independently incremented counters, so repeated uploads cannot count twice. Only completion IDs, metrics, source and schema version are stored, never conversation or practice text. Existing local event histories upload on account activation. Legacy records that cannot prove completion are not backfilled. Retired usage hooks no longer add history. The main user document needs no new achievement behavior fields.

The transport retains Nostr kind 30078, the learning-achievements identifier, schema version 1 and the existing award-storage namespace. New records carry catalog version 7. Writes serialize per identity, and genuine awards supersede test records. Generic award calls cannot grant progression rewards without validated evidence.

## Unlock feedback and persistence

New awards are stored locally and queued in the existing feedback rail immediately, without waiting for a signer, relay or Firestore request. The rail turns gold and shows the localized title, completion requirement and animated orb. Its primary button is always Continue, which dismisses one award without submitting an answer, skipping or advancing the lesson, chapter, review or transition. Several simultaneous awards appear one at a time. After the last Continue, the underlying answer feedback and original learning controls return; a second press on the normal primary action advances learning. The close icon also dismisses one award. Account changes clear pending feedback.

Gold uses the same surface, border and shadow treatment as each host's answer feedback, with light and dark theme colors. Dismissing home feedback releases footer ownership and restores the compact menu dimensions; exercise feedback restores the previous answer state and controls.

Each host saves its transcript under `users/{npub}/achievements/{achievementId}` in its own Firestore database. Documents contain the permanent ID/number, canonical English title and description, orb preset, source, earned timestamp, catalog version and test flag. The UI always uses current localized catalog copy. Transactions make repeated saves idempotent and prevent test records from replacing genuine work.

Foreground progress and unlock feedback never await a network request. Independent cloud and relay retry workers retain pending intent and completion/award payloads locally, retry failures with exponential delays from 1 to 60 seconds, and reconcile again after reopening, reconnection or returning to the app. Confirmed Firestore listeners merge work from other devices while the app is open. Robots reevaluates all courses with saved completion history, including chapter and review requirements, from any screen. Nostr operations serialize per identity, bound stalled requests, reuse pending extension dialogs and require at least one relay acknowledgement before clearing pending status. Account changes pause retries and release listeners for the old identity. The transcript displays localized `Sync pending` while either destination is waiting. If both device storage destinations fail, in-memory progress and feedback still work, with a visible warning to keep the app open until a cloud copy is confirmed. Historical or retired Nostr records remain compatible.

**Test unlock** sits beside **Test achievement** and previews a random host award in the golden rail without saving it or publishing a Nostr event. The original test button still grants explicitly marked test records. Robots keeps the bottom bar visible above its cloud transition, on chapter overview screens, and during chapter video/checklist review; Continue/Next lives in the primary action slot on those screens.

## Orb presentation

Achievement colors are shared across both apps. Pre-A1 is blue, A1 cyan, A2 jade, B1 violet, B2 rose, C1 amber and C2 gold. Count milestones progress through the same palette from blue to gold, with shorter ladders sampling evenly spaced stages. Each chapter's completion and full-review awards share a color, progressing from blue for Chapter 0 to gold for Chapter 5. Full collections, full courses and the shared capstone are gold, with a slightly more metallic finish. `orbThemes.js` derives these colors from catalog groups; protocol records and collection numbers do not change.

Every visible reward uses the existing `/orbing` Three.js scene, geometry, face morphing, lighting, and reaction poses. Tiles and the spotlight animate. A single shared WebGL renderer renders their frames to individual display canvases, avoiding the browser's WebGL-context limit. Offscreen tiles release their scenes. Reduced motion disables motion. The live tutor's standard palettes, states, and reactions remain separate.

The 20 experimental surface programs live in `orbSurfaces.js`; palettes, materials, expressions and dances live in `orbPresets.js`. Each award gets a deterministic combination. `/orbing` imports these same presets in Piyali, so it previews the same system as the awards.

Each experimental surface generates its entire color animation in its own shader function. The original tutor watercolor runs only for standard app orbs (pattern zero). Experiments do not use the tutor's ripple, swirl, warp, turbulence or wash controls; each preset selects a dedicated pigment program and playback speed. Starting phases vary, while palette and personality stay consistent. Reduced motion and pause stop the same scene clock.

The 20 motion studies are: separating ice floes, radar sweeps, circuit charges, pumping color columns, rolling silk folds, two-source interference, aurora curtains, branching plasma, unfolding petals, refracting crystal facets, figure-eight bands, falling rain, rising embers, layered nebula clouds, paired signal pulses, mirrored prisms, layered tides, crossing ribbons, traveling pixel packets and solar convection. Shared shader helpers provide geometric primitives and noise; there is no common animated underlay.

## Transcript organization

The close button stays at the top. The localized title, subtitle and platform tabs scroll with the collection. Mobile uses a centered, rounded dialog at 95vw by 90dvh; scrollbar tracks remain hidden.

Each platform tab presents one continuous grid for unlocked awards and one for locked awards. Both grids sort by learning activity, then difficulty, language level, chapter number and count target, without category or difficulty subheadings. Unlocked and locked awards never share a grid. Status labels and section counts make the distinction explicit. This display order never changes protocol IDs, permanent slots, requirements or orb identities.

## Localization and mirroring

Titles, requirements and UI text are authored for en, es, pt, it, fr, de, ja, hi, ar and zh. Arabic uses RTL and native digits. Programming course IDs resolve to their interface language. The UI presents a learning transcript, and the capstone displays its two course-completion prerequisites.

Run node scripts/syncAchievementFeature.mjs /absolute/path/to/other/app to mirror the feature; add --check to verify parity. Host adapters remain local. The script removes obsolete behavior-definition files. Transport and host integration remain at each app’s existing paths.

Validation: node --test src/achievements/*.test.js plus host achievement transport and curriculum tests, and npm run build in both repositories.

A local visual review page is available in the Piyali dev server at `/.achievement-preview.html`. It uses sample data and does not publish awards or connect an account.

The Piyali-only `/.orb-surface-preview.html` review page shows all 20 dedicated pigment programs with still bodies. Switch to one common palette to compare motion independently of color choices, or pause to check reduced motion. This developer page has no account or award actions.
