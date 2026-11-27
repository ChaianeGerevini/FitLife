import { Droplets, Minus, Plus } from 'lucide-react'

// Apenas visual: a lógica (−250 ml, +250 ml, +500 ml, meta) é a mesma de antes.
type P = { water: number; goal: number; setWater: (v: number) => void; setGoal: (v: number) => void }
export default function WaterCard({ water, goal, setWater, setGoal }: P) {
  return <section className="water-card">
    <Droplets size={32}/>
    <strong>{water.toFixed(1).replace('.', ',')} L</strong>
    <span>de {goal} L diários</span>
    <div className="progress"><i style={{ width: `${Math.min(100, water / goal * 100)}%` }}/></div>
    <div className="water-controls">
      <button className="water-btn minus" aria-label="Diminuir 250 ml" onClick={() => setWater(Math.max(0, water - .25))}><Minus size={22}/><b>250 ml</b></button>
      <button className="water-btn plus" aria-label="Adicionar 250 ml" onClick={() => setWater(water + .25)}><Plus size={22}/><b>250 ml</b></button>
      <button className="water-btn plus soft" aria-label="Adicionar 500 ml" onClick={() => setWater(water + .5)}><Plus size={22}/><b>500 ml</b></button>
    </div>
    <label className="field-label">Meta diária (litros)<input type="number" min="0.5" step="0.25" value={goal} onChange={e => setGoal(Number(e.target.value))}/></label>
  </section>
}
