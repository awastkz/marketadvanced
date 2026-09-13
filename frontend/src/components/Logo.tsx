import { Link } from 'react-router-dom'

interface LogoProps {
  size?: 'md' | 'lg'
  to?: string
}

export default function Logo({ size = 'md', to = '/' }: LogoProps) {
  return (
    <Link to={to} className="logo" aria-label="MarketAdvanced">
      <span className={`logo-mark${size === 'lg' ? ' is-lg' : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 7h16l-1.5 11h-13L4 7z" />
          <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </span>
      <span>MarketAdvanced</span>
    </Link>
  )
}
