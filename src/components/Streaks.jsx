function computeStreak(logs) {
  if (!logs.length) return { current: 0, longest: 0 }

  const days = [...new Set(logs.map(l => l.log_date))].sort()
  let current = 0, longest = 0, streak = 1

  // check if today or yesterday has a log (so streak doesn't reset at midnight)
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const lastDay = days[days.length - 1]
  const activeStreak = lastDay === today || lastDay === yesterday

  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1])
    const curr = new Date(days[i])
    const diff = (curr - prev) / 86400000
    if (diff === 1) { streak++ } else { longest = Math.max(longest, streak); streak = 1 }
  }
  longest = Math.max(longest, streak)
  current = activeStreak ? streak : 0

  return { current, longest }
}

export default function Streaks({ logs, member }) {
  const myLogs = logs.filter(l => l.member_id === member.id)
  const { current, longest } = computeStreak(myLogs)

  const activeDays = new Set(myLogs.map(l => l.log_date)).size
  const totalReps = myLogs.reduce((s, l) => s + Number(l.value), 0)

  return (
    <div className="card">
      <div className="card-title">Your Stats</div>
      <div className="streak-row">
        <div className={`streak-badge${current === 0 ? ' cold' : ''}`}>
          <div className="streak-num">{current} {current > 0 ? '🔥' : ''}</div>
          <div className="streak-label">Day Streak</div>
        </div>
        <div className="streak-badge" style={{ background: 'linear-gradient(135deg,#ede9fe,#ddd6fe)', borderColor:'#a78bfa' }}>
          <div className="streak-num" style={{ color:'#5b21b6' }}>{longest}</div>
          <div className="streak-label" style={{ color:'#5b21b6' }}>Best Streak</div>
        </div>
        <div className="streak-badge" style={{ background:'linear-gradient(135deg,#d1fae5,#a7f3d0)', borderColor:'#34d399' }}>
          <div className="streak-num" style={{ color:'#065f46' }}>{activeDays}</div>
          <div className="streak-label" style={{ color:'#065f46' }}>Active Days</div>
        </div>
      </div>
    </div>
  )
}
