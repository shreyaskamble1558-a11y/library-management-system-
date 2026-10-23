import ImageWithFallback from './ImageWithFallback'

export default function BookCover({ src, title = 'Library book', category = '', className = '', alt }) {
  const categoryName = String(category).toLowerCase()
  const cover = /science|biology|physics|chemistry|math/i.test(categoryName)
    ? '/assets/book-cover-science.svg'
    : /technology|computer|programming|engineering/i.test(categoryName)
      ? '/assets/book-cover-technology.svg'
      : /fiction|literature|novel|classic/i.test(categoryName)
        ? '/assets/book-cover-literature.svg'
        : '/assets/book-cover-general.svg'

  return <ImageWithFallback src={src || cover} fallback="/assets/book-placeholder.svg" className={`user-cover ${className}`} alt={alt || `Cover artwork for ${title}`} />
}
