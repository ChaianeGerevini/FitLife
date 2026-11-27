import { useState } from 'react'
import { ChevronLeft, ChevronRight, ClipboardList, Dumbbell, Plus, Trash2 } from 'lucide-react'
import { addDays, dateKey, parseKey, startOfWeek, uid, type ExerciseLog } from '../lib/storage'

type P = { logs: ExerciseLog[]; setLogs: (v: ExerciseLog[]) => void; plan: string[]; setPlan: (v: string[]) => void }
type View = 'day' | 'week' | 'month'
const DOW = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function Detail({ e }: { e: ExerciseLog }) {
  const bits = [e.sets ? `${e.sets} séries` : '', e.reps ? `${e.reps} repetições` : ''].filter(Boolean).join(' · ')
  return <>{bits && <small>{bits}</small>}{e.notes && <small className="ex-notes">{e.notes}</small>}</>
}

export default function WorkoutTab({ logs, setLogs, plan, setPlan }: P) {
  const [view, setView] = useState<View>('day')
  const [anchor, setAnchor] = useState(() => new Date())
  const [name, setName] = useState('')
  const [date, setDate] = useState(dateKey())
  const [sets, setSets] = useState(''), [reps, setReps] = useState(''), [notes, setNotes] = useState('')
  const [more, setMore] = useState(false)
  const [planText, setPlanText] = useState('')
  const [flash, setFlash] = useState('')

  const byDate = (k: string) => logs.filter(l => l.date === k)
  const today = dateKey()
  const move = (dir: 1 | -1) => setAnchor(a => view === 'day' ? addDays(a, dir) : view === 'week' ? addDays(a, 7 * dir) : new Date(a.getFullYear(), a.getMonth() + dir, 1))
  const changeView = (v: View) => { setView(v); setDate(dateKey(anchor)) }
  const goDay = (k: string) => { setAnchor(parseKey(k)); setDate(k); setView('day') }

  const add = () => {
    const n = name.trim(); if (!n || !date) return
    const toInt = (s: string) => { const v = parseInt(s, 10); return Number.isFinite(v) && v > 0 ? v : undefined }
    setLogs([...logs, { id: uid(), name: n, date, sets: toInt(sets), reps: toInt(reps), notes: notes.trim() || undefined }])
    setName(''); setSets(''); setReps(''); setNotes(''); setAnchor(parseKey(date))
    setFlash('Exercício registrado'); setTimeout(() => setFlash(''), 1600)
  }
  const remove = (id: string) => setLogs(logs.filter(l => l.id !== id))

  const weekStart = startOfWeek(anchor)
  const title = view === 'day' ? cap(anchor.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }))
    : view === 'week' ? `${weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${addDays(weekStart, 6).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`
    : cap(anchor.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }))

  // mês: grade
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const daysInMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate()
  const cells: (string | null)[] = [...Array(first.getDay()).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => dateKey(new Date(anchor.getFullYear(), anchor.getMonth(), i + 1)))]
  const monthPrefix = `${anchor.getFullYear()}-${String(anchor.getMonth() + 1).padStart(2, '0')}`
  const monthLogs = logs.filter(l => l.date.startsWith(monthPrefix))
  const monthDays = new Set(monthLogs.map(l => l.date)).size

  return <>
    <p className="eyebrow">MOVIMENTO</p><h1>Treinos</h1>

    <section className="panel">
      <div className="section-title no-mt"><h3>Exercícios realizados</h3><Dumbbell size={18}/></div>
      <div className="segmented" role="tablist">{(['day', 'week', 'month'] as View[]).map(v => <button key={v} role="tab" aria-selected={view === v} className={view === v ? 'seg active' : 'seg'} onClick={() => changeView(v)}>{v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : 'Mês'}</button>)}</div>
      <div className="period-nav">
        <button className="ghost-icon big" aria-label="Período anterior" onClick={() => move(-1)}><ChevronLeft size={20}/></button>
        <b>{title}</b>
        <button className="ghost-icon big" aria-label="Próximo período" onClick={() => move(1)}><ChevronRight size={20}/></button>
      </div>

      {view === 'day' && (byDate(dateKey(anchor)).length
        ? <ul className="ex-list">{byDate(dateKey(anchor)).map(e => <li key={e.id}><div><b>{e.name}</b><Detail e={e}/></div><button className="ghost-icon" aria-label={`Remover ${e.name}`} onClick={() => remove(e.id)}><Trash2 size={16}/></button></li>)}</ul>
        : <p className="muted tiny">Nenhum exercício registrado neste dia.</p>)}

      {view === 'week' && <div className="week-list">{Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map(d => {
        const k = dateKey(d), ex = byDate(k)
        return <div key={k} className={k === today ? 'week-day today' : 'week-day'}>
          <button className="week-label" onClick={() => goDay(k)}><b>{d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</b><small>{d.getDate()}</small></button>
          <div className="week-ex">{ex.length ? ex.map(e => <span key={e.id} className="ex-chip">{e.name}</span>) : <small className="muted">—</small>}</div>
        </div>
      })}</div>}

      {view === 'month' && <>
        <div className="month-grid">{DOW.map((d, i) => <span key={i} className="dow">{d}</span>)}
          {cells.map((k, i) => k ? <button key={k} className={`mday${byDate(k).length ? ' has' : ''}${k === today ? ' today' : ''}`} aria-label={`${k}${byDate(k).length ? ', com treino' : ''}`} onClick={() => goDay(k)}>{parseKey(k).getDate()}</button> : <span key={'e' + i}/>)}
        </div>
        <p className="muted tiny">{monthDays ? `${monthDays} ${monthDays === 1 ? 'dia' : 'dias'} com treino · ${monthLogs.length} ${monthLogs.length === 1 ? 'exercício' : 'exercícios'} neste mês.` : 'Nenhum treino registrado neste mês.'} Toque em um dia para ver os detalhes.</p>
      </>}
    </section>

    <section className="panel">
      <h3>Registrar exercício</h3>
      <form className="ex-form" onSubmit={e => { e.preventDefault(); add() }}>
        <label>Exercício<input value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: agachamento"/></label>
        <label>Data<input type="date" value={date} onChange={e => setDate(e.target.value)}/></label>
        <button type="button" className="text-btn" onClick={() => setMore(!more)}>{more ? 'Ocultar detalhes' : 'Séries, repetições e observações (opcional)'}</button>
        {more && <>
          <div className="form-row"><label>Séries<input inputMode="numeric" value={sets} onChange={e => setSets(e.target.value)} placeholder="Opcional"/></label><label>Repetições<input inputMode="numeric" value={reps} onChange={e => setReps(e.target.value)} placeholder="Opcional"/></label></div>
          <label>Observações<input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opcional"/></label>
        </>}
        <button className="primary full" disabled={!name.trim() || !date}><Plus size={18}/>{flash || 'Registrar exercício'}</button>
      </form>
    </section>

    <section className="panel">
      <div className="section-title no-mt"><h3>Exercícios planejados</h3><ClipboardList size={18}/></div>
      <p className="muted tiny">Sua rotina anterior. Estes itens são apenas planejamento e não contam como treino realizado.</p>
      <form className="add-row" onSubmit={e => { e.preventDefault(); if (planText.trim()) { setPlan([...plan, planText.trim()]); setPlanText('') } }}>
        <input value={planText} onChange={e => setPlanText(e.target.value)} placeholder="Ex.: agachamento — 3x12"/>
        <button className="primary square" aria-label="Adicionar ao plano"><Plus/></button>
      </form>
      {plan.length ? <ul className="simple-list">{plan.map((p, i) => <li key={i}><span>{p}</span><button aria-label="Remover" onClick={() => setPlan(plan.filter((_, n) => n !== i))}><Trash2 size={15}/></button></li>)}</ul> : <p className="muted tiny">Nenhum exercício planejado.</p>}
    </section>
  </>
}
