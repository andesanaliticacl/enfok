/**
 * The starter creature: a little swimming larva, drawn rather than sprited so it
 * scales cleanly and can be tinted to any palette colour. Its tail beats on a
 * loop, which is what sells it as alive and not just a blob.
 */
export function LarvaSprite({ color, size = 192, animate = false }: { color: string; size?: number; animate?: boolean }) {
  return (
    <div style={{ width: size, height: size }} className="relative">
      <svg viewBox="0 0 64 64" className="h-full w-full" role="img" aria-label="Criatura inicial">
        <defs>
          <radialGradient id={`larva-body-${color.replace('#', '')}`} cx="38%" cy="34%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="45%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.85" />
          </radialGradient>
          <filter id="larva-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Soft aura so it reads as a living cell rather than a sticker */}
        <ellipse cx="30" cy="30" rx="20" ry="16" fill={color} opacity="0.16" filter="url(#larva-glow)" />

        {/* Tail: three segments, each swinging slightly later than the one before */}
        <g stroke={color} strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.9">
          <path d="M42 32 q6 -4 11 0">
            {animate && (
              <animate
                attributeName="d"
                dur="1.1s"
                repeatCount="indefinite"
                values="M42 32 q6 -4 11 0; M42 32 q6 4 11 0; M42 32 q6 -4 11 0"
              />
            )}
          </path>
          <path d="M52 32 q5 4 9 0" opacity="0.7">
            {animate && (
              <animate
                attributeName="d"
                dur="1.1s"
                begin="0.12s"
                repeatCount="indefinite"
                values="M52 32 q5 4 9 0; M52 32 q5 -4 9 0; M52 32 q5 4 9 0"
              />
            )}
          </path>
        </g>

        {/* Body */}
        <g>
          {animate && (
            <animateTransform
              attributeName="transform"
              type="translate"
              dur="2.6s"
              repeatCount="indefinite"
              values="0 0; 0 -1.6; 0 0"
              calcMode="spline"
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
              keyTimes="0; 0.5; 1"
            />
          )}
          <ellipse cx="28" cy="32" rx="17" ry="14" fill={`url(#larva-body-${color.replace('#', '')})`} />
          {/* Rim light along the top edge */}
          <path d="M14 27 q8 -9 21 -5" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Eyes — big and close together, which is what makes it endearing */}
          <ellipse cx="23" cy="30" rx="4.6" ry="5" fill="#0b0d12" />
          <ellipse cx="33" cy="30" rx="4.6" ry="5" fill="#0b0d12" />
          <circle cx="24.6" cy="28.2" r="1.7" fill="#ffffff" />
          <circle cx="34.6" cy="28.2" r="1.7" fill="#ffffff" />

          {/* Mouth */}
          <path d="M25 39 q3.5 3 7 0" stroke="#0b0d12" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.75" />
        </g>
      </svg>
    </div>
  )
}
