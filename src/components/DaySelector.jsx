const DAYS = [
  { value: 1, label: 'Hétfő' },
  { value: 2, label: 'Kedd' },
  { value: 3, label: 'Szerda' },
  { value: 4, label: 'Csütörtök' },
  { value: 5, label: 'Péntek' },
]

export const DaySelector = ({ selectedDay, onSelectDay }) => {
  return (
    <div className="day-selector">
      {DAYS.map((day) => (
        <button
          key={day.value}
          className={`day-selector-btn ${selectedDay === day.value ? 'active' : ''}`}
          onClick={() => onSelectDay(day.value)}
        >
          {day.label}
        </button>
      ))}
    </div>
  )
}