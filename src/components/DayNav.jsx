const Chevron = ({ direction }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
  </svg>
)

export const DayNav = ({ days, selectedDay, onChange, todayValue, message }) => {
  const index = days.findIndex((d) => d.value === selectedDay)

  // hétfőről visszalépve péntekre ugrik, péntekről előre hétfőre
  const go = (step) => onChange(days[(index + step + days.length) % days.length].value)

  return (
    <div className="day-nav">
      <div className="day-nav-controls">
        <button type="button" className="day-nav-btn" onClick={() => go(-1)} aria-label="Előző nap">
          <Chevron direction="left" />
        </button>

        <div
          className="day-nav-days"
          role="group"
          aria-label="Nap kiválasztása"
          style={{ '--day-count': days.length }}
        >
          <span className="day-indicator" style={{ transform: `translateX(${index * 100}%)` }} />
          {days.map((day) => (
            <button
              key={day.value}
              type="button"
              className={[
                'day-pill',
                selectedDay === day.value ? 'active' : '',
                todayValue === day.value ? 'is-today' : '',
              ].join(' ')}
              aria-pressed={selectedDay === day.value}
              onClick={() => onChange(day.value)}
            >
              <span className="day-full">{day.label}</span>
              <span className="day-short">{day.short}</span>
            </button>
          ))}
        </div>

        <button type="button" className="day-nav-btn" onClick={() => go(1)} aria-label="Következő nap">
          <Chevron direction="right" />
        </button>
      </div>

      {message && (
        <p key={selectedDay} className="day-note">
          {message}
        </p>
      )}
    </div>
  )
}