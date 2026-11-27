import { useState } from 'react'
import { Check, Plus, ShoppingBasket, Trash2, Undo2 } from 'lucide-react'
import { uid, type ShopItem } from '../lib/storage'

type P = { items: ShopItem[]; setItems: (v: ShopItem[]) => void }
export default function ShoppingList({ items, setItems }: P) {
  const [name, setName] = useState('')
  const pending = items.filter(i => !i.bought), bought = items.filter(i => i.bought)
  const add = () => { const n = name.trim(); if (!n) return; setItems([...items, { id: uid(), name: n, bought: false }]); setName('') }
  const toggle = (id: string, bought: boolean) => setItems(items.map(i => i.id === id ? { ...i, bought, boughtAt: bought ? Date.now() : undefined } : i))
  const remove = (id: string) => setItems(items.filter(i => i.id !== id))

  return <section className="panel">
    <div className="section-title no-mt"><h3>Lista de compras</h3><ShoppingBasket size={18}/></div>
    <form className="add-row" onSubmit={e => { e.preventDefault(); add() }}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Adicionar ingrediente"/>
      <button className="primary square" aria-label="Adicionar item"><Plus/></button>
    </form>
    <p className="list-label">Para comprar <span>{pending.length}</span></p>
    {pending.length ? <ul className="shop-list">{pending.map(i => <li key={i.id}>
      <button className="check" aria-label={`Marcar ${i.name} como comprado`} onClick={() => toggle(i.id, true)}/>
      <span className="shop-name">{i.name}</span>
      <button className="ghost-icon" aria-label="Remover" onClick={() => remove(i.id)}><Trash2 size={16}/></button>
    </li>)}</ul> : <p className="muted tiny">Nada pendente.</p>}
    {bought.length > 0 && <>
      <p className="list-label">Comprados <span>{bought.length}</span></p>
      <ul className="shop-list bought">{bought.map(i => <li key={i.id}>
        <button className="check on" aria-label={`Desmarcar ${i.name}`} onClick={() => toggle(i.id, false)}><Check size={15}/></button>
        <span className="shop-name">{i.name}</span>
        <button className="return-btn" onClick={() => toggle(i.id, false)}><Undo2 size={14}/>Voltar à lista</button>
        <button className="ghost-icon" aria-label="Remover" onClick={() => remove(i.id)}><Trash2 size={16}/></button>
      </li>)}</ul>
    </>}
  </section>
}
