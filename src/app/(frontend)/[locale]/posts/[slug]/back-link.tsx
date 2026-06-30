'use client'
import React from 'react'

type Props = {
  fallbackHref?: string
  className?: string
  'aria-label'?: string
  children: React.ReactNode
}

function isSameOriginReferrer() {
  const ref = document.referrer
  if (!ref) return false
  try {
    return new URL(ref).origin === window.location.origin
  } catch {
    return false
  }
}

export default function BackLink({
  fallbackHref = '/',
  className,
  children,
  ...rest
}: Props) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return
    }
    if (isSameOriginReferrer()) {
      e.preventDefault()
      window.history.back()
    }
  }
  return (
    <a href={fallbackHref} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  )
}
