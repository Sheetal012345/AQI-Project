'use client'

interface Props {
  data: any
}

export function PollutionSource({ data }: Props) {
  if (!data) return null

  const pollutants = [
    { name: 'PM2.5', value: data.pm25 },
    { name: 'PM10', value: data.pm10 },
    { name: 'NO2', value: data.no2 },
    { name: 'SO2', value: data.so2 },
    { name: 'CO', value: data.co },
    { name: 'O3', value: data.o3 }
  ]

  const highest = pollutants.reduce((prev, curr) =>
    curr.value > prev.value ? curr : prev
  )

  let source = ""

  switch (highest.name) {
    case 'PM2.5':
    case 'PM10':
      source = "Traffic pollution, road dust, construction"
      break
    case 'NO2':
      source = "Vehicle emissions"
      break
    case 'SO2':
      source = "Industrial pollution"
      break
    case 'CO':
      source = "Fuel burning, vehicles"
      break
    case 'O3':
      source = "Sunlight chemical reactions"
      break
    default:
      source = "Mixed pollution sources"
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4">
      <h3 className="text-lg font-semibold mb-2">Pollution Source Analysis</h3>
      <div className="bg-purple-500 text-white p-3 rounded-lg">
        🏭 Main source: {source}
      </div>
    </div>
  )
}