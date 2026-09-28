// ide nyugodtan írhatsz még üzeneteket, a kód magától kiválaszt egyet
const MESSAGES = {
  free: [
    'Nincs óra. A nap a tiéd. 🎉',
    'Szabad nap, ne pazarold el.',
    'Ma nincs mit cookolni. 😎',
    'Üres naptár, tiszta fej.',
    'Alvás, kávé, semmi kötelező.',
  ],
  light: [
    'Könnyű nap, menni fog.',
    'Belefér egy hosszú ebéd is.',
    'Ez még a barátságos fajta nap.',
    'Kevés óra, sok szabadidő.',
  ],
  normal: [
    'Ez teljesen kezelhető.',
    'Egy átlagos egyetemi nap.',
    'Kávé, jegyzet, indulhat.',
    'Semmi pánik, minden rendben.',
    'Kitartás, közeleg a szünet.',
  ],
  heavy: [
    'Hát ez cooked… 💀',
    'Ehhez sok kávé kell. ☕',
    'Erős nap, erős idegek.',
    'Ne felejts el enni közben.',
    'Hősies teljesítmény lesz.',
  ],
}

// csak a mai napnál kerülnek be a lehetőségek közé
const TODAY_ONLY = [
  'Sok sikert a naphoz! 💪',
  'Kezdődhet a mai kör.',
  'Csak egy óra egyszerre, menni fog.',
]

const hash = (text) => [...text].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7)

const timeToMinutes = (time) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export const getDayMessage = ({ sessions, dayValue, isToday }) => {
  const minutes = sessions.reduce(
    (sum, s) => sum + (timeToMinutes(s.end_time) - timeToMinutes(s.start_time)),
    0
  )

  let load = 'normal'
  if (sessions.length === 0) load = 'free'
  else if (minutes >= 360 || sessions.length >= 5) load = 'heavy'
  else if (minutes <= 180) load = 'light'

  const pool = isToday && load !== 'free' ? [...MESSAGES[load], ...TODAY_ONLY] : MESSAGES[load]

  // ugyanarra a napra egy napon belül mindig ugyanaz az üzenet jön
  const seed = hash(`${new Date().toDateString()}-${dayValue}`)
  return pool[seed % pool.length]
}