# Teams drawer design review and porting specification

This document describes the Teams drawer as implemented in this app and the corresponding design for an English and Spanish course app. The other app has **chapters, chapter progress, daily goals, salary numbers, and total course progress**. It has **no pets, daily XP, scores, or total XP**. Preserve the drawer's team management and interaction model while replacing the learner progress content and its data contract.

## 1. What the drawer is

Teams is a bottom sheet opened from the app's activity menu. The menu entry uses a heart/handshake icon and shows a small red dot when a new team invitation has not been viewed. The drawer brings together:

1. **Teams:** create a team, copy your ID, review invitations, inspect teammate progress, add members, rename, leave, or delete.
2. **Global feed:** browse public community posts.

Creation is a button and modal **inside the Teams tab**, not a third tab. The existing translation files contain a `teams_tab_create` string, but the rendered drawer has only Teams and Global feed.

### Layout and visual language

| Element | Current implementation | Porting guidance |
| --- | --- | --- |
| Sheet | Chakra bottom `Drawer`, height `80vh`/`80dvh`, top corners `24px`, flexible column | Keep this shape and size; ensure the body scrolls independently. |
| Width | Header and body content each cap at `720px` and center | Keep this cap on desktop and full usable width on mobile. |
| Header | Centered content column, “Teams” title, close button at top right | Localize title and accessible close name. |
| Drag affordance | Centered `52 × 5px` pill, `3px` top/bottom rhythm around it | Keep visible on touch devices. |
| Tabs | Centered, semibold, muted inactive text; selected text uses primary color and a `3px` cyan-to-teal underline with a short scale/fade transition | Preserve the restrained tab treatment. |
| Cards | Rounded, lightly bordered surfaces; elevated inner member cards | Preserve the nesting: team card → progress member cards → metric tiles and bars. |
| Light theme | Warm paper: surface `#fdf9f2`, elevated `#fffdf9`, muted `#efe4d5`, primary text `#2f261d`, secondary `#5b4b3a`, subtle brown border/shadow | Reuse the other app's equivalent semantic tokens if it has a design system. |
| Dark theme | Deep navy: surface `#0b1220`, elevated `#111827`, muted `#182031`, primary text `#e5e7eb`, secondary `#cbd5e1` | Maintain clear card boundaries and readable muted text. |
| Primary actions | Teal filled buttons; secondary actions outlined; destructive actions red outlined | Maintain this hierarchy. |

The drawer has a native-feeling enter/exit motion. It can be dismissed with the close button or a downward swipe: movement must begin vertically on a noninteractive area, with the scrollable body already at its top; over `120px` of drag or sufficiently fast downward release dismisses it. Otherwise it snaps back. Buttons, inputs, links, and similar controls do not start a dismiss gesture. The implementation currently has no rendered `DrawerOverlay` (its overlay is commented out), so do not assume a visible dim/blur backdrop is part of this design.

## 2. Tabs, default state, and attention

- If the user has at least one team, the **Teams tab is first** and is selected when the drawer opens; Global feed is second.
- If the user has no teams, **Global feed is first** and is initially selected; Teams is second. This puts community content in front of a new user while leaving creation one tap away.
- Closing the drawer resets the selected index to `0`, which again resolves to the first tab at the next open.
- Creating a team changes the tab order to Teams first, selects Teams, and triggers a fresh team load.
- In the current component, the `hasTeams` tab-order flag is set from preload and creation; leaving or deleting the last team does not immediately reset that flag. In the port, derive the order from the settled live team list so it stays correct after those actions.
- Pending invitations add a numeric count to the Teams tab label. A separate red dot indicates that at least one invitation is unseen. The menu icon uses the same unseen dot, without a count.
- The app subscribes to invitation records while signed in. The initial set of pending invitations marks attention; subsequent newly seen invitation IDs mark it again. Opening or selecting the Teams tab clears the unseen dot, while the count remains until invitations are acted on.
- Team lists and member progress are preloaded outside the drawer when possible, then refreshed when it opens. This reduces an empty flash. The port should wait for a settled team-list result before applying the “no teams” tab order, avoiding a transient tab jump during loading.

## 3. Teams tab hierarchy and flows

### Top actions

At the top right is a filled **Create team** button and an outlined **Copy Your ID** button. The copy button has a pressed-down effect and copies the signed-in user's Nostr `npub`, followed by a success or error toast. In the other app, this must copy the exact identifier accepted by its invite field; if both apps share the team protocol below, that is the `npub`.

### Create team modal

The centered modal has a title, close control, team-name input, teammate-ID input with adjacent **Invite** button, a staged invitee list with remove icons, and a full-width submit button. Enter in the ID input stages the ID. The staged list shows the count and one truncated identifier per row. A teammate is not added merely by typing: the user must click Invite or press Enter, then submit the modal.

Validation and feedback:

- Require a nonblank team name and at least one staged teammate.
- Require the invitee ID to begin with `npub`; the service then decodes/validates the complete key.
- Reject duplicates in the staged list; the service also rejects users already on the team and the creator's own ID.
- Disable submit until its local required fields are present. Show an in-button loading state while saving; show specific error, warning, or success toasts.
- On success clear the fields, close the modal, refresh teams, and show the new team in the Teams tab.

The current create input has no explicit maximum length, whereas rename limits names to **80 characters**. Apply the same 80-character limit at create time in the port.

### Invitations

Pending invitation cards appear **above** “My teams (N).” Each shows the team name, “Invited by: …”, and right-aligned **Accept** and **Decline** outline buttons. The active invitation action shows loading and ends in a toast. Accept reloads teams; decline updates the invitation state through its subscription.

This acceptance UI is for **legacy Firestore invitations**. New public Nostr teams add a member to the roster immediately and may have an already-accepted mirror record; they do not require an accept step. The other app should implement the pending-card flow only if it supports that older invitation system. Do not imply that a Nostr roster membership is waiting for acceptance.

### Team list

The section heading displays **My teams (N)**. With exactly one team, its contents are expanded with no accordion trigger. With multiple teams, each team is an independently expandable accordion item. The team name is bold and truncated if necessary. The creator has a small edit icon next to the name. Inside an expanded team:

1. A creator-only **Add new member** action appears at the upper right.
2. A **Progress** heading precedes one card per active member, including the creator.
3. Pending legacy member IDs, if any, appear under **Invites waiting**.
4. A red outlined icon at the lower right offers **Delete team** for the creator or **Leave team** for a member.

Member and team data may be loading independently. The member area distinguishes **Loading teams…**, **Unable to load team members**, and **No accepted members yet.** The current empty `My teams (0)` area has no explanatory copy, despite an unused `teams_view_empty` translation; the port should show a short create-team prompt there.

### Edit, add, leave, delete

- **Rename:** creator-only centered modal, prefilled name, autofocus, Enter-to-save, Cancel/Save, 80-character limit. Save is disabled for blank or unchanged input; close/cancel is disabled during save. Update the visible heading and toast on success. Warn if the public team updated but the local mirror did not.
- **Add member:** creator-only button opens the same modal pattern as create, with only the ID field and staged list. After success, reload the roster.
- **Leave:** member-only red outline icon, native confirmation containing the team name, success/error toast, then reload. The creator does not get a leave action.
- **Delete:** creator-only red outline trash icon, native confirmation containing the team name, success/error toast, then remove the team and its cached member progress from view.

## 4. Replace the member progress card for the other app

### Existing card anatomy

Today, every accepted member card shows the display name and a small target-language code, three compact metric tiles (Score, Proficiency, Total XP), a labeled **Daily XP** percentage and amber animated wave bar, then a pet panel with avatar, level, health bar, and percentage. Those exact metrics and the entire pet panel must **not** appear in the other app.

### Proposed course card

Keep the same outer card, heading scale, spacing, tiles, and progress-bar style. Replace the contents as follows:

```text
┌ Member name                                      optional status ┐
│ Current chapter     Total course progress     Salary summary    │
│ Chapter N / title   64%                       currency + value  │
│                                                              │
│ Chapter progress                                  7 / 10 · 70% │
│ [ teal wave bar                                           ]     │
│ Daily goal                                      2 / 3 · 67%     │
│ [ amber wave bar                                          ]     │
│ View all chapters ▾  (each chapter's progress on expand)       │
│ Salary numbers: labeled current/target/other values, if shared │
└──────────────────────────────────────────────────────────────┘
```

| Other-app datum | Placement and behavior |
| --- | --- |
| Chapters | Identify the current chapter by localized title and position, such as “Chapter 3 of 8.” Provide a per-member expandable chapter list showing each chapter's localized title, completion state, and progress. Keep the list collapsed by default so teams with many members remain scannable. If there is no active chapter, show a clear empty state rather than an invented chapter. |
| Chapter progress | Label the current chapter's measure and denominator, for example “7 of 10 lessons · 70%,” then show a teal wave bar. In the expanded list, give each chapter its own measure and bar. If a chapter has no known denominator, omit its percentage/bar and show the available chapter status. Do not invent locked/unlocked states if the curriculum does not have them. |
| Daily goals | Show the goal's actual unit and numerator/denominator, for example “2 of 3 lessons today · 67%.” Use the existing amber bar style. Handle a zero or unset goal as “No daily goal set,” not `0%` completion. Reset the measure in the learner's local day/time zone. |
| Total course progress | Show a top metric tile and, if the product benefits from it, a course-wide teal progress bar. The percentage must come from the course's defined completion rule, not an average of chapter percentages unless that is the product's rule. |
| Salary numbers | Show only values the product already defines, with explicit labels, currency, period, and locale formatting. A current/target/difference presentation is suitable **only if those fields exist**. Do not turn salary into a score or gamified progress metric. |

The current three-column metric grid is compact on mobile. Long chapter titles, currency values, and Spanish labels need wrapping or a responsive two/one-column layout; never truncate a salary value in a way that hides its currency or unit. Member name remains first and prominent. Since this app's target-language code is tied to language learning, omit it in the port unless the other app has an equivalent course-language indicator.

For partial data, render `—` or a descriptive unavailable state for missing fields. Do not turn missing salary, progress, or goal data into zero. Clamp displayed percentages to `0–100`, but retain raw numerator/denominator for truthful labels. Use the existing wave animation pattern (0.8-second fill, subtle slow white wave); respect reduced-motion settings.

## 5. Global feed

The existing feed is a **public Nostr hashtag feed** for `#LearnWithNostr`, separate from the team's private-looking roster view. It fetches on component mount; loading shows a small animated orb and “Syncing with the community…”. Failure shows an error card with **Refresh**; no posts shows an empty-state card. Visible post cards use a small stable character portrait, linked author name (to Ditto), optional progress bar, post text with clickable URLs, and a divider. The list is ordered newest first.

The present renderer recognizes question-number posts (out of 120) and older progress posts tagged `purpose=nosaboProgress` or containing “I just reached.” Those filters and XP display are app-specific. In the other app, retain the **feed tab's placement and card language**, but define a course-specific post type and renderer for chapter completions, daily-goal milestones, or total-course milestones if a public feed is desired. Do not display XP/score/pet content or reuse the 120-question denominator. If the other app intentionally shares `#LearnWithNostr`, make the new renderer tolerate both apps' post types. Filter unsupported posts **before** deciding whether the feed is empty, so a fetched list of irrelevant posts does not render a blank panel.

The source component defines a “Copy secret key” handler and related strings but renders no button for it. It is **not** part of the visible drawer design and should not be copied into the port.

## 6. Shared team data and cross-app behavior

The new team roster is public Nostr data. Firestore in this app is a local cache plus compatibility path for older teams and invitations. If the other app is meant to join the **same teams**, use the roster protocol below; do not copy this app's Firestore paths as the shared source of truth. The full protocol is also documented in [`LEARNING_TEAMS.md`](LEARNING_TEAMS.md).

### Roster protocol

- Relays: `wss://relay.primal.net` and `wss://relay.ditto.pub`; publish to both, accepting the write if at least one relay accepts it. Queries can take up to seven seconds.
- Events are Nostr kind `30078`, signed by the matching account key. Use the latest verified event per `(kind, pubkey, d)` address.
- A creator's team address is `d=learning-team:<32-hex-id>`, with `t=learning-team`, `name=<team name>`, and one `p` tag (hex pubkey) for the creator and every member. Content contains JSON `name` and `createdAt`.
- Query teams with `kinds:[30078]`, `#t:["learning-team"]`, and `#p:[<viewer hex pubkey>]`. Show a team to rostered users unless a current leave or delete applies.
- To rename or add members, the creator republishes a newer event at the **same address** with the full active roster and updated name as applicable. Added people appear immediately; there is no Nostr accept event.
- To leave, a member signs `d=learning-team-left:<creator-hex>:<team-id>`, `t=learning-team-left`, and an `a` tag pointing to the team address. Hide the member when the leave timestamp is at least as new as the team event. A later creator republication can re-add that member.
- To delete, the creator republishes the team at the same address with a `deleted` tag and keeps the `p` tags so members can discover the replacement and drop the team.
- If the port has its own local team cache, reconcile it against newer Nostr delete and leave events before rendering. An old cached roster must not resurrect a deleted team or a membership the user left.
- Signing can use a matching NIP-07 signer or matching local `nsec`; a mismatch is an error. Team events are **public**, including team names and roster membership.

### Course progress: a separate event address

This app already uses `d=learning-progress` for a public event containing XP, score, level, daily XP, and pet state. Because kind `30078` events are replaceable by address, the other app **must not** publish its course snapshot at that same `d`: it would replace the current app's snapshot for the same user. Use a distinct app-specific address, for example `d=course-progress`, and an app-specific `t` tag. The following is an **illustrative port contract**, not an existing event in this repository:

```json
{
  "kind": 30078,
  "tags": [["d", "course-progress"], ["t", "course-progress"]],
  "content": "{\"schemaVersion\":1,\"name\":\"Ada\",\"currentChapterId\":\"chapter-3\",\"chapterProgress\":{\"completed\":7,\"total\":10},\"dailyGoal\":{\"completed\":2,\"target\":3,\"unit\":\"lessons\",\"localDate\":\"2026-09-28\"},\"courseProgress\":{\"completed\":32,\"total\":50,\"percent\":64},\"updatedAt\":1790553600}"
}
```

The actual event also needs `created_at` and a valid signature. Define chapter titles and ordering from the course catalog rather than repeating them in every event. Keep stable chapter IDs, a schema version, and a timestamp. The signed-in viewer's row should use a live local snapshot; teammate rows should use their latest verified course-progress events. Publish when Teams opens and debounce relevant changes while it remains open, matching this app's roughly `700ms` behavior. Show a visible sync error if all relays reject a write. This app's member loader also falls back to Firestore user documents; the other app should use its own authenticated data store only for data it is authorized to read.

For the expandable chapter list, publish a compact `chapters` array keyed by stable chapter ID with `completed`, `total`, and an existing curriculum status where applicable. The sample above shows only the current chapter to keep the example short; the full snapshot needs the chapter array if teammates are to inspect every chapter. Resolve all display titles and ordering from the local course catalog. For salary data from a private service, a suitable display model is `{ currency: "MXN", period: "monthly", values: [{ labelKey: "currentSalary", amount: 25000 }, { labelKey: "targetSalary", amount: 35000 }] }`; these field names are illustrative and should map to the other app's actual salary model.

**Salary privacy decision:** Nostr team and progress events are public, and the relays above do not restrict readers to the team. Raw salary numbers should not be included in a public course-progress event by default. If salary is meant to be shared with teammates, require an explicit product decision and user consent; otherwise load it from an access-controlled service or show it only in the user's own card. The card design supports salary numbers regardless of where authorized values come from. Never infer a missing salary from course progress.

## 7. English and Spanish copy

Only provide `en` and `es` catalogs in the other app. Localize every visible action, loading message, validation error, toast, confirmation, and accessibility name. Current source uses English fallbacks for several newer add/edit strings; fill both catalogs explicitly in the port. Use locale-aware number, currency, plural, and date formatting rather than concatenating English fragments.

| English | Spanish |
| --- | --- |
| Teams | Equipos |
| Global feed | Feed global |
| Create team | Crear equipo |
| Copy Your ID | Copiar tu ID |
| Team name | Nombre del equipo |
| Invite teammates | Invitar compañeros |
| Invite | Invitar |
| Members to invite | Miembros para invitar |
| Pending invitations | Invitaciones pendientes |
| Invited by | Invitado por |
| Accept / Decline | Aceptar / Rechazar |
| My teams ({count}) | Mis equipos ({count}) |
| Progress | Progreso |
| Add new member | Agregar miembro |
| Edit team name | Editar nombre del equipo |
| Save / Cancel | Guardar / Cancelar |
| Leave team / Delete team | Salir del equipo / Eliminar equipo |
| Current chapter | Capítulo actual |
| Chapter progress | Progreso del capítulo |
| Daily goal | Meta diaria |
| Total course progress | Progreso total del curso |
| Salary | Salario |
| No daily goal set | Sin meta diaria |
| Loading teams… | Cargando equipos… |
| Unable to load team members | No se pudieron cargar los miembros del equipo |
| No accepted members yet | Aún no hay miembros aceptados |

Confirmation strings should include the team name: “Delete {team}?” / “¿Eliminar {team}?” and “Leave {team}?” / “¿Salir de {team}?”. Localize chapter titles through the other app's curriculum catalog. Format salary with `Intl.NumberFormat` (or equivalent) using the user's locale and the stored currency code; display the pay period as text. Keep a missing name fallback in both languages.

## 8. Implementation checklist

1. Add a Teams activity-menu entry with icon and unseen-invite dot.
2. Mount one bottom drawer with the 80dvh shell, centered 720px content, swipe/close behavior, and Teams/Global feed tabs in the conditional order above.
3. Implement preloading, settled empty state, team count, invite count, and seen/unseen attention separately.
4. Implement create/copy-ID, invite staging and validation, legacy invitation actions if needed, one-team expanded/multi-team accordion, creator-only edit/add/delete, and member-only leave.
5. Replace the member card with current chapter, chapter progress, daily goal, total course progress, and explicitly labeled salary numbers. Remove every XP, score, proficiency, and pet reference from rendered UI and copy.
6. Read/write the shared team roster protocol. Use a distinct versioned course-progress event (or an access-controlled service for sensitive fields); never overwrite `learning-progress`.
7. Build English and Spanish catalogs and verify mobile wrapping, currency formatting, keyboard behavior, reduced motion, loading/error/empty states, and both light/dark themes.

### Source map reviewed

- Drawer and tab logic: `src/components/Teams/TeamsDrawer.jsx`
- Team actions and progress cards: `src/components/Teams/TeamView.jsx`, `TeamCreation.jsx`
- Feed renderer: `src/components/Teams/TeamFeed.jsx`
- Menu, invitation attention, and preload: `src/App.jsx`
- Shared roster and progress events: `src/utils/learningTeams.js`, `src/utils/teams.js`, `LEARNING_TEAMS.md`
- Swipe and progress-bar motion: `src/hooks/useBottomDrawerSwipeDismiss.js`, `src/components/WaveBar.jsx`
- Theme tokens and copy: `src/index.css`, `src/utils/translation.jsx`
