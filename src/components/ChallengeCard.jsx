import { useState } from 'react'
import LogModal from './LogModal'

function pct(val, goal) {
  return Math.min(100, Math.round((val / goal) * 100))
}

export default function ChallengeCard({ challenge, logs, members, currentMember }) {
  const [showLog, setShowLog] = useState(false)

  // total per member
  const byMember = members.map(m => {
    const total = logs.filter(l => l.member_id === m.id).reduce((s, l) => s + Number(l.value), 0)
    return { ...m, total }
  })

  // my total
  const myTotal = byMember.find(m => m.id === currentMember.id)?.total ?? 0
  const myPct = pct(myTotal, challenge.goal_value)
  const complete = myPct >= 100

  return (
    <>
      <div className="card">
        <div className="challenge-header">
          <div className="challenge-icon">{challenge.icon}</div>
          <div className="challenge-info">
            <div className="challenge-name">{challenge.exercise_name}</div>
            <div className="challenge-goal">Goal: {challenge.goal_value} {challenge.unit}</div>
            {challenge.description && (
              <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{challenge.description}</div>
            )}
          </div>
          {complete && <div style={{ fontSize: '1.4rem' }}>✅</div>}
        </div>

        <div className="progress-wrap">
          <div className="progress-label">
            <span className="progress-pct">{myPct}%</span>
            <span className="progress-count">{myTotal} / {challenge.goal_value} {challenge.unit}</span>
          </div>
          <div className="progress-bar">
            <div className={`progress-fill${complete ? ' complete' : ''}`} style={{ width: `${myPct}%` }} />
          </div>
        </div>

        {members.length > 1 && (
          <div className="member-bars">
            {byMember.sort((a, b) => b.total - a.total).map(m => (
              <div key={m.id} className="member-bar-row">
                <div className="member-bar-avatar">{m.avatar}</div>
                <div className="member-bar-name">{m.name}</div>
                <div className="member-bar-track">
                  <div className="member-bar-fill"
                    style={{ width: `${pct(m.total, challenge.goal_value)}%`, background: m.color }} />
                </div>
                <div className="member-bar-val">{m.total}{challenge.unit === 'reps' ? '' : ` ${challenge.unit.slice(0,2)}`}</div>
              </div>
            ))}
          </div>
        )}

        <button className="log-btn" onClick={() => setShowLog(true)}>
          + Log {challenge.exercise_name}
        </button>
      </div>

      {showLog && (
        <LogModal
          challenges={[challenge]}
          member={currentMember}
          onClose={() => setShowLog(false)}
        />
      )}
    </>
  )
}
