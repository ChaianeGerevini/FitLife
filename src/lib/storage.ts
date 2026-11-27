// Camada de persistência do FitLife (mesma arquitetura atual: localStorage).
// As chaves antigas foram mantidas; formatos antigos são migrados sem perda.

export function read<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback } catch { return fallback }
}
export function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch (e) { console.error('Falha ao salvar', key, e) }
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

/* ---------- Datas ---------- */
export const pad = (n: number) => String(n).padStart(2, '0')
export const dateKey = (d: Date = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const parseKey = (k: string) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d) }
export const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
export const startOfWeek = (d: Date) => addDays(new Date(d.getFullYear(), d.getMonth(), d.getDate()), -d.getDay()) // domingo
export const timeHM = (ts: number) => new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
export const dateBR = (ts: number | string) =>
  (typeof ts === 'string' ? parseKey(ts) : new Date(ts)).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })

/* ---------- Tipos ---------- */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = domingo (Date.getDay)
export const WEEKDAYS: { id: Weekday; short: string; long: string }[] = [
  { id: 1, short: 'Seg', long: 'Segunda-feira' }, { id: 2, short: 'Ter', long: 'Terça-feira' },
  { id: 3, short: 'Qua', long: 'Quarta-feira' }, { id: 4, short: 'Qui', long: 'Quinta-feira' },
  { id: 5, short: 'Sex', long: 'Sexta-feira' }, { id: 6, short: 'Sáb', long: 'Sábado' },
  { id: 0, short: 'Dom', long: 'Domingo' }
]

export type FoodItem = {
  id: string; name: string; portion: string; qty: number // qty = nº de porções; macros abaixo são por porção
  kcal: number; protein: number; carbs: number; fat: number
  days: Weekday[]
}
export type ShopItem = { id: string; name: string; bought: boolean; boughtAt?: number }
export type FastRecord = { id: string; startedAt: number; endedAt: number; targetHours: number; status: 'completed' | 'interrupted' }
export type ActiveFast = { startedAt: number; targetHours: number } | null
export type ExerciseLog = { id: string; name: string; date: string; sets?: number; reps?: number; notes?: string }
export type WeightEntry = { value: number; at: number }

/* ---------- Migrações (preservam registros antigos) ---------- */
const ALL_DAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6]

// Antes: string[] (ex.: "almoço — frango e legumes"). Agora: FoodItem[].
export function migrateFood(raw: unknown): FoodItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map((r: any) => typeof r === 'string'
    ? { id: uid(), name: r, portion: '', qty: 1, kcal: 0, protein: 0, carbs: 0, fat: 0, days: ALL_DAYS }
    : { qty: 1, ...r } as FoodItem)
}
// Antes: string[]. Agora: ShopItem[] (itens antigos ficam como pendentes).
export function migrateShopping(raw: unknown): ShopItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map((r: any) => typeof r === 'string' ? { id: uid(), name: r, bought: false } : r as ShopItem)
}
// Antes: number[] sem data. Agora: WeightEntry[]; a data real das pesagens antigas é desconhecida,
// então elas ficam com at = 0 e não são exibidas com data inventada.
export function migrateWeights(raw: unknown): WeightEntry[] {
  if (!Array.isArray(raw)) return []
  return raw.map((r: any) => typeof r === 'number' ? { value: r, at: 0 } : r as WeightEntry)
}
// Antes: string[] de "exercícios planejados". Agora: o plano continua existindo como lista separada
// (chave antiga preservada) e os exercícios realizados ficam em fitlife-exercise-log.
export function migrateFastActive(raw: any): ActiveFast {
  return raw && typeof raw.startedAt === 'number' ? { startedAt: raw.startedAt, targetHours: raw.targetHours ?? 16 } : null
}
