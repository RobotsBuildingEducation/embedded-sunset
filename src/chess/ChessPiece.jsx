/* eslint-disable react/prop-types -- Internal renderer receives chess.js piece enums. */

// Local SVGs keep the silhouettes crisp and their white/black fills independent
// of the translucent territory layer beneath them.
export default function ChessPiece({ type, color }) {
  const common = {
    fill: color === "w" ? "#fffdf5" : "#26312e",
    stroke: color === "w" ? "#4f5953" : "#131c18",
    strokeWidth: 1.6,
    strokeLinejoin: "round",
    strokeLinecap: "round",
  };
  return (
    <svg
      className={`chess-piece piece-${color}`}
      viewBox="0 0 48 48"
      aria-hidden="true"
      {...common}
    >
      {type === "p" && (
        <>
          <circle cx="24" cy="13" r="5.4" />
          <path d="M20 19h8l-1 6 5 10H16l5-10z" />
        </>
      )}
      {type === "r" && (
        <>
          <path d="M13 8h6v5h3V8h4v5h3V8h6v11l-5 4 2 12H16l2-12-5-4z" />
          <path d="M18 20h12M19 26h10" fill="none" />
        </>
      )}
      {type === "n" && (
        <>
          <path d="m15 35 2-10 9-7-7 1-4 4-5-4 7-10 3-1 1-5 6 5c11 3 11 14 9 27z" />
          <path d="m25 13 2 2M27 22c-2 2-4 5-4 8" fill="none" />
        </>
      )}
      {type === "b" && (
        <>
          <circle cx="24" cy="6" r="2.5" />
          <path d="M24 9c-13 9-9 14-4 16l-4 10h16l-4-10c5-2 9-7-4-16z" />
          <path d="m26 14-5 7M20 26h8" fill="none" />
        </>
      )}
      {type === "q" && (
        <>
          <path d="m12 14 6 5 6-9 6 9 6-5-5 16 2 5H15l2-5z" />
          <circle cx="11" cy="11" r="2.5" />
          <circle cx="24" cy="7" r="2.5" />
          <circle cx="37" cy="11" r="2.5" />
          <path d="M17 29h14" fill="none" />
        </>
      )}
      {type === "k" && (
        <>
          <path d="M24 3v10M20 7h8" fill="none" strokeWidth="2.6" />
          <path d="M24 15c-10-9-16 3-7 11l-2 9h18l-2-9c9-8 3-20-7-11z" />
          <path d="M24 15v10M18 27h12" fill="none" />
        </>
      )}
      <path d="M15 35h18l3 5H12z" />
      <path d="M12 40h24v3H12z" />
    </svg>
  );
}
