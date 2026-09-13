import type { CSSProperties } from 'react'

interface AvatarProps {
  src?: string | null
  name?: string | null
  className?: string
  size?: number
}

export function initialOf(name?: string | null) {
  return (name?.trim().charAt(0) || '?').toUpperCase()
}

export default function Avatar({ src, name, className, size }: AvatarProps) {
  const style = size ? ({ '--size': `${size}px` } as CSSProperties) : undefined
  return (
    <span className={`avatar${className ? ` ${className}` : ''}`} style={style}>
      {src ? <img src={src} alt="" /> : initialOf(name)}
    </span>
  )
}
