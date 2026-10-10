import leoImage from '../../assets/leo.webp'
import { useViseme } from '../../hooks/useViseme'
import { MOUTH } from '../../lib/visemes'
import { ease, type BuddyProps } from './shared'

// Positions are in the original 1145x1374 artwork's pixels; leo.webp is the crop below,
// with the background removed.
const CROP = { x: 120, y: 0, width: 905, height: 1000 }
const MOUTH_AT = { x: 575, y: 607 }
const EYES = [
  { cx: 440, cy: 483, rx: 70, ry: 65 },
  { cx: 710, cy: 482, rx: 70, ry: 64 },
]
const GLOWS = [
  { cx: 256, cy: 480, rx: 24, ry: 110 },
  { cx: 886, cy: 495, rx: 22, ry: 95 },
  { cx: 575, cy: 747, rx: 38, ry: 9 },
]
// Zoomed in slightly so breathing and head tilts never show the cropped bottom edge.
const OVERSCAN = 1.05
const CENTER = { x: CROP.x + CROP.width / 2, y: CROP.y + CROP.height / 2 }

/**
 * Leo, drawn from a still illustration. His original smile shows at rest; while he talks,
 * a soft skin-coloured patch covers it and an animated mouth is drawn on top. Eyelids blink,
 * he breathes, and the lights on his headphones glow while he speaks.
 */
export function Leo({ mood, word, wordKey, wordMs }: BuddyProps) {
  const talking = mood === 'talking' && word !== null
  const listening = mood === 'listening'
  const viseme = useViseme(talking, word, wordKey, wordMs)
  const mouth = MOUTH[viseme]
  const mouthOpen = viseme !== 'rest'
  const tilt = listening ? 3 : talking ? (wordKey % 2 ? 1 : -1) : 0

  return (
    <svg
      viewBox={`${CROP.x} ${CROP.y} ${CROP.width} ${CROP.height}`}
      className="h-auto w-full"
      role="img"
      aria-label="Leo, your speaking buddy"
    >
      <defs>
        <linearGradient id="leo-mouth-skin" gradientUnits="userSpaceOnUse" x1="-85" y1="0" x2="95" y2="0">
          <stop offset="0" stopColor="#eed8d4" />
          <stop offset="0.5" stopColor="#f2dcd7" />
          <stop offset="1" stopColor="#f8e2dc" />
        </linearGradient>
        <linearGradient id="leo-lid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ead1cd" />
          <stop offset="1" stopColor="#f9dcd9" />
        </linearGradient>
        <filter id="leo-soft" x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id="leo-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      <g transform={`translate(${CENTER.x} ${CENTER.y}) scale(${OVERSCAN}) translate(${-CENTER.x} ${-CENTER.y})`}>
        <g className="origin-bottom animate-breathe [transform-box:fill-box]">
          <g
            className="[transform-box:fill-box]"
            style={ease(260, { transform: `rotate(${tilt}deg)`, transformOrigin: '50% 100%' })}
          >
            <image href={leoImage} x={CROP.x} y={CROP.y} width={CROP.width} height={CROP.height} />

            {/* Headphone and neck lights glow while Leo talks or listens. */}
            <g
              filter="url(#leo-glow)"
              className={talking ? 'animate-pulse' : ''}
              style={ease(300, { opacity: talking || listening ? 0.85 : 0, mixBlendMode: 'screen' })}
            >
              {GLOWS.map((glow, i) => (
                <ellipse key={i} {...glow} fill="#c084fc" />
              ))}
            </g>

            {/* Closed eyes flash in for a moment every few seconds: soft lids with curved lashes. */}
            {EYES.map((eye, i) => (
              <g key={i} className="animate-lid">
                <ellipse
                  cx={eye.cx}
                  cy={eye.cy}
                  rx={eye.rx + 8}
                  ry={eye.ry + 8}
                  fill="url(#leo-lid)"
                  filter="url(#leo-soft)"
                />
                <path
                  d={`M${eye.cx - eye.rx + 8} ${eye.cy + 6} Q${eye.cx} ${eye.cy + 40} ${eye.cx + eye.rx - 8} ${eye.cy + 6}`}
                  fill="none"
                  stroke="#2b2230"
                  strokeWidth="9"
                  strokeLinecap="round"
                />
              </g>
            ))}

            {/* Mouth: hide the painted smile under a soft patch, then draw the current shape. */}
            <g
              transform={`translate(${MOUTH_AT.x} ${MOUTH_AT.y})`}
              style={ease(90, { opacity: mouthOpen ? 1 : 0 })}
            >
              <ellipse cx="0" cy="0" rx="82" ry="28" fill="url(#leo-mouth-skin)" filter="url(#leo-soft)" />
              <g transform="scale(3.2 2.8)">
                <ellipse
                  cx="0"
                  cy="0"
                  rx={mouth.w}
                  ry={Math.max(mouth.h, 0.8)}
                  fill="#3a2030"
                  stroke="#241820"
                  strokeWidth="0.9"
                  style={ease(90, { rx: mouth.w, ry: Math.max(mouth.h, 0.8) })}
                />
                <ellipse
                  cx="0"
                  cy={-mouth.h + 2.5}
                  rx={mouth.w * 0.62}
                  ry="2.6"
                  fill="#fff"
                  style={ease(90, { cy: -mouth.h + 2.5, rx: mouth.w * 0.62, opacity: mouth.teeth })}
                />
                <ellipse
                  cx="0"
                  cy={mouth.h - 3.5}
                  rx={mouth.w * 0.55}
                  ry={Math.min(mouth.h * 0.4, 5)}
                  fill="#e8798f"
                  style={ease(90, {
                    cy: mouth.h - 3.5,
                    rx: mouth.w * 0.55,
                    ry: Math.min(mouth.h * 0.4, 5),
                    opacity: mouth.tongue,
                  })}
                />
              </g>
            </g>
          </g>

          {/* Sound waves by his headphones: "your turn, I'm listening!" */}
          <g
            className="animate-pulse"
            fill="none"
            stroke="#ec4899"
            strokeWidth="9"
            strokeLinecap="round"
            style={ease(300, { opacity: listening ? 1 : 0 })}
          >
            <path d="M932 410 Q958 480 934 550" />
            <path d="M956 385 Q990 480 960 575" opacity="0.6" />
          </g>
        </g>
      </g>
    </svg>
  )
}
