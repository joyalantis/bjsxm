const MEDALS = ['🥇', '🥈', '🥉']

function getRankBg(rank) {
  if (rank === 0) return 'linear-gradient(135deg,#fef9c3,#fef08a)'
  if (rank === 1) return 'linear-gradient(135deg,#f1f5f9,#e2e8f0)'
  if (rank === 2) return 'linear-gradient(135deg,#fef3c7,#fed7aa)'
  return 'transparent'
}

export default function Leaderboard({ members, challenges, logs, currentMember }) {
  if (!challenges.length) {
    return <div className="card"><div className="history-empty">No challenges this month yet.</div></div>
  }

  const scored = members.map(m => {
    let points = 0
    let totalPct = 0
    challenges.forEach(c => {
      const total = logs.filter(l => l.member_id === m.id && l.challenge_id === c.id)
        .reduce((s, l) => s + Number(l.value), 0)
      const p = Math.min(100, Math.round((total / c.goal_value) * 100))
      totalPct += p
      points += Math.floor(p)
    })
    const avgPct = Math.round(totalPct / challenges.length)
    return { ...m, points, avgPct }
  }).sort((a, b) => b.points - a.points)

  return (
    <div className="card">
      <div className="card-title">Leaderboard</div>
      {scored.map((m, i) => (
        <div key={m.id} className="lb-row"
          style={{ background: getRankBg(i), borderRadius: i < 3 ? 10 : 0,
            padding: '12px 8px', margin: i < 3 ? '2px 0' : 0 }}>
          <div className="lb-rank">{i < 3 ? MEDALS[i] : `#${i + 1}`}</div>
          <div className="lb-avatar">{m.avatar}</div>
          <div className="lb-info">
            <div className="lb-name" style={{ color: m.id === currentMember.id ? 'var(--primary)' : 'var(--text)' }}>
              {m.name}{m.id === currentMember.id ? ' (you)' : ''}
            </div>
            <div className="lb-score">{m.avgPct}% avg completion</div>
          </div>
          <div className="lb-pts">{m.points}pts</div>
        </div>
      ))}
    </div>
  )
}
