const RAW_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
export const API_BASE = RAW_BASE.replace(/\/$/, '')

export type ApiResponse<T> = {
  status: number
  ok: boolean
  data: T | null
  error?: { error: string; issues?: { path: string; message: string }[] }
  cache?: 'HIT' | 'MISS'
  durationMs: number
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const start = performance.now()
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  })
  const durationMs = Math.round(performance.now() - start)
  const cacheHeader = res.headers.get('x-cache')
  const cache =
    cacheHeader === 'HIT' || cacheHeader === 'MISS' ? cacheHeader : undefined

  const text = await res.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }

  if (!res.ok) {
    return {
      status: res.status,
      ok: false,
      data: null,
      error: typeof body === 'object' && body ? (body as never) : { error: String(body) },
      cache,
      durationMs,
    }
  }
  return { status: res.status, ok: true, data: body as T, cache, durationMs }
}

export type HealthResponse = { status: string }
export type LoginResponse = { token: string; expires_in: number }
export type Leg = { flightNum: string; dep: string; arr: string; duration: number }
export type Hotel = { name: string; nights: number; price: number }
export type Activity = { title: string; price: number }
export type OfferSummary = {
  id: string
  provider: string
  price: number
  currency: string
  legs: Leg[]
  hotel: Hotel | null
  activity: Activity | null
}
export type OfferDetail = OfferSummary & {
  from: string
  to: string
  departDate: string
  returnDate: string
  relatedOffers: string[]
}
export type RecoEntry = { city: string; score: number }
export type StatEntry = { to: string; count: number }
export type SeedResult = { inserted: number; indexes: string[] }
export type CreateOfferInput = {
  from: string
  to: string
  departDate: string
  returnDate: string
  provider: string
  price: number
  currency: string
  legs: Leg[]
  hotel?: Hotel | null
  activity?: Activity | null
}

export const api = {
  health: () => request<HealthResponse>('/health'),
  login: (userId: string) =>
    request<LoginResponse>('/login', { method: 'POST', body: JSON.stringify({ userId }) }),
  searchOffers: (params: { from: string; to: string; limit?: number; q?: string }) => {
    const sp = new URLSearchParams({ from: params.from, to: params.to })
    if (params.limit) sp.set('limit', String(params.limit))
    if (params.q) sp.set('q', params.q)
    return request<OfferSummary[]>(`/offers?${sp}`)
  },
  getOffer: (id: string) => request<OfferDetail>(`/offers/${id}`),
  createOffer: (body: CreateOfferInput) =>
    request<OfferDetail>('/offers', { method: 'POST', body: JSON.stringify(body) }),
  getReco: (city: string, k = 3) =>
    request<RecoEntry[]>(`/reco?city=${encodeURIComponent(city)}&k=${k}`),
  getStats: (limit = 5) => request<StatEntry[]>(`/stats/top-destinations?limit=${limit}`),
  getMetrics: () => request<string>('/metrics'),
  seedMongo: () => request<SeedResult>('/admin/seed', { method: 'POST' }),
}

export function subscribeToOffers(handlers: {
  onReady?: () => void
  onMessage: (payload: { offerId: string; from: string; to: string }) => void
  onError?: (err: Event) => void
}): () => void {
  const url = `${API_BASE}/events/offers`
  const es = new EventSource(url)
  es.addEventListener('ready', () => handlers.onReady?.())
  es.addEventListener('offers:new', (e) => {
    const data = JSON.parse((e as MessageEvent).data)
    handlers.onMessage(data)
  })
  es.onerror = (e) => handlers.onError?.(e)
  return () => es.close()
}
