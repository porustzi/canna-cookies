import { useEffect, useState } from 'react'

export interface GalleryPhoto {
  src: string
  alt: string
}

export const GALLERY_PHOTOS: GalleryPhoto[] = []

export function useGallery(): GalleryPhoto[] {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(GALLERY_PHOTOS)

  useEffect(() => {
    let alive = true
    fetch('/api/gallery', { headers: { accept: 'application/json' } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { items?: { url?: unknown; alt?: unknown }[] } | null) => {
        if (!alive || !data || !Array.isArray(data.items)) return
        const items: GalleryPhoto[] = data.items
          .filter((item) => typeof item.url === 'string')
          .map((item) => ({ src: String(item.url), alt: typeof item.alt === 'string' ? item.alt : '' }))
        setPhotos(items)
      })
      .catch(() => {
        /* offline — keep fallback */
      })
    return () => {
      alive = false
    }
  }, [])

  return photos
}
