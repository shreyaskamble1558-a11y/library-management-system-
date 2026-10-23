import ImageWithFallback from './ImageWithFallback'

export default function ProfileAvatar({ kind = 'reader', alt = 'Library member profile illustration', className = '' }) {
  const source = kind === 'admin' ? '/assets/avatar-admin.svg' : '/assets/avatar-reader.svg'
  const fallback = kind === 'admin' ? '/assets/avatar-reader.svg' : '/assets/avatar-admin.svg'
  return <ImageWithFallback src={source} fallback={fallback} alt={alt} className={className} />
}
