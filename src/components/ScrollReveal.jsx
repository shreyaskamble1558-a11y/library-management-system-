import { useEffect, useRef, useState } from 'react'

let revealObserver
const revealCallbacks = new WeakMap()

function observeReveal(element, onReveal) {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        revealCallbacks.get(entry.target)?.()
        revealObserver.unobserve(entry.target)
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' })
  }

  revealCallbacks.set(element, onReveal)
  revealObserver.observe(element)
  return () => {
    revealObserver.unobserve(element)
    revealCallbacks.delete(element)
  }
}

export default function ScrollReveal({ as: Element = 'div', children, className = '', delay = 0, ...props }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      setVisible(true)
      return undefined
    }

    if (!ref.current) return undefined
    return observeReveal(ref.current, () => setVisible(true))
  }, [])

  return <Element {...props} ref={ref} className={`scroll-reveal ${visible ? 'scroll-revealed' : ''} ${className}`} style={{ '--reveal-delay': `${delay}ms` }}>{children}</Element>
}
