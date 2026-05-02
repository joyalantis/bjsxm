import { supabase } from '../supabase'

function fmtDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ActivityHistory({ logs, challenges, member }) {
  const myLogs = logs
    .filter(l => l.member_id === member.id)
    .sort((a, b) => b.log_date.localeCompare(a.log_date))
    .slice(0, 30)

  async function handleDelete(id) {
    await supabase.from('activity_logs').delete().eq('id', id)
  }

  if (!myLogs.length) {
    return (
      <div className="card">
        <div className="card-title">Recent Activity</div>
        <div className="history-empty">No activity logged yet.<br />Hit a challenge button above to start! 💪</div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-title">Recent Activity</div>
      {myLogs.map(l => {
        const c = challenges.find(ch => ch.id === l.challenge_id)
        return (
          <div key={l.id} className="history-item">
            <div className="history-icon">{c?.icon ?? '💪'}</div>
            <div className="history-info">
              <div className="history-name">{c?.exercise_name ?? 'Exercise'}</div>
              <div className="history-date">{fmtDate(l.log_date)}</div>
            </div>
            <div className="history-val">{l.value} {c?.unit}</div>
            <button className="history-del" onClick={() => handleDelete(l.id)} title="Delete">✕</button>
          </div>
        )
      })}
    </div>
  )
}
