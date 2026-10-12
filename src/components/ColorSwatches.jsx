import './ColorSwatches.css'

export const PRESET_COLORS = [
  '#0a84ff', '#8b5cf6', '#ff375f', '#ff9f0a',
  '#30d158', '#64d2ff', '#ff6482', '#ac8e68',
]

export const ColorSwatches = ({ value, onChange, label }) => {
  const isCustom = !PRESET_COLORS.includes(value.toLowerCase())

  return (
    <div className="swatch-group" role="group" aria-label={label}>
      {PRESET_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          className={`swatch-dot ${value.toLowerCase() === c ? 'active' : ''}`}
          style={{ background: c }}
          onClick={() => onChange(c)}
          aria-label={`${label}: ${c}`}
          aria-pressed={value.toLowerCase() === c}
        />
      ))}
      <label
        className={`swatch-dot swatch-custom ${isCustom ? 'active' : ''}`}
        style={isCustom ? { background: value } : undefined}
        aria-label={`${label}: egyéni szín`}
      >
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  )
}