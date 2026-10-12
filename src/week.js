import { useEffect, useState } from 'react'

// Horgony: egy ismert hét hétfője és hogy az páros vagy páratlan.
// 2026. október 12. a szemeszter 6. hetének hétfője, ez páros.
// Ha az egyetem számolása eltér, csak az ANCHOR_PARITY-t írd át.
const ANCHOR_MONDAY = new Date(2026, 9, 12)
const ANCHOR_PARITY = 'even'

const mondayOf = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = d.getDay() || 7 // vasárnap = 7
  d.setDate(d.getDate() - (day - 1))
  return d
}

const weeksBetween = (a, b) =>
  Math.round(
    (Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) -
      Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) /
      (7 * 86400000)
  )

export const getWeekParity = (date = new Date()) => {
  const diff = weeksBetween(ANCHOR_MONDAY, mondayOf(date))
  const other = ANCHOR_PARITY === 'even' ? 'odd' : 'even'
  return Math.abs(diff) % 2 === 0 ? ANCHOR_PARITY : other
}

// az aktuális hét paritása; magától frissül, ha új hét kezdődik (nyitva hagyott oldalnál is)
export const useCurrentParity = () => {
  const [parity, setParity] = useState(() => getWeekParity())

  useEffect(() => {
    const update = () => setParity(getWeekParity())
    const id = setInterval(update, 60000)
    document.addEventListener('visibilitychange', update)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  return parity
}

export const PARITY_LABEL = { even: 'Páros hét', odd: 'Páratlan hét' }
export const WEEK_TYPE_LABEL = { every: 'Minden hét', even: 'Páros hét', odd: 'Páratlan hét' }

// a hiányzó week_type (régi adat) minden hétnek számít
const normalizeWeekType = (value) => {
  const s = String(value ?? '').trim().toLowerCase()
  if (['even', 'páros', 'paros'].includes(s)) return 'even'
  if (['odd', 'páratlan', 'paratlan'].includes(s)) return 'odd'
  return 'every'
}

export const occursInWeek = (weekType, parity) =>
  !weekType || weekType === 'every' || weekType === parity