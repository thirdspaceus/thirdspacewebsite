import React from 'react';

type LocationGlobeProps = {
  markerLabel: string;
  markerX?: number;
  markerY?: number;
};

const latitudePaths = [
  'M 80 360 C 220 325, 680 325, 820 360',
  'M 62 406 C 215 362, 685 362, 838 406',
  'M 45 455 C 212 400, 688 400, 855 455',
  'M 30 512 C 210 445, 690 445, 870 512',
  'M 20 580 C 208 505, 692 505, 880 580',
];

const longitudePaths = [
  'M 450 250 C 420 355, 418 500, 450 702',
  'M 365 260 C 310 360, 300 510, 345 700',
  'M 285 286 C 200 380, 178 523, 232 695',
  'M 208 328 C 108 418, 78 545, 138 688',
  'M 535 260 C 590 360, 600 510, 555 700',
  'M 615 286 C 700 380, 722 523, 668 695',
  'M 692 328 C 792 418, 822 545, 762 688',
];

const continentPaths = [
  'M 186 346 C 225 320, 258 308, 287 312 C 306 314, 314 325, 316 341 C 318 360, 297 381, 268 400 C 243 416, 219 434, 207 459 C 192 490, 189 533, 202 579 C 213 618, 214 645, 196 664',
  'M 341 301 C 393 293, 433 301, 457 319 C 472 330, 479 348, 474 365 C 468 386, 447 400, 426 412 C 397 428, 381 451, 386 480 C 390 502, 406 518, 430 526 C 455 535, 467 552, 463 576 C 455 618, 408 650, 365 662',
  'M 480 318 C 534 306, 595 307, 653 323 C 697 334, 736 352, 769 379 C 793 399, 806 420, 805 444 C 803 463, 789 478, 766 491 C 728 513, 685 523, 646 534 C 601 547, 563 572, 535 608',
  'M 604 257 C 626 247, 650 244, 672 252 C 688 258, 694 269, 690 282 C 684 300, 663 314, 636 320',
  'M 694 548 C 717 540, 742 544, 761 558 C 777 570, 783 586, 777 603 C 770 624, 750 638, 724 647',
];

const dotRows = Array.from({ length: 14 }, (_, row) => {
  const y = 330 + row * 24;
  const xStart = 145 + row * 8;
  const xEnd = 755 - row * 8;
  const count = 28;

  return Array.from({ length: count }, (_, column) => ({
    cx: xStart + ((xEnd - xStart) / (count - 1)) * column,
    cy: y + (column % 2 === 0 ? 0 : 2),
  }));
});

export const LocationGlobe = ({
  markerLabel,
  markerX = 262,
  markerY = 534,
}: LocationGlobeProps) => {
  return (
    <div className="relative w-full max-w-[820px]">
      <div className="pointer-events-none absolute inset-x-[10%] top-[18%] h-32 rounded-full bg-brand-orange/10 blur-3xl" />
      <svg
        viewBox="0 0 900 720"
        className="h-auto w-full"
        aria-label={markerLabel}
        role="img"
      >
        <defs>
          <linearGradient id="globeFade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="65%" stopColor="rgba(255,255,255,0.5)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.12)" />
          </linearGradient>
          <radialGradient id="horizonGlow" cx="50%" cy="18%" r="80%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <clipPath id="globeClip">
            <ellipse cx="450" cy="620" rx="430" ry="390" />
          </clipPath>
          <filter id="markerGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="9" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0
                      0 0.427 0 0 0
                      0 0 0.157 0 0
                      0 0 0 1 0"
            />
          </filter>
        </defs>

        <ellipse
          cx="450"
          cy="620"
          rx="430"
          ry="390"
          fill="url(#horizonGlow)"
          opacity="0.55"
        />

        <g clipPath="url(#globeClip)">
          <ellipse
            cx="450"
            cy="620"
            rx="430"
            ry="390"
            fill="rgba(255,255,255,0.015)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1.5"
          />

          {latitudePaths.map((path) => (
            <path
              key={path}
              d={path}
              fill="none"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="1.5"
            />
          ))}

          {longitudePaths.map((path) => (
            <path
              key={path}
              d={path}
              fill="none"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="1.5"
            />
          ))}

          {dotRows.flat().map(({ cx, cy }) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.6" fill="rgba(255,255,255,0.28)" />
          ))}

          {continentPaths.map((path) => (
            <path
              key={path}
              d={path}
              fill="none"
              stroke="url(#globeFade)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
            />
          ))}

          <ellipse
            cx="450"
            cy="620"
            rx="430"
            ry="390"
            fill="none"
            stroke="rgba(255,255,255,0.26)"
            strokeWidth="1.5"
          />
        </g>

        <g className="origin-center animate-[globe-pulse_2.8s_ease-in-out_infinite]">
          <circle cx={markerX} cy={markerY} r="20" fill="#ff6d28" opacity="0.32" filter="url(#markerGlow)" />
          <circle cx={markerX} cy={markerY} r="8" fill="#ff6d28" />
          <circle cx={markerX} cy={markerY} r="3.5" fill="#fff4eb" />
        </g>
      </svg>
    </div>
  );
};
