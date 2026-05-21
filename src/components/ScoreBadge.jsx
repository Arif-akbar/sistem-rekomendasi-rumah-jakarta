import { getRecommendationLabel } from '../lib/Recommend'

/**
 * Badge skor kecocokan berbentuk lingkaran SVG.
 * Digunakan di PropertyCard dan MapView.
 *
 * @param {number} score  - Skor 0-100
 * @param {number} size   - Ukuran SVG (default 44)
 */
export default function ScoreBadge({ score, size = 44 }) {
  if (!score && score !== 0) return null

  // Violet for high score, Cyan for mid, Fuchsia/Amber for low
  const color = score >= 80 ? '#8b5cf6' : score >= 60 ? '#06b6d4' : '#d946ef'
  const radius = 15
  const circumference = 2 * Math.PI * radius
  const { label } = getRecommendationLabel(score)

  return (
    <div
      className="flex items-center justify-center relative group"
      title={`${label}: ${score}%`}
    >
      <div className="absolute inset-0 rounded-full blur-md opacity-30 transition-opacity duration-300 group-hover:opacity-60" style={{ backgroundColor: color }} />
      <svg width={size} height={size} viewBox="0 0 44 44" className="relative z-10">
        <defs>
          <filter id={`glow-${score}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Background circle */}
        <circle
          cx="22" cy="22" r="18"
          fill="rgba(5,5,10,0.8)"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
          style={{ backdropFilter: 'blur(4px)' }}
        />
        {/* Progress arc shadow (base path) */}
        <circle
          cx="22" cy="22" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="2.5"
        />
        {/* Progress arc */}
        <circle
          cx="22" cy="22" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 22 22)"
          filter={`url(#glow-${score})`}
        />
        {/* Score text */}
        <text
          x="22" y="26"
          textAnchor="middle"
          fill={color}
          fontSize="11"
          fontFamily="Outfit, sans-serif"
          fontWeight="bold"
        >
          {score}%
        </text>
      </svg>
    </div>
  )
}
