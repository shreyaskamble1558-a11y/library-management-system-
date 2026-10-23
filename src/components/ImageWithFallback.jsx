import { useEffect, useState } from 'react'

export default function ImageWithFallback({ src, fallback, alt, className = '' }) {
  const [imageSrc, setImageSrc] = useState(src || fallback)
  const [usingFallback, setUsingFallback] = useState(!src)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    setImageSrc(src || fallback)
    setUsingFallback(!src)
    setUnavailable(false)
  }, [src, fallback])

  if (unavailable) return <span className={`${className} image-fallback-mark`} role="img" aria-label={alt} />

  return (
    <img
      className={className}
      src={imageSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (!usingFallback && fallback) {
          setImageSrc(fallback)
          setUsingFallback(true)
        } else {
          setUnavailable(true)
        }
      }}
    />
  )
}
