interface GroupManagementViewProps {
  rosterId: string
  teacherId: string
}

export default function GroupManagementView({}: GroupManagementViewProps) {
  return (
    <section className="view groups-view">
      <h2>👥 Group Management</h2>
      <p>Coming in Phase 3: Drag-drop students into groups</p>
      <div className="placeholder-box">
        <p>🎯 Drag students to create groups</p>
      </div>
    </section>
  )
}
