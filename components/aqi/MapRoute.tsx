'use client'

import dynamic from 'next/dynamic'

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false })
import 'leaflet/dist/leaflet.css'

interface Props {
  lat: number
  lon: number
  aqi: number
}

export function MapRoute({ lat, lon, aqi }: Props) {
  if (!lat || !lon) return null

  let suggestion = ""

  if (aqi > 150) {
    suggestion = "Avoid travel or take less polluted routes"
  } else if (aqi > 100) {
    suggestion = "Prefer less crowded roads"
  } else {
    suggestion = "Safe to travel"
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4">
      <h3 className="text-lg font-semibold mb-2">Clean Route Map</h3>

      <MapContainer
        center={[lat, lon]}
        zoom={13}
        style={{ height: "300px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[lat, lon]}>
          <Popup>
            📍 Your Location <br />
            AQI: {aqi} <br />
            {suggestion}
          </Popup>
        </Marker>
      </MapContainer>

      <div className="mt-3 bg-blue-500 text-white p-2 rounded">
        🚗 {suggestion}
      </div>
    </div>
  )
}