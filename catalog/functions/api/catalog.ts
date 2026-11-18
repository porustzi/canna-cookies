import { DEFAULT_CATALOG } from '../_lib/defaults'
import { json, readJson, type Env } from '../_lib/kv'

export async function onRequestGet(context: { env: Env }): Promise<Response> {
  const { env } = context
  const [categories, products, districts, settings, faq] = await Promise.all([
    readJson(env, 'catalog:categories', DEFAULT_CATALOG.categories),
    readJson(env, 'catalog:products', DEFAULT_CATALOG.products),
    readJson(env, 'catalog:districts', DEFAULT_CATALOG.districts),
    readJson(env, 'catalog:settings', DEFAULT_CATALOG.settings),
    readJson(env, 'catalog:faq', DEFAULT_CATALOG.faq),
  ])
  return json({ categories, products, districts, settings, faq })
}
