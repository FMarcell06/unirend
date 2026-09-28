const DAYS = [
  { value: 1, label: 'Hétfő', short: 'Hé' },
  { value: 2, label: 'Kedd', short: 'Ke' },
  { value: 3, label: 'Szerda', short: 'Sze' },
  { value: 4, label: 'Csütörtök', short: 'Cs' },
  { value: 5, label: 'Péntek', short: 'Pé' },
]

export const DaySelector = ({ selectedDay, onSelectDay, todayValue }) => {
  return (
    <div className="day-selector">
      {DAYS.map((day) => (
        <button
          key={day.value}
          className={[
            'day-selector-btn',
            selectedDay === day.value ? 'active' : '',
            todayValue === day.value ? 'is-today' : '',
          ].join(' ')}
          onClick={() => onSelectDay(day.value)}
        >
          <span className="day-full">{day.label}</span>
          <span className="day-short">{day.short}</span>
        </button>
      ))}
    </div>
  )
}