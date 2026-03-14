interface IconProps {
  name: string
  className?: string
}

export default function Icon({ name, className = '' }: IconProps) {
  return <i className={`fi fi-rr-${name} ${className}`} aria-hidden="true" />
}
