import { useEffect, useState } from 'react'

export default function Toast({ message, onDone }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onDone?.() }, 2200)
    return () => clearTimeout(t)
  }, [onDone])

  if (!visible) return null
  return (
    <div className="toast-wrap">
      <div className="toast">{message}</div>
    </div>
  )
}
