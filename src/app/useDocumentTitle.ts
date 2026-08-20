import { useEffect } from 'react'

const SITE = 'Mockup Studio'

/**
 * Sets the document title for a page.
 *
 * Every route previously shared the one title from index.html, which makes
 * browser history, bookmarks, tab strips and search results indistinguishable
 * from one another — eight entries all reading "Mockup Studio" tell the user
 * nothing about which is which.
 *
 * Restores the previous title on unmount so a route that sets no title of its
 * own does not inherit the last one.
 */
export function useDocumentTitle(title?: string | undefined): void {
  useEffect(() => {
    const previous = document.title
    document.title = title ? `${title} · ${SITE}` : SITE
    return () => {
      document.title = previous
    }
  }, [title])
}
