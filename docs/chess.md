# Chess

`/chess` creates a room and replaces the URL with `/chess/<six-character-code>`.
The public chess entry point is lazy-loaded independently of the learning app so
onboarding and saved-course redirects cannot intercept invitations.

Existing `local_npub` / `local_nsec` identities are reused and their `users/<npub>`
profile is fetched. New visitors receive a Nostr keypair and a minimal user
document. Private keys stay in local storage; only public identity and signed
requests reach the API. NIP-07 accounts use their existing extension signer.

The creator plays White. The first other identity to join gets Black, atomically;
additional visitors spectate. Opening an invite in another tab of the same
browser restores the same player. To test two players, use separate browser
profiles. Rooms and full SAN move history persist in the separate, top-level
`chessRooms/<code>` collection, never underneath a user's profile.

Each browser attaches a Firestore `onSnapshot` listener to its single room
document. The initial snapshot loads the state, and subsequent server changes
deliver updates directly to players and spectators. There is no timed room GET
loop and no Cloud Function invocation for each room update. Writes still go
through the signed API. The listener is detached on navigation or when the game
finishes. Cached snapshots and offline events pause moves until a fresh server
snapshot arrives; the SDK reconnects automatically, with a manual reconnect
button for terminal listener errors.

Firestore rules allow reading an individual room by its invite code, matching
the existing room API's visibility. They deny collection queries and all direct
client writes. A room listener does not read either player's `users` document.
The legacy GET endpoint remains available for older clients, but current clients
use the listener.

`chess.js` validates moves on both sides of the API. Only the server can write
`chessRooms`. Nostr signatures authenticate mutations; transactions enforce the
seat, current ply, game status and turn. Castling, en passant, all four promotion
choices, checkmate, resignation and automatic draws are supported. History is
replayed to preserve repetition detection after reloads.

## Territory

Teal marks White's legal destinations and purple Black's. Shared destinations
layer translucent teal and purple washes, blending through the center while
keeping both colors and the underlying checkerboard visible.
Each side is evaluated as if it moved next; en passant is retained only for the
actual side to move. This is a destination map, not an attack/defense map: empty
pawn diagonals and squares occupied by friendly pieces are not colored merely
because they are defended. Selected pieces show their actual legal moves.

## Gemini

The current bot UI calls `chessModel` (`gemini-3.7-flash`) directly through
Firebase Vertex AI. Each turn attempt makes one generation request, including
forced moves. It requests native thought summaries with `includeThoughts: true`
and an Elo-dependent thinking level. Completed lines from the stream drive both
the loader and the saved steps verbatim. The final JSON contains the legal move
and a short explanation, without requesting a second set of steps. Thought
signatures are opaque metadata, not readable reasoning.

`chessBot.js` assembles answer JSON from non-thought stream parts because the
installed Vertex AI SDK loses thought flags and can reject signature-only parts
when aggregating a response. Stream failures or invalid moves leave the board
unchanged and expose the existing manual retry button. There are no automatic
generation retries, alternate models, random moves, or canned reasoning steps.

The following describes the legacy server bot endpoint, which the current bot UI
does not call:

The `chessApi` Cloud Function calls Gemini on Vertex AI using its service account.
It supplies the FEN, full move history, exact legal SAN choices, and a prompt
targeting the room's selected Elo (1500 by default). This is an unrated target, not a calibrated engine
rating. Invalid model output is retried once. Failures preserve the position and
offer a retry; no random or local-engine fallback impersonates Gemini.
A short Firestore lease prevents duplicate paid generations across tabs.

The **Change difficulty level** button beside Gemini opens an accessible slider
from 400–2400 Elo in 100-point steps, with five friendly difficulty bands and
practice suggestions. These bands are guidance for this app, not official rating
classifications. Only the player facing Gemini can change the setting. It is saved
as `botElo` in the room and survives refreshes; flipping the board keeps the control
beside Gemini. Each bot request captures the current difficulty when its lease is
acquired, so changing difficulty during a pending move affects subsequent turns.
`functions/chessDifficulty.json` supplies both the UI descriptions and the server's
level-specific play instructions.

`CHESS_GEMINI_MODEL` may be set in the Functions environment; it defaults to
`gemini-3.5-flash-lite`, matching the app's existing Gemini model. The deployed
function's service account needs Vertex AI access (typically `roles/aiplatform.user`)
and the Vertex AI API must be enabled. Local bot requests use the emulator's
Google credentials and call the real Vertex AI API.

## Run and verify

Start the existing local stack with `npm run dev`, then open
`http://localhost:4445/chess`. Vite proxies `/api/chess` to the Functions emulator;
the admin SDK uses the Firestore emulator automatically.
The chess listener uses a separate Firebase app instance. In development its
WebChannel endpoint is proxied through Vite to the Firestore emulator, so local
tabs, other devices, and HTTPS development tunnels use the same database as the
API. Production listeners connect directly to Firestore with App Check.

```sh
node --test src/chess/chessLogic.test.js functions/chess.test.js
CHESS_EMULATOR_TESTS=true node --test functions/chess.integration.test.js
CHESS_EMULATOR_TESTS=true node --test src/chess/chessRoomListener.integration.test.js
npm run build
```

The integration test requires the local Firestore emulator at `127.0.0.1:8080`,
creates its own disposable users/rooms, and deletes only those test documents.
Its Gemini generator is injected so the test does not consume model requests.

Production rollout needs the new `chessApi` function, Firestore rules, and hosting
build/rewrites deployed together. The existing SPA fallback serves both routes.

References: [chess.js documentation](https://github.com/jhlywa/chess.js/blob/master/website/docs/index.md)
and [Firestore transactions](https://firebase.google.com/docs/firestore/manage-data/transactions).
See also [Firestore snapshot listeners](https://firebase.google.com/docs/firestore/query-data/listen)
and [snapshot cache metadata](https://firebase.google.com/docs/firestore/manage-data/enable-offline).
