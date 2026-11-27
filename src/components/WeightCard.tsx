import { Check, Minus, Plus, Target, Weight } from 'lucide-react'
import { useState } from 'react'
import type { WeightEntry } from '../lib/storage'

type P = { weight: number; goal: number; log: WeightEntry[]; onWeight: (v: number) => void; onGoal: (v: number) => void; onSave: () => void }
const round1 = (n: number) => Math.round(n * 10) / 10

export default function WeightCard({ weight, goal, log, onWeight, onGoal, onSave }: P) {
  const [saved, setSaved] = useState(false)
  const first = log[0]?.value ?? weight
  const progress = Math.min(100, Math.max(0, ((first - weight) / Math.max(1, first - goal)) * 100))
  const diff = round1(weight - goal)
  const last = log[log.length - 1]?.value
  const change = last !== undefined ? round1(weight - last) : 0
  const save = () => { onSave(); setSaved(true); setTimeout(() => setSaved(false), 1600) }

  return <section className="weight-card">
    <div className="card-head"><span>Peso atual</span><Weight size={18}/></div>
    <div className="weight-stepper">
      <button className="step-btn" aria-label="Diminuir 0,1 kg" onClick={() => onWeight(Math.max(0, round1(weight - 0.1)))}><Minus size={22}/></button>
      <label className="weight-input-wrap">
        <input className="weight-input" type="number" inputMode="decimal" step="0.1" value={weight}
          aria-label="Peso atual em quilos" onChange={e => onWeight(Number(e.target.value))}/>
        <small>kg</small>
      </label>
      <button className="step-btn" aria-label="Aumentar 0,1 kg" onClick={() => onWeight(round1(weight + 0.1))}><Plus size={22}/></button>
    </div>
    <div className="weight-meta">
      <span className="pill"><Target size={13}/> Meta {String(goal).replace('.', ',')} kg</span>
      <span className="pill">{diff > 0 ? `faltam ${String(diff).replace('.', ',')} kg` : 'meta atingida'}</span>
      {change !== 0 && <span className="pill">{change > 0 ? '+' : ''}{String(change).replace('.', ',')} kg desde a última pesagem</span>}
    </div>
    <div className="progress" aria-label={`${Math.round(progress)}% do caminho`}><i style={{ width: `${progress}%` }}/></div>
    <div className="weight-foot">
      <label className="goal-edit">Meta (kg)
        <input type="number" inputMode="decimal" step="0.1" value={goal} onChange={e => onGoal(Number(e.target.value))}/>
      </label>
      <button className={saved ? 'primary save-weight done' : 'primary save-weight'} onClick={save}>
        <Check size={18}/>{saved ? 'Registrado' : 'Registrar pesagem'}
      </button>
    </div>
  </section>
}
