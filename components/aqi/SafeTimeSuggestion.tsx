'use client'

interface Props {
  history: any[]
}

export function SafeTimeSuggestion({ history }: Props) {
  if (!history || history.length === 0) return null

  // find lowest AQI
  const best = history.reduce((prev, curr) =>
    curr.aqi < prev.aqi ? curr : prev
  )

  // format time
  const time = new Date(best.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4">
      <h3 className="text-lg font-semibold mb-2">Best Time to Go Out</h3>
      <div className="bg-green-500 text-white p-3 rounded-lg">
        🌿 Best time to go out: {time}
      </div>
    </div>
  )
}