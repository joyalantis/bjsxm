import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './supabase'
import MemberSelect from './components/MemberSelect'
import ChallengeCard from './components/ChallengeCard'
import Leaderboard from './components/Leaderboard'
import Streaks from './components/Streaks'
import ActivityHistory from './components/ActivityHistory'
import AdminPanel from './components/AdminPanel'
import LogModal from './components/LogModal'
import Toast from './components/Toast'

const TABS = [
  { id: 'challenges', label: '🏆 Challenges' },
  { id: 'leaderboard', label: '📊 Board' },
  { id: 'history', label: '📅 History' },
  { id: 'admin', label: '⚙️ Manage' },
]

function monthName(m) {
  return new Date(2000, m - 1, 1).toLocaleString('en-US', { month: 'long' })
}

export default function App() {
  const [member, setMember] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bjsxm_member')) } catch { return null }
  })
  const [members, setMembers] = useState([])
  const [challenges, setChallenges] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('challenges')
  const [toast, setToast] = useState('')
  const [showLogAll, setShowLogAll] = useState(false)

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1)

  const channelRef = useRef(null)

  const fetchAll = useCallback(async () => {
    const [{ data: mems }, { data: chals }, { data: lgData }] = await Promise.all([
      supabase.from('family_members').select('*').order('created_at'),
      supabase.from('challenges').select('*')
        .eq('year', viewYear).eq('month', viewMonth).order('created_at'),
      supabase.from('activity_logs').select('*')
        .in('challenge_id',
          (await supabase.from('challenges').select('id')
            .eq('year', viewYear).eq('month', viewMonth)).data?.map(c => c.id) ?? []
        ),
    ])
    setMembers(mems ?? [])
    setChallenges(chals ?? [])
    setLogs(lgData ?? [])
    setLoading(false)
  }, [viewYear, viewMonth])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // real-time subscriptions
  useEffect(() => {
    if (channelRef.current) supabase.removeChannel(channelRef.current)

    const channel = supabase.channel('bjsxm-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'family_members' }, () => fetchAll())
      .subscribe()

    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [fetchAll])

  function selectMember(m) {
    setMember(m)
    localStorage.setItem('bjsxm_member', JSON.stringify(m))
  }

  function handleLogSaved() {
    setToast('Activity logged! 💪')
  }

  function prevMonth() {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 12) { setViewMonth(1); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth() + 1

  // keep member in sync if member list refreshes
  useEffect(() => {
    if (member && members.length) {
      const updated = members.find(m => m.id === member.id)
      if (updated && JSON.stringify(updated) !== JSON.stringify(member)) {
        selectMember(updated)
      }
    }
  }, [members])

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <span>Loading…</span>
      </div>
    )
  }

  if (!member) {
    return <MemberSelect members={members} onSelect={selectMember} onRefresh={fetchAll} />
  }

  return (
    <>
      {/* Header */}
      <header className="app-header">
        <div className="header-top">
          <div>
            <div className="header-title">BJsxM Fitness 🏋️</div>
            <div className="header-subtitle">Family Challenge Tracker</div>
          </div>
          <div className="header-avatar" onClick={() => setMember(null)} title="Switch member">
            {member.avatar}
          </div>
        </div>
        <nav className="nav-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`nav-tab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main className="page">
        {/* Month nav (challenges + leaderboard) */}
        {(tab === 'challenges' || tab === 'leaderboard') && (
          <div className="month-nav">
            <button onClick={prevMonth}>‹</button>
            <h2>{monthName(viewMonth)} {viewYear}</h2>
            <button onClick={nextMonth} disabled={isCurrentMonth} style={{ opacity: isCurrentMonth ? .4 : 1 }}>›</button>
          </div>
        )}

        {tab === 'challenges' && (
          <>
            {challenges.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>📅</div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>No challenges this month</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginBottom: 16 }}>
                  Go to ⚙️ Manage to add challenges for {monthName(viewMonth)}.
                </div>
              </div>
            ) : (
              <>
                {challenges.map(c => (
                  <ChallengeCard key={c.id} challenge={c} logs={logs.filter(l => l.challenge_id === c.id)}
                    members={members} currentMember={member} />
                ))}
                {challenges.length > 1 && (
                  <button className="log-btn" style={{ background: 'var(--accent)' }}
                    onClick={() => setShowLogAll(true)}>
                    + Log Any Exercise
                  </button>
                )}
              </>
            )}
            <Streaks logs={logs} member={member} />
          </>
        )}

        {tab === 'leaderboard' && (
          <Leaderboard members={members} challenges={challenges} logs={logs} currentMember={member} />
        )}

        {tab === 'history' && (
          <ActivityHistory logs={logs} challenges={challenges} member={member} />
        )}

        {tab === 'admin' && (
          <AdminPanel onRefresh={fetchAll} />
        )}
      </main>

      {/* Log any modal */}
      {showLogAll && challenges.length > 0 && (
        <LogModal challenges={challenges} member={member}
          onClose={() => setShowLogAll(false)} onSaved={handleLogSaved} />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </>
  )
}
