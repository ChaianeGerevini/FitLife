import { useEffect, useState } from 'react'
import { CheckCircle2, CircleSlash, History, Info } from 'lucide-react'
import { dateBR, timeHM, type ActiveFast, type FastRecord } from '../lib/storage'

type P = { fasting: ActiveFast; target: number; setTarget: (h: number) => void; history: FastRecord[]; onStart: () => void; onEnd: () => void }

// Conteúdo educativo: faixas de tempo aproximadas, sem garantia de que ocorram para todas as pessoas.
const PHASES = [
  { from: 0, to: 4, title: 'Início', text: 'Logo após comer, o corpo ainda usa a energia dos nutrientes da última refeição.' },
  { from: 4, to: 8, title: 'Primeiras horas', text: 'A digestão avança e os níveis de glicose e insulina tendem a diminuir gradualmente.' },
  { from: 8, to: 12, title: 'Ajuste de energia', text: 'O corpo pode começar a recorrer mais às reservas de glicogênio para obter energia.' },
  { from: 12, to: 16, title: 'Uso de reservas', text: 'Pode haver maior uso de gordura como fonte de energia, de forma variável entre pessoas.' },
  { from: 16, to: 24, title: 'Jejum prolongado', text: 'As respostas variam bastante. Atenção a tontura, fraqueza ou mal-estar: interrompa se sentir.' },
  { from: 24, to: Infinity, title: 'Acima de 24 horas', text: 'Períodos longos pedem cautela e, de preferência, orientação de um profissional de saúde.' }
]

function useNow(active: boolean) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { if (!active) return; setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 15000); return () => clearInterval(t) }, [active])
  return now
}
const hm = (ms: number) => { const h = Math.floor(ms / 3600000), m = Math.floor(ms % 3600000 / 60000); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` }
const dur = (ms: number) => { const h = Math.floor(ms / 3600000), m = Math.floor(ms % 3600000 / 60000); return h ? `${h}h ${String(m).padStart(2, '0')}min` : `${m}min` }

export default function FastTab({ fasting, target, setTarget, history, onStart, onEnd }: P) {
  const now = useNow(!!fasting)
  const elapsed = fasting ? Math.max(0, now - fasting.startedAt) : 0
  const elapsedH = elapsed / 3600000
  const [showAll, setShowAll] = useState(false)

  // Histórico agrupado por dia de início (mais recente primeiro)
  const sorted = [...history].sort((a, b) => b.startedAt - a.startedAt)
  const groups: { day: string; items: FastRecord[] }[] = []
  for (const r of sorted) {
    const day = dateBR(r.startedAt)
    const g = groups.find(x => x.day === day)
    g ? g.items.push(r) : groups.push({ day, items: [r] })
  }
  const visible = showAll ? groups : groups.slice(0, 5)

  return <>
    <p className="eyebrow">ACOMPANHAMENTO</p><h1>Jejum</h1>
    <section className="fast-card">
      <div className="fast-ring"><span>{fasting ? 'EM ANDAMENTO' : 'SUA META'}</span><strong>{fasting ? hm(elapsed) : `${target}:00`}</strong><small>{fasting ? `Meta de ${fasting.targetHours} horas` : 'horas'}</small></div>
      {!fasting ? <>
        <label className="field-label">Planejar duração</label>
        <div className="chips">{[12, 14, 16, 18, 20].map(h => <button className={target === h ? 'chip active' : 'chip'} onClick={() => setTarget(h)} key={h}>{h}h</button>)}</div>
        <button className="primary full" onClick={onStart}>Iniciar jejum</button>
      </> : <>
        <p className="muted center">Iniciado às {timeHM(fasting.startedAt)} · {dateBR(fasting.startedAt)}</p>
        <button className="danger full" onClick={onEnd}>Encerrar jejum</button>
      </>}
    </section>

    {fasting && <section className="panel">
      <h3>Linha do tempo do jejum</h3>
      <ol className="timeline">
        {PHASES.map((p, i) => {
          const reached = elapsedH >= p.from, current = elapsedH >= p.from && elapsedH < p.to
          return <li key={i} className={current ? 'tl current' : reached ? 'tl done' : 'tl'}>
            <span className="tl-dot"/>
            <div className="tl-body">
              <div className="tl-head"><b>{p.title}</b><small>{p.from === 0 ? `${timeHM(fasting.startedAt)} (início)` : `${p.from}h · ${timeHM(fasting.startedAt + p.from * 3600000)}`}</small></div>
              <span>{p.text}</span>
            </div>
          </li>
        })}
      </ol>
      <p className="note"><Info size={14}/>Conteúdo educativo. Os horários são aproximados e cada organismo responde de um jeito; não há garantia de benefícios. Jejum não é indicado para todas as pessoas.</p>
    </section>}

    <section className="panel">
      <div className="section-title no-mt"><h3>Histórico de jejuns</h3><History size={18}/></div>
      {!groups.length && <p className="muted tiny">Seus jejuns encerrados aparecerão aqui, organizados por dia.</p>}
      {visible.map(g => <div className="hist-day" key={g.day}>
        <p className="hist-date">{g.day}</p>
        {g.items.map(r => <div className="hist-row" key={r.id}>
          <div className="hist-main">
            <b>{dur(r.endedAt - r.startedAt)}</b>
            <small>{timeHM(r.startedAt)} → {timeHM(r.endedAt)}{new Date(r.startedAt).toDateString() !== new Date(r.endedAt).toDateString() ? ` (${dateBR(r.endedAt)})` : ''}</small>
          </div>
          <span className={r.status === 'completed' ? 'badge ok' : 'badge warn'}>
            {r.status === 'completed' ? <CheckCircle2 size={13}/> : <CircleSlash size={13}/>}{r.status === 'completed' ? 'Concluído' : 'Interrompido'}
          </span>
        </div>)}
      </div>)}
      {groups.length > 5 && <button className="text-btn" onClick={() => setShowAll(!showAll)}>{showAll ? 'Mostrar menos' : `Ver todos (${groups.length} dias)`}</button>}
    </section>
  </>
}
