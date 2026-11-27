import { useState } from 'react'
import { CalendarDays, Pencil, Plus, Trash2, X } from 'lucide-react'
import { uid, WEEKDAYS, type FoodItem, type Weekday } from '../lib/storage'

type P = { items: FoodItem[]; setItems: (v: FoodItem[]) => void }
type Form = { id?: string; name: string; portion: string; qty: string; kcal: string; protein: string; carbs: string; fat: string; days: Weekday[] }
const empty = (day: Weekday): Form => ({ name: '', portion: '', qty: '1', kcal: '', protein: '', carbs: '', fat: '', days: [day] })
const num = (s: string) => { const n = parseFloat(s.replace(',', '.')); return Number.isFinite(n) && n >= 0 ? n : 0 }
const fmt = (n: number) => (Math.round(n * 10) / 10).toString().replace('.', ',')

export default function FoodTab({ items, setItems }: P) {
  const today = new Date().getDay() as Weekday
  const [day, setDay] = useState<Weekday>(today)
  const [form, setForm] = useState<Form | null>(null)
  const [error, setError] = useState('')

  const list = items.filter(i => i.days.includes(day))
  // Total = valor por porção × quantidade de porções
  const total = list.reduce((t, i) => ({
    kcal: t.kcal + i.kcal * i.qty, protein: t.protein + i.protein * i.qty, carbs: t.carbs + i.carbs * i.qty, fat: t.fat + i.fat * i.qty
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0 })

  const edit = (i: FoodItem) => { setError(''); setForm({ id: i.id, name: i.name, portion: i.portion, qty: String(i.qty), kcal: String(i.kcal || ''), protein: String(i.protein || ''), carbs: String(i.carbs || ''), fat: String(i.fat || ''), days: i.days }) }
  const toggleDay = (d: Weekday) => form && setForm({ ...form, days: form.days.includes(d) ? form.days.filter(x => x !== d) : [...form.days, d] })
  const save = () => {
    if (!form) return
    if (!form.name.trim()) return setError('Informe o nome do alimento.')
    if (!form.days.length) return setError('Selecione ao menos um dia da semana.')
    const item: FoodItem = { id: form.id ?? uid(), name: form.name.trim(), portion: form.portion.trim(), qty: num(form.qty) || 1, kcal: num(form.kcal), protein: num(form.protein), carbs: num(form.carbs), fat: num(form.fat), days: form.days }
    setItems(form.id ? items.map(i => i.id === form.id ? item : i) : [...items, item])
    setDay(item.days.includes(day) ? day : item.days[0]); setForm(null); setError('')
  }
  const remove = (id: string) => { setItems(items.filter(i => i.id !== id)); if (form?.id === id) setForm(null) }
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => form && setForm({ ...form, [k]: e.target.value })

  return <>
    <p className="eyebrow">PLANEJAMENTO</p><h1>Alimentação</h1>
    <section className="panel">
      <div className="section-title no-mt"><h3>Refeições da semana</h3><CalendarDays size={18}/></div>
      <div className="day-tabs" role="tablist">{WEEKDAYS.map(d => <button key={d.id} role="tab" aria-selected={day === d.id}
        className={day === d.id ? 'day-tab active' : 'day-tab'} onClick={() => setDay(d.id)}>{d.short}{d.id === today && <i/>}</button>)}</div>
      <p className="day-title">{WEEKDAYS.find(d => d.id === day)!.long}</p>

      <div className="macro-grid">
        <div className="macro kcal"><b>{Math.round(total.kcal)}</b><small>kcal</small></div>
        <div className="macro"><b>{fmt(total.protein)} g</b><small>Proteínas</small></div>
        <div className="macro"><b>{fmt(total.carbs)} g</b><small>Carboidratos</small></div>
        <div className="macro"><b>{fmt(total.fat)} g</b><small>Gorduras</small></div>
      </div>

      {list.length ? <ul className="food-list">{list.map(i => <li key={i.id}>
        <div className="food-main">
          <b>{i.name}</b>
          <small>{i.qty !== 1 ? `${fmt(i.qty)} × ` : ''}{i.portion || 'porção'}</small>
          <div className="food-macros"><span>{Math.round(i.kcal * i.qty)} kcal</span><span>P {fmt(i.protein * i.qty)}</span><span>C {fmt(i.carbs * i.qty)}</span><span>G {fmt(i.fat * i.qty)}</span></div>
        </div>
        <button className="ghost-icon" aria-label={`Editar ${i.name}`} onClick={() => edit(i)}><Pencil size={16}/></button>
        <button className="ghost-icon" aria-label={`Remover ${i.name}`} onClick={() => remove(i.id)}><Trash2 size={16}/></button>
      </li>)}</ul> : <p className="muted tiny">Nenhum alimento para este dia.</p>}

      {!form && <button className="primary full add-food" onClick={() => { setError(''); setForm(empty(day)) }}><Plus size={18}/>Adicionar alimento</button>}
      {form && <div className="food-form">
        <div className="form-head"><b>{form.id ? 'Editar alimento' : 'Novo alimento'}</b><button className="ghost-icon" aria-label="Fechar" onClick={() => { setForm(null); setError('') }}><X size={18}/></button></div>
        <label>Nome do alimento<input value={form.name} onChange={set('name')} placeholder="Ex.: frango grelhado"/></label>
        <div className="form-row">
          <label>Porção<input value={form.portion} onChange={set('portion')} placeholder="Ex.: 100 g"/></label>
          <label>Qtd. de porções<input inputMode="decimal" value={form.qty} onChange={set('qty')}/></label>
        </div>
        <p className="muted tiny">Informe os valores de <b>uma porção</b>. O total do dia multiplica pela quantidade.</p>
        <div className="form-row four">
          <label>kcal<input inputMode="decimal" value={form.kcal} onChange={set('kcal')} placeholder="0"/></label>
          <label>Prot. (g)<input inputMode="decimal" value={form.protein} onChange={set('protein')} placeholder="0"/></label>
          <label>Carb. (g)<input inputMode="decimal" value={form.carbs} onChange={set('carbs')} placeholder="0"/></label>
          <label>Gord. (g)<input inputMode="decimal" value={form.fat} onChange={set('fat')} placeholder="0"/></label>
        </div>
        <p className="form-label">Dias da semana</p>
        <div className="chips left">{WEEKDAYS.map(d => <button type="button" key={d.id} className={form.days.includes(d.id) ? 'chip active' : 'chip'} aria-pressed={form.days.includes(d.id)} onClick={() => toggleDay(d.id)}>{d.short}</button>)}</div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary full" onClick={save}>{form.id ? 'Salvar alterações' : 'Salvar alimento'}</button>
      </div>}
    </section>
  </>
}
