import { Modal } from 'react-responsive-modal'
import 'react-responsive-modal/styles.css'

const DAYS_HU = {
  1: 'Hétfő', 2: 'Kedd', 3: 'Szerda', 4: 'Csütörtök', 5: 'Péntek',
}

const TYPE_HU = {
  lecture: 'Előadás', practice: 'Gyakorlat', lab: 'Labor',
}

export const CourseModal = ({ session, onClose }) => {
  const open = Boolean(session)

  return (
    <Modal
      open={open}
      onClose={onClose}
      center
      classNames={{
        modal: 'course-modal',
      }}
      styles={{
        modal: {
          borderTop: session ? `6px solid ${session.color || '#3b82f6'}` : 'none',
          borderRadius: '8px',
          minWidth: '320px',
          maxWidth: '400px',
        },
      }}
    >
      {session && (
        <div>
          <h2 style={{ color: session.color || '#3b82f6', marginTop: 0 }}>
            {session.courseName}
          </h2>

          {session.courseCode && <p><strong>Kód:</strong> {session.courseCode}</p>}
          {session.instructor && <p><strong>Oktató:</strong> {session.instructor}</p>}
          <p><strong>Nap:</strong> {DAYS_HU[session.day_of_week]}</p>
          <p><strong>Időpont:</strong> {session.start_time.slice(0, 5)}–{session.end_time.slice(0, 5)}</p>
          {session.type && <p><strong>Típus:</strong> {TYPE_HU[session.type] || session.type}</p>}
          {session.room && <p><strong>Terem:</strong> {session.room}</p>}
        </div>
      )}
    </Modal>
  )
}