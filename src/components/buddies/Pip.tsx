import { useViseme } from '../../hooks/useViseme'
import { MOUTH } from '../../lib/visemes'
import { ease, type BuddyProps } from './shared'

/** Pip, a cartoon friend who lip-syncs along with the voice. */
export function Pip({ mood, word, wordKey, wordMs }: BuddyProps) {
  const talking = mood === 'talking' && word !== null
  const listening = mood === 'listening'
  const viseme = useViseme(talking, word, wordKey, wordMs)

  const mouth = MOUTH[viseme]
  const open = mouth.h > 0
  const headTilt = listening ? 7 : talking ? (wordKey % 2 ? 2.5 : -2.5) : 0
  const look = listening ? { x: 4, y: -2 } : { x: 0, y: 0 }

  return (
    <svg viewBox="-30 0 260 214" className="h-auto w-full" role="img" aria-label="Pip, your speaking buddy">
      <defs>
        <linearGradient id="pip-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <radialGradient id="pip-bulb">
          <stop offset="0" stopColor="#fef3c7" />
          <stop offset="1" stopColor="#f59e0b" />
        </radialGradient>
      </defs>

      <ellipse cx="100" cy="204" rx="54" ry="7" fill="#ede9fe" />

      <g className="animate-bob">
        <g
          style={ease(220, { transform: `rotate(${headTilt}deg)`, transformOrigin: '100px 180px' })}
        >
          {/* Antenna: the bulb lights up while Pip talks. */}
          <path d="M100 42 Q96 28 104 18" fill="none" stroke="#8b5cf6" strokeWidth="5" strokeLinecap="round" />
          <circle
            cx="104"
            cy="14"
            r="9"
            fill={talking ? 'url(#pip-bulb)' : '#c4b5fd'}
            className={talking ? 'animate-pulse' : ''}
          />

          {/* Ears */}
          <circle cx="26" cy="104" r="16" fill="url(#pip-skin)" />
          <circle cx="174" cy="104" r="16" fill="url(#pip-skin)" />
          <circle cx="26" cy="104" r="8" fill="#ddd6fe" />
          <circle cx="174" cy="104" r="8" fill="#ddd6fe" />

          {/* Head */}
          <ellipse cx="100" cy="112" rx="78" ry="72" fill="url(#pip-skin)" />
          <ellipse cx="72" cy="66" rx="30" ry="14" fill="#fff" opacity="0.25" transform="rotate(-18 72 66)" />

          {/* Cheeks */}
          <ellipse cx="52" cy="132" rx="12" ry="7" fill="#f9a8d4" style={ease(200, { opacity: talking ? 0.9 : 0.65 })} />
          <ellipse cx="148" cy="132" rx="12" ry="7" fill="#f9a8d4" style={ease(200, { opacity: talking ? 0.9 : 0.65 })} />

          {/* Eyebrows lift while listening. */}
          <g style={ease(250, { transform: `translateY(${listening ? -5 : 0}px)` })}>
            <path d="M58 70 Q70 63 82 69" fill="none" stroke="#4c1d95" strokeWidth="4" strokeLinecap="round" />
            <path d="M118 69 Q130 63 142 70" fill="none" stroke="#4c1d95" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* Eyes blink on their own. */}
          {[70, 130].map((cx) => (
            <g key={cx} className="origin-center animate-blink [transform-box:fill-box]">
              <ellipse cx={cx} cy="96" rx="15" ry="17" fill="#fff" />
              <g style={ease(300, { transform: `translate(${look.x}px, ${look.y}px)` })}>
                <circle cx={cx + 1} cy="98" r="9" fill="#2e1065" />
                <circle cx={cx - 2} cy="94" r="3.2" fill="#fff" />
              </g>
            </g>
          ))}

          {/* Mouth: a closed smile at rest, otherwise an open shape with teeth and tongue. */}
          <path
            d="M84 138 Q100 150 116 138"
            fill="none"
            stroke="#4c1d95"
            strokeWidth="4.5"
            strokeLinecap="round"
            style={ease(90, { opacity: open ? 0 : 1 })}
          />
          <g style={ease(90, { opacity: open ? 1 : 0 })}>
            <ellipse cx="100" cy="142" rx={mouth.w} ry={mouth.h} fill="#3b0764" style={ease(90, { rx: mouth.w, ry: mouth.h })} />
            <ellipse
              cx="100"
              cy={142 - mouth.h + 2.5}
              rx={mouth.w * 0.62}
              ry="2.8"
              fill="#fff"
              style={ease(90, { cy: 142 - mouth.h + 2.5, rx: mouth.w * 0.62, opacity: mouth.teeth })}
            />
            <ellipse
              cx="100"
              cy={142 + mouth.h - 3.5}
              rx={mouth.w * 0.55}
              ry={Math.min(mouth.h * 0.4, 5)}
              fill="#f472b6"
              style={ease(90, {
                cy: 142 + mouth.h - 3.5,
                rx: mouth.w * 0.55,
                ry: Math.min(mouth.h * 0.4, 5),
                opacity: mouth.tongue,
              })}
            />
          </g>
        </g>

        {/* Cupped hand and sound waves: "your turn, I'm listening!" */}
        <g
          style={ease(300, {
            opacity: listening ? 1 : 0,
            transform: `scale(${listening ? 1 : 0.4})`,
            transformOrigin: '186px 112px',
          })}
        >
          <ellipse cx="190" cy="114" rx="11" ry="17" fill="#c4b5fd" transform="rotate(-12 190 114)" />
          <circle cx="198" cy="96" r="5" fill="#c4b5fd" />
          <circle cx="202" cy="106" r="5" fill="#c4b5fd" />
          <g className="animate-pulse" fill="none" stroke="#ec4899" strokeWidth="3" strokeLinecap="round">
            <path d="M204 82 Q214 96 206 110" />
            <path d="M210 72 Q226 94 212 118" opacity="0.6" />
          </g>
        </g>
      </g>
    </svg>
  )
}
