interface DashboardViewProps {
  teacherId: string
}

export default function DashboardView({}: DashboardViewProps) {
  return (
    <section className="view dashboard-view">
      <h2>📊 Dashboard</h2>
      <p>Coming in Phase 5: View all groups, shared resources, and access status</p>
      <div className="placeholder-box">
        <p>📈 Track which groups have accessed resources and see sharing history</p>
      </div>
    </section>
  )
}
