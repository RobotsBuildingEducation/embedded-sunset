import { doc, onSnapshot } from "firebase/firestore";

export function listenToChessRoom(
  database,
  code,
  { onRoom, onConnection, onError },
) {
  if (!/^[A-Za-z0-9]{6}$/.test(code)) throw new Error("Invalid room code.");
  return onSnapshot(
    doc(database, "chessRooms", code),
    { includeMetadataChanges: true },
    (snapshot) => {
      // Firestore can emit optimistic local writes before rejecting them via
      // rules. Only the server is allowed to supply an accepted game state.
      if (!snapshot.exists()) {
        onError(
          new Error("This room is no longer available. Start a new game."),
        );
        return;
      }
      onConnection(true);
      if (snapshot.metadata.hasPendingWrites) return;
      onRoom(snapshot.data());
    },
    (error) => {
      onConnection(false);
      onError(error);
    },
  );
}
