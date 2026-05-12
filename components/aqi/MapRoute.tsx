'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
//import 'leaflet-routing-machine'
//import L from 'leaflet'
import { useMap } from 'react-leaflet'
import { useEffect } from 'react'

const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import('react-leaflet').then((m) => m.Marker),
  { ssr: false }
)

const Popup = dynamic(
  () => import('react-leaflet').then((m) => m.Popup),
  { ssr: false }
)

const Polyline = dynamic(
  () => import('react-leaflet').then((m) => m.Polyline),
  { ssr: false }
)

interface Props {
  lat: number
  lon: number
  aqi: number
}

function Routing({
  start,
  end,
}: {
  start: [number, number]
  end: [number, number]
}) {
  const map = useMap()

  useEffect(() => {
    if (!map) return
      const L = require('leaflet')
  require('leaflet-routing-machine')


    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1]),
      ],

      lineOptions: {
        styles: [{ color: 'lime', weight: 5 }],
      },

      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      showAlternatives: false,

  createMarker: function () {
    return null
  },
    }).addTo(map)
    // HIDE ROUTE PANEL
document.querySelectorAll('.leaflet-routing-container').forEach((el) => {
  ;(el as HTMLElement).style.display = 'none'
})
    return () => {}
  }, [map, start, end])

  return null
}
export function MapRoute({ lat, lon, aqi }: Props) {
  const [destination, setDestination] = useState('')
  const [destinationCoords, setDestinationCoords] = useState<{
    lat: number
    lon: number
  } | null>(null)

  if (!lat || !lon) return null

  // AQI-based clean route suggestion
  let suggestion = ''
  let color = ''

  if (aqi > 150) {
    suggestion = '🔴 Unsafe route - Avoid travel'
    color = 'bg-red-500'
  } else if (aqi > 100) {
    suggestion = '🟠 Moderate pollution - Prefer cleaner roads'
    color = 'bg-orange-500'
  } else {
    suggestion = '🟢 Clean route - Safe to travel'
    color = 'bg-green-500'
  }

  // Search destination city
  const handleDestinationSearch = async () => {
    if (!destination) return

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${destination}&format=json&limit=1`
      )

      const data = await res.json()

      if (data.length > 0) {
        setDestinationCoords({
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4">
      <h3 className="text-lg font-semibold mb-4 text-white">
        Clean Route Map
      </h3>

      {/* Destination Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="flex-1 p-2 rounded bg-black text-white border border-gray-700"
        />

        <button
          onClick={handleDestinationSearch}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Route
        </button>
      </div>

      {/* MAP */}
      <MapContainer
  center={[lat, lon]}
  zoom={13}
  scrollWheelZoom={true}
  dragging={true}
  doubleClickZoom={true}
  touchZoom={true}
  zoomControl={true}
  style={{
    height: '300px',
    width: '100%',
    cursor: 'grab',
  }}
>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Current Location */}
        <Marker position={[lat, lon]}>
          <Popup>
            📍 Your Location <br />
            AQI: {aqi}
          </Popup>
        </Marker>

        {/* Destination Marker */}
        {destinationCoords && (
          <>
            <Marker
              position={[destinationCoords.lat, destinationCoords.lon]}
            >
              <Popup>🎯 Destination</Popup>
            </Marker>

            {/* Route Line */}
           <Routing
  start={[lat, lon]}
  end={[destinationCoords.lat, destinationCoords.lon]}
/>
          </>
        )}
      </MapContainer>

      {/* Route Status */}
      <div className={`mt-3 text-white p-3 rounded ${color}`}>
        🚗 {suggestion}
      </div>
    </div>
  )
}