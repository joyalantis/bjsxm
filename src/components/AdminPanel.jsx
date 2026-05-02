import { useState } from 'react'
import { supabase } from '../supabase'

const ICONS = ['💪','🏃','🚶','🧘','🏊','🚴','⚽','🏀','🎽','🥊','🤸','⛹️','🏋️','🧗']

export default function AdminPanel({ onRefresh }) {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [unit, setUnit] = useState('reps')
  const [desc, setDesc] = useState('')
  const [icon, setIcon] = useState('💪')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleAdd() {
    if (!name.trim() || !goal) return
    setSaving(true); setMsg('')
    const { error } = await supabase.from('challenges').insert({
      year: Number(year), month: Number(month),
      exercise_name: name.trim(), goal_value: Number(goal),
      unit, description: desc.trim() || null, icon,
    })
    setSaving(false)
    if (error) { setMsg('Error: ' + error.message) }
    else { setMsg('Challenge added!'); setName(''); setGoal(''); setDesc(''); onRefresh?.() }
  }

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <div className="card">
      <div className="card-title">Add Monthly Challenge</div>
      <div className="admin-warning">
        ⚠️ Challenges are shared for the whole family. Max 2 per month recommended.
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Month</label>
          <select className="form-select" value={month} onChange={e => setMonth(e.target.value)}>
            {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Year</label>
          <input className="form-input" type="number" value={year} onChange={e => setYear(e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Exercise Name</label>
        <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Push-ups" />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <div className="form-group" style={{ flex: 2 }}>
          <label className="form-label">Goal Amount</label>
          <input className="form-input" type="number" value={goal} onChange={e => setGoal(e.target.value)} placeholder="500" />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Unit</label>
          <select className="form-select" value={unit} onChange={e => setUnit(e.target.value)}>
            {['reps','miles','km','minutes','hours','steps','lbs','kg','sets'].map(u =>
              <option key={u}>{u}</option>
            )}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Icon</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {ICONS.map(ic => (
            <button key={ic} onClick={() => setIcon(ic)}
              style={{ fontSize: '1.3rem', background: icon === ic ? '#e0e7ff' : 'transparent',
                border: icon === ic ? '2px solid #6366f1' : '2px solid transparent',
                borderRadius: 8, padding: 3, cursor: 'pointer' }}>{ic}</button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Description (optional)</label>
        <input className="form-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Short description…" />
      </div>

      {msg && <p style={{ fontSize: '.85rem', color: msg.startsWith('Error') ? 'var(--danger)' : 'var(--success)', marginBottom: 10 }}>{msg}</p>}

      <button className="btn-submit" style={{ width: '100%' }}
        onClick={handleAdd} disabled={!name.trim() || !goal || saving}>
        {saving ? 'Saving…' : 'Add Challenge'}
      </button>
    </div>
  )
}
