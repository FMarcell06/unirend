import { Modal } from 'react-responsive-modal'
import 'react-responsive-modal/styles.css'
import './GlassModal.css'

const DAYS_HU = { 1: 'Hétfő', 2: 'Kedd', 3: 'Szerda', 4: 'Csütörtök', 5: 'Péntek' }
const TYPE_HU = { lecture: 'Előadás', practice: 'Gyakorlat', lab: 'Labor' }

export const CourseModal = ({ session, onClose }) => {
  const rows = session
    ? [
        ['Kód', session.courseCode],
        ['Oktató', session.instructor],
        ['Nap', DAYS_HU[session.day_of_week]],
        ['Időpont', `${session.start_time.slice(0, 5)}–${session.end_time.slice(0, 5)}`],
        ['Típus', TYPE_HU[session.type] || session.type],
        ['Terem', session.room],
      ].filter(([, value]) => value)
    : []

  return (
    <Modal
      open={Boolean(session)}
      onClose={onClose}
      center
      classNames={{ overlay: 'glass-overlay', modal: 'glass-modal' }}
    >
      {session && (
        <>
          <div className="detail-head">
            <span className="detail-swatch" style={{ background: session.color || '#0a84ff' }} />
            <h2>{session.courseName}</h2>
          </div>

          <dl className="detail-list">
            {rows.map(([label, value]) => (
              <div key={label} style={{ display: 'contents' }}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </Modal>
  )
}