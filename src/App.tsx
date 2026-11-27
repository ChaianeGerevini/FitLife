import { useEffect, useState } from 'react'
import { Activity, Apple, CircleUserRound, Droplets, Dumbbell, Home, Timer, Users, Utensils } from 'lucide-react'
import { supabase, cloudReady } from './lib/supabase'
import PWAInstall from './PWAInstall'
import { read, write, dateKey, uid, migrateFood, migrateShopping, migrateWeights, migrateFastActive, type ActiveFast, type FoodItem, type ShopItem, type FastRecord, type ExerciseLog, type WeightEntry } from './lib/storage'
import WeightCard from './components/WeightCard'
import WaterCard from './components/WaterCard'
import FastTab from './components/FastTab'
import FoodTab from './components/FoodTab'
import ShoppingList from './components/ShoppingList'
import WorkoutTab from './components/WorkoutTab'

type Tab = 'home' | 'fast' | 'food' | 'workout' | 'water'
type Profile = { id: string; name: string; weight: number; goal: number; height: number }
const defaultProfile: Profile = { id: 'local', name: 'Meu perfil', weight: 69, goal: 62, height: 155 }
const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'home', label: 'Início', icon: Home }, { id: 'fast', label: 'Jejum', icon: Timer },
  { id: 'food', label: 'Comida', icon: Utensils }, { id: 'workout', label: 'Treinos', icon: Dumbbell },
  { id: 'water', label: 'Água', icon: Droplets }
]
export default function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [profile, setProfile] = useState<Profile>(() => read('fitlife-profile', defaultProfile))
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMode, setAuthMode] = useState<'login'|'signup'>('signup')
  const [message, setMessage] = useState('')
  const [water, setWater] = useState<number>(() => read('fitlife-water', 0))
  const [goalWater, setGoalWater] = useState<number>(() => read('fitlife-water-goal', 2))
  const [fasting, setFasting] = useState<ActiveFast>(() => migrateFastActive(read('fitlife-fast', null)))
  const [fastTarget, setFastTarget] = useState(16)
  const [fastHistory, setFastHistory] = useState<FastRecord[]>(() => read('fitlife-fast-history', []))
  const [food, setFood] = useState<FoodItem[]>(() => migrateFood(read('fitlife-food', [])))
  const [weightLog, setWeightLog] = useState<WeightEntry[]>(() => { const w = migrateWeights(read('fitlife-weights', [])); return w.length ? w : [{ value: 69, at: 0 }] })
  const [workouts, setWorkouts] = useState<string[]>(() => read('fitlife-workouts', []))
  const [exerciseLog, setExerciseLog] = useState<ExerciseLog[]>(() => read('fitlife-exercise-log', []))
  const [shopping, setShopping] = useState<ShopItem[]>(() => migrateShopping(read('fitlife-shopping', [])))
  const [sharedMode, setSharedMode] = useState(false)

  useEffect(() => { write('fitlife-profile', profile) }, [profile])
  useEffect(() => { write('fitlife-water', water) }, [water])
  useEffect(() => { write('fitlife-water-goal', goalWater) }, [goalWater])
  useEffect(() => { write('fitlife-fast', fasting) }, [fasting])
  useEffect(() => { write('fitlife-fast-history', fastHistory) }, [fastHistory])
  useEffect(() => { write('fitlife-food', food) }, [food])
  useEffect(() => { write('fitlife-weights', weightLog) }, [weightLog])
  useEffect(() => { write('fitlife-workouts', workouts) }, [workouts])
  useEffect(() => { write('fitlife-exercise-log', exerciseLog) }, [exerciseLog])
  useEffect(() => { write('fitlife-shopping', shopping) }, [shopping])
  useEffect(() => { if (supabase) supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null)) }, [])

  const login = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage('')
    if (!supabase) { setMessage('Para ativar contas individuais e sincronização, configure o Supabase conforme o README.'); return }
    const result = authMode === 'signup'
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    if (result.error) setMessage(result.error.message)
    else { setUser(result.data.user); setMessage(authMode === 'signup' ? 'Conta criada. Confira seu e-mail se a confirmação estiver ativada.' : 'Login realizado.') }
  }
  const logout = async () => { await supabase?.auth.signOut(); setUser(null) }
  const startFast = () => setFasting({ startedAt: Date.now(), targetHours: fastTarget })
  const endFast = () => {
    if (!fasting) return
    const endedAt = Date.now()
    const status = endedAt - fasting.startedAt >= fasting.targetHours * 3600000 ? 'completed' : 'interrupted'
    setFastHistory([...fastHistory, { id: uid(), startedAt: fasting.startedAt, endedAt, targetHours: fasting.targetHours, status }])
    setFasting(null)
  }
  const todayDow = new Date().getDay()
  const todayFoodCount = food.filter(f => f.days.includes(todayDow as any)).length
  const todayExercises = exerciseLog.filter(l => l.date === dateKey()).length

  if (!user && cloudReady) return <main className="auth-wrap"><section className="auth-card"><Brand/><h1>{authMode === 'signup' ? 'Crie sua conta' : 'Bem-vindo de volta'}</h1><p>Entre com seu e-mail para acessar seu espaço FitLife.</p><form onSubmit={login}><label>E-mail<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@email.com"/></label><label>Senha<input type="password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo de 6 caracteres"/></label><button className="primary full">{authMode === 'signup' ? 'Criar conta' : 'Entrar'}</button></form>{message && <p className="notice">{message}</p>}<button className="text-btn" onClick={()=>setAuthMode(authMode==='signup'?'login':'signup')}>{authMode==='signup'?'Já tenho conta · Entrar':'Criar uma conta'}</button><p className="muted tiny">Cada pessoa deve criar sua própria conta. Dados locais permanecem neste aparelho.</p></section></main>

  return <div className="app-shell">
    <PWAInstall/>
    <header className="topbar"><Brand/><div className="top-actions"><span className="online-dot" title="Dados salvos neste aparelho"/><button className="avatar" onClick={()=>setTab('home')}><CircleUserRound size={19}/></button></div></header>
    <main className="content">
      {tab==='home' && <><div className="welcome"><div><p className="eyebrow">SEU RESUMO</p><h1>Olá, {profile.name.split(' ')[0]} 👋</h1><p className="muted">Um passo de cada vez.</p></div><button className="small-ghost" onClick={()=>setSharedMode(!sharedMode)}><Users size={16}/>{sharedMode?'Meu perfil':'Compartilhar'}</button></div>
        <WeightCard weight={profile.weight} goal={profile.goal} log={weightLog} onWeight={v=>setProfile({...profile,weight:v})} onGoal={v=>setProfile({...profile,goal:v})} onSave={()=>setWeightLog([...weightLog,{value:profile.weight,at:Date.now()}])}/>
        <div className="section-title"><h2>Hoje</h2><span className="muted">{new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'})}</span></div>
        <div className="stats-grid"><Stat icon={<Timer/>} label="Jejum" value={fasting?'Em andamento':'Não iniciado'}/><Stat icon={<Droplets/>} label="Água" value={`${water.toFixed(1).replace('.',',')} / ${goalWater} L`}/><Stat icon={<Apple/>} label="Refeições" value={`${todayFoodCount} hoje`}/><Stat icon={<Activity/>} label="Treinos" value={`${todayExercises} hoje`}/></div>
        <section className="panel"><h3>Evolução do peso</h3><div className="chart">{weightLog.slice(-8).map((w,i)=><div className="chart-col" key={i}><div className="bar" style={{height:`${Math.max(12,Math.min(100,w.value/Math.max(...weightLog.map(x=>x.value))*100))}%`}}/><small>{w.value}kg</small></div>)}</div><p className="muted tiny">Adicione uma pesagem para acompanhar seu histórico.</p></section>
        {sharedMode && <section className="panel"><h3>Espaço compartilhado</h3><p className="muted">Convide seu namorado após configurar o banco de dados. Cardápios e lista de compras poderão ser compartilhados sem misturar os perfis individuais.</p></section>}
      </>}
      {tab==='fast' && <FastTab fasting={fasting} target={fastTarget} setTarget={setFastTarget} history={fastHistory} onStart={startFast} onEnd={endFast}/>}
      {tab==='food' && <><FoodTab items={food} setItems={setFood}/><ShoppingList items={shopping} setItems={setShopping}/></>}
      {tab==='workout' && <WorkoutTab logs={exerciseLog} setLogs={setExerciseLog} plan={workouts} setPlan={setWorkouts}/>}
      {tab==='water' && <><p className="eyebrow">HÁBITO DIÁRIO</p><h1>Hidratação</h1><WaterCard water={water} goal={goalWater} setWater={setWater} setGoal={setGoalWater}/></>}
    </main>
    <nav className="bottom-nav">{tabs.map(t=>{const Icon=t.icon;return <button key={t.id} className={tab===t.id?'nav-item active':'nav-item'} onClick={()=>setTab(t.id)}><Icon size={20}/><span>{t.label}</span></button>})}</nav>
    <footer className="footer-note">{cloudReady?(user?'Conta conectada':'Modo local'):'Modo local · sincronização em nuvem ainda não configurada'} · seus dados deste protótipo ficam neste aparelho</footer>
  </div>
}
function Brand(){return <div className="brand"><span className="brand-mark"><Activity size={19}/></span><b>Fit<span>Life</span></b></div>}
function Stat({icon,label,value}:any){return <div className="stat"><span className="stat-icon">{icon}</span><small>{label}</small><b>{value}</b></div>}
