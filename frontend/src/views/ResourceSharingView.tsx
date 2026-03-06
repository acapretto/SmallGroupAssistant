interface ResourceSharingViewProps {
  teacherId: string
}

export default function ResourceSharingView({}: ResourceSharingViewProps) {
  return (
    <section className="view resources-view">
      <h2>📁 Share a Resource</h2>
      <p>Coming in Phase 4: Upload Google Doc/Sheet/Slide and share with groups</p>
      <div className="placeholder-box">
        <p>🔗 Paste Google Drive link and select groups to share with</p>
      </div>
    </section>
  )
}
