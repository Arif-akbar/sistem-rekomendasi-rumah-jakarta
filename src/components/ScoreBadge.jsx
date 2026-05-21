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

  const color = score >= 80 ? '#00d4aa' : score >= 60 ? '#60a5fa' : '#f59e0b'
  const radius = 15
  const circumference = 2 * Math.PI * radius
  const { label } = getRecommendationLabel(score)

  return (
    <div
      className="flex items-center justify-center"
      title={`${label}: ${score}%`}
    >
      <svg width={size} height={size} viewBox="0 0 44 44">
        {/* Background circle */}
        <circle
          cx="22" cy="22" r="18"
          fill="rgba(3,7,18,0.85)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
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
          opacity="0.8"
        />
        {/* Score text */}
        <text
          x="22" y="26"
          textAnchor="middle"
          fill={color}
          fontSize="10"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {score}%
        </text>
      </svg>
    </div>
  )
}
