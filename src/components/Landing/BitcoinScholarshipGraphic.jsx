import React, { useId } from "react";

export default function BitcoinScholarshipGraphic({ label }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      className="lp-bitcoin-graphic"
      viewBox="0 0 340 190"
      role="img"
      aria-label={label}
    >
      <defs>
        <radialGradient id={`${id}-halo`}>
          <stop stopColor="#a6e3da" stopOpacity="0.35" />
          <stop offset="1" stopColor="#a6e3da" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fff0b7" />
          <stop offset="0.45" stopColor="#f8ce6b" />
          <stop offset="1" stopColor="#e9a73d" />
        </linearGradient>
        <linearGradient id={`${id}-face`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffdf8b" />
          <stop offset="1" stopColor="#f2b74b" />
        </linearGradient>
        <linearGradient id={`${id}-pages`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#f0fffb" />
          <stop offset="1" stopColor="#b8e8df" />
        </linearGradient>
      </defs>
      <ellipse cx="176" cy="96" rx="156" ry="94" fill={`url(#${id}-halo)`} />
      <ellipse cx="112" cy="165" rx="61" ry="8" fill="#5b9a91" opacity="0.12" />
      <path
        d="M43 99C24 38 170 3 267 54S299 155 181 162"
        fill="none"
        stroke="#8ccbc2"
        strokeWidth="1.5"
        strokeDasharray="3 7"
        opacity="0.65"
      />
      <path
        d="M168 99C192 90 198 73 221 80"
        fill="none"
        stroke="#80bfb4"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="m214 73 8 7-10 4"
        fill="none"
        stroke="#80bfb4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g transform="rotate(-12 110 91)">
        <circle cx="116" cy="97" r="60" fill="#ca8730" />
        <circle
          cx="110"
          cy="91"
          r="60"
          fill={`url(#${id}-gold)`}
          stroke="#edbc5c"
          strokeWidth="1.5"
        />
        <circle
          cx="110"
          cy="91"
          r="49"
          fill={`url(#${id}-face)`}
          stroke="#ffedab"
          strokeWidth="2"
        />
        <circle
          cx="110"
          cy="91"
          r="44"
          fill="none"
          stroke="#cc8d2c"
          strokeWidth="1"
          strokeDasharray="1 5"
          opacity="0.55"
        />
        <text
          x="110"
          y="114"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontWeight="700"
          fontSize="69"
          fill="#a86720"
          opacity="0.18"
        >
          ₿
        </text>
        <text
          x="109"
          y="112"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontWeight="700"
          fontSize="69"
          fill="#fff5d1"
        >
          ₿
        </text>
        <path
          d="M72 57a49 49 0 0 1 50-13"
          fill="none"
          stroke="#fff9e2"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.75"
        />
      </g>
      <g transform="rotate(8 259 116)">
        <path
          d="M219 90q20-8 40 5 20-13 40-5v49q-20-8-40 5-20-13-40-5Z"
          fill="#72afa3"
          opacity="0.2"
          transform="translate(0 6)"
        />
        <path
          d="M219 90q20-8 40 5 20-13 40-5v49q-20-8-40 5-20-13-40-5Z"
          fill={`url(#${id}-pages)`}
          stroke="#579b8c"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M259 95v49m-30-42q11-3 21 3m-21 8q11-3 21 3m18-11q11-6 21-3m-21 14q11-6 21-3"
          fill="none"
          stroke="#7db9aa"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
      <g fill="none" strokeLinecap="round" strokeWidth="2">
        <path d="M201 26v12m-6-6h12" stroke="#cda65a" />
        <path d="M310 68v8m-4-4h8" stroke="#8abbb1" />
        <path d="M40 139v8m-4-4h8" stroke="#8abbb1" />
      </g>
      <circle cx="288" cy="36" r="3" fill="#e8be67" />
      <circle cx="192" cy="141" r="3" fill="#8ccbc2" />
    </svg>
  );
}
