export type ContactCard = { label: string; value: string; status: string; href?: string }
export type ContactsData = { cards: ContactCard[]; note: string }
export type GalleryItem = { id: string; alt: string; created: number; mime: string; url: string }

export type AdminState = {
  kv: boolean
  contacts: { cs: ContactsData | null; en: ContactsData | null; ru: ContactsData | null }
  gallery: GalleryItem[]
  images: { about: boolean; hero: boolean }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  })
  if (res.status === 401) {
    location.reload()
    throw new Error('Сессия истекла — войдите снова.')
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? `Ошибка ${res.status}`)
  }
  return (await res.json()) as T
}

export const api = {
  state: () => req<AdminState>('/admin/api/state'),
  saveContacts: (lang: string, data: ContactsData) =>
    req<{ ok: boolean }>(`/admin/api/contacts/${lang}`, { method: 'PUT', body: JSON.stringify(data) }),
  resetContacts: (lang: string) => req<{ ok: boolean }>(`/admin/api/contacts/${lang}`, { method: 'DELETE' }),
  addPhoto: (alt: string, mime: string, data: string) =>
    req<{ ok: boolean; id: string }>('/admin/api/gallery', { method: 'POST', body: JSON.stringify({ alt, mime, data }) }),
  setPhotoAlt: (id: string, alt: string) =>
    req<{ ok: boolean }>(`/admin/api/gallery/${id}`, { method: 'PUT', body: JSON.stringify({ alt }) }),
  deletePhoto: (id: string) => req<{ ok: boolean }>(`/admin/api/gallery/${id}`, { method: 'DELETE' }),
  reorderPhotos: (ids: string[]) =>
    req<{ ok: boolean }>('/admin/api/gallery/reorder', { method: 'POST', body: JSON.stringify({ ids }) }),
  uploadImage: (name: string, mime: string, data: string) =>
    req<{ ok: boolean }>(`/admin/api/image/${name}`, { method: 'POST', body: JSON.stringify({ mime, data }) }),
  deleteImage: (name: string) => req<{ ok: boolean }>(`/admin/api/image/${name}`, { method: 'DELETE' }),
}

export async function fileToPayload(file: File, opts: { maxSide: number; quality: number; keepPng: boolean }): Promise<{ mime: string; data: string }> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, opts.maxSide / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas-unavailable')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  const keepPng = opts.keepPng && file.type === 'image/png'
  const mime = keepPng ? 'image/png' : 'image/jpeg'
  const url = keepPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', opts.quality)
  const data = url.slice(url.indexOf(',') + 1)
  const bytes = Math.round((data.length * 3) / 4)
  if (bytes > 2_400_000) throw new Error('Файл слишком большой после обработки.')
  return { mime, data }
}
