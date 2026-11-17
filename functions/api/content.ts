import { json } from '../_lib/auth'
import type { Env } from '../_lib/auth'
import { kvStore } from '../_lib/store'
import type { ContactsData } from '../_lib/store'

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { env } = context
  const store = kvStore(env)
  if (!store) return json({ contacts: {}, images: {} })

  try {
    const [cs, en, ru, imgAbout, imgHero] = await Promise.all([
      store.getJson<ContactsData>('contacts:cs'),
      store.getJson<ContactsData>('contacts:en'),
      store.getJson<ContactsData>('contacts:ru'),
      store.getJson('img-meta:about'),
      store.getJson('img-meta:hero'),
    ])
    const contacts: Record<string, ContactsData> = {}
    if (cs) contacts.cs = cs
    if (en) contacts.en = en
    if (ru) contacts.ru = ru
    return json(
      {
        contacts,
        images: {
          about: imgAbout ? '/api/media/img-about' : null,
          hero: imgHero ? '/api/media/img-hero' : null,
        },
      },
      200,
      { 'cache-control': 'public, max-age=60' },
    )
  } catch {
    return json({ contacts: {}, images: {} }, 200, { 'cache-control': 'public, max-age=30' })
  }
}
