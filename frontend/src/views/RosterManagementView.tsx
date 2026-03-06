interface RosterManagementViewProps {
  teacherId: string
  onRosterSelect: (rosterId: string) => void
}

export default function RosterManagementView({}: RosterManagementViewProps) {

  return (
    <section className="view rosters-view">
      <h2>📋 Class Rosters</h2>
      <p>Coming in Phase 2: Upload CSV or import from Canvas</p>
      <div className="placeholder-box">
        <p>📁 Upload a roster or connect to Canvas to get started</p>
      </div>
    </section>
  )
}
