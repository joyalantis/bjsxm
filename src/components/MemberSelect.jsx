import { useState } from 'react'
import { supabase } from '../supabase'

const AVATARS = ['🧑', '👩', '👨', '🧒', '👧', '👦', '👴', '👵', '🧔', '👱']
const COLORS = ['#6366f1','#ec4899','#3b82f6','#f59e0b','#10b981','#ef4444','#8b5cf6','#06b6d4']

export default function MemberSelect({ members, onSelect, onRefresh }) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('🧑')
  const [color, setColor] = useState('#6366f1')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!name.trim()) return
    setSaving(true)
    const { error } = await supabase.from('family_members').insert({ name: name.trim(), avatar, color })
    setSaving(false)
    if (!error) { setAdding(false); setName(''); onRefresh() }
  }

  return (
    <div className="member-screen">
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>🏋️</div>
        <h1>BJsxM Fitness</h1>
        <p style={{ marginTop: 8 }}>Who's working out today?</p>
      </div>

      <div className="member-grid">
        {members.map(m => (
          <div key={m.id} className="member-card" onClick={() => onSelect(m)}>
            <div className="member-emoji">{m.avatar}</div>
            <div className="member-name">{m.name}</div>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="card" style={{ width: '100%' }}>
          <div className="card-title">Add Family Member</div>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)}
              placeholder="Enter name..." maxLength={20} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Avatar</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {AVATARS.map(a => (
                <button key={a} onClick={() => setAvatar(a)}
                  style={{ fontSize: '1.5rem', background: avatar === a ? '#e0e7ff' : 'transparent',
                    border: avatar === a ? '2px solid #6366f1' : '2px solid transparent',
                    borderRadius: 8, padding: 4, cursor: 'pointer' }}>{a}</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  style={{ width: 28, height: 28, borderRadius: 8, background: c,
                    border: color === c ? '3px solid #1e1b4b' : '3px solid transparent',
                    cursor: 'pointer' }} />
              ))}
            </div>
          </div>
          <div className="btn-row">
            <button className="btn-cancel" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn-submit" onClick={handleAdd} disabled={!name.trim() || saving}>
              {saving ? 'Saving…' : 'Add Member'}
            </button>
          </div>
        </div>
      ) : (
        <button className="add-member-btn" onClick={() => setAdding(true)}>+ Add Family Member</button>
      )}
    </div>
  )
}
