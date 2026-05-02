import { useState } from 'react'
import { supabase } from '../supabase'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function LogModal({ challenges, member, onClose, onSaved }) {
  const [challengeId, setChallengeId] = useState(challenges[0]?.id ?? '')
  const [value, setValue] = useState('')
  const [date, setDate] = useState(todayStr())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const selected = challenges.find(c => c.id === challengeId)

  async function handleSubmit() {
    const num = parseFloat(value)
    if (!num || num <= 0) { setError('Enter a value greater than 0'); return }
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('activity_logs').insert({
      member_id: member.id,
      challenge_id: challengeId,
      log_date: date,
      value: num,
    })
    setSaving(false)
    if (err) { setError(err.message); return }
    onSaved?.()
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-handle" />
        <div className="modal-title">Log Activity</div>

        <div className="form-group">
          <label className="form-label">Exercise</label>
          <select className="form-select" value={challengeId} onChange={e => setChallengeId(e.target.value)}>
            {challenges.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.exercise_name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Amount {selected ? `(${selected.unit})` : ''}</label>
          <input className="form-input" type="number" inputMode="decimal"
            placeholder={`e.g. ${selected?.unit === 'reps' ? '20' : '1.5'}`}
            value={value} onChange={e => setValue(e.target.value)} autoFocus />
        </div>

        <div className="form-group">
          <label className="form-label">Date</label>
          <input className="form-input" type="date" value={date}
            max={todayStr()} onChange={e => setDate(e.target.value)} />
        </div>

        {error && <p style={{ color: 'var(--danger)', fontSize: '.85rem', marginBottom: 12 }}>{error}</p>}

        <div className="btn-row">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-submit" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : 'Log It! 💪'}
          </button>
        </div>
      </div>
    </div>
  )
}
