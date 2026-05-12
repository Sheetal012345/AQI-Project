'use client'

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { motion, AnimatePresence } from 'framer-motion'
import { Wind, RefreshCw } from 'lucide-react'
import { SearchInput } from './search-input'
import { AQIDisplay } from './aqi-display'
import { AQIChart } from './aqi-chart'
import { SearchHistory } from './search-history'
import { PollutantDetails } from './pollutant-details'
import { HealthRecommendations } from './health-recommendations'
import { AQIData, SearchHistory as SearchHistoryType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'
import { SafeTimeSuggestion } from './SafeTimeSuggestion'
import { FavoriteCities } from './FavoriteCities'
import { createClient } from '@/lib/supabase/client'
import { PollutionSource } from './PollutionSource'
import { MapRoute } from './MapRoute'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function Dashboard() {
  const [userCity, setUserCity] = useState<string | null>(null)
  const getAlert = (aqi: number) => {
  if (aqi <= 50) return "Good air quality";
  if (aqi <= 100) return "Moderate air quality";
  if (aqi <= 150) return "Unhealthy for sensitive groups";
  if (aqi <= 200) return "Unhealthy air quality";
  if (aqi <= 300) return "Very unhealthy air quality";
  return "Hazardous air quality!";
};
  const [currentCity, setCurrentCity] = useState<string | null>(null)
   // ✅ ADD HERE 👇
  const addFavorite = async () => {
    if (!currentCity) return

    const supabase = createClient()

    await supabase.from('favorite_cities').insert([
      { city: currentCity }
    ])

    alert("Saved!")
  }
  const [showAlert, setShowAlert] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  // ✅ ADD HERE
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)

  const { data: currentAQI, mutate: mutateAQI } = useSWR<AQIData>(
    currentCity ? `/api/aqi?city=${encodeURIComponent(currentCity)}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )
  
  const { data: history, mutate: mutateHistory } = useSWR<AQIData[]>(
    currentCity ? `/api/history?city=${encodeURIComponent(currentCity)}&limit=24` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  const { data: searchHistory, mutate: mutateSearchHistory } = useSWR<SearchHistoryType[]>(
    '/api/search',
    fetcher,
    { revalidateOnFocus: false }
  )

  const handleSearch = useCallback(async (city: string) => {
  setIsSearching(true)
  setCurrentCity(city)

  try {
    // ✅ GET LAT/LON FROM API
    const res = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${process.env.NEXT_PUBLIC_OPENCAGE_KEY}`
    )

    const data = await res.json()

    const location = data.results[0]?.geometry

    if (location) {
      setCoords({
        lat: location.lat,
        lon: location.lng
      })
    }

    await mutateAQI()
    await mutateHistory()
    await mutateSearchHistory()
  } finally {
    setIsSearching(false)
  }
}, [mutateAQI, mutateHistory, mutateSearchHistory])

  const handleRefresh = useCallback(async () => {
    if (!currentCity) return
    setIsSearching(true)
    try {
      await mutateAQI()
      await mutateHistory()
    } finally {
      setIsSearching(false)
    }
  }, [currentCity, mutateAQI, mutateHistory])
  useEffect(() => {
  if (currentAQI && currentAQI.aqi > 100) {
    setShowAlert(true)

    const timer = setTimeout(() => {
      setShowAlert(false)
    }, 4000)

    return () => clearTimeout(timer)
  }
}, [currentAQI?.aqi])
useEffect(() => {
  if (!navigator.geolocation) {
    console.log("Geolocation not supported")
    return
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude
      const lon = position.coords.longitude
      setCoords({
  lat: position.coords.latitude,
  lon: position.coords.longitude
})

      try {
        const res = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${process.env.NEXT_PUBLIC_OPENCAGE_KEY}`
        )

        const data = await res.json()

        const city =
          data.results[0]?.components?.city ||
          data.results[0]?.components?.town ||
          data.results[0]?.components?.state

        if (city) {
          setUserCity(city)
          setCurrentCity(city)
          handleSearch(city)
        }
      } catch (err) {
        console.log("Location fetch error:", err)
      }
    },
    (error) => {
      console.log("Permission denied or error:", error)
      alert("Location access denied. Please search manually.")
    }
  )
}, [])
  return (
    <>
    {/* ✅ POPUP */}
  {showAlert && currentAQI && (
    <div className="fixed top-5 right-5 z-[9999] pointer-events-auto bg-yellow-500 text-black p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center gap-4">
        <div>
          🚨 {getAlert(currentAQI.aqi)}
        </div>
        <button
          onClick={() => setShowAlert(false)}
          className="font-bold"
        >
          ✖
        </button>
      </div>
    </div>
  )}
  
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/20 border border-primary/30">
                <Wind className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AQI Analyzer</h1>
                <p className="text-xs text-muted-foreground">Real-time Air Quality Monitoring</p>
              </div>
            </motion.div>
            {currentCity && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isSearching}
                  className="border-border/50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSearching ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-8">
          {userCity && (
  <p className="text-sm text-green-400 mb-2">
    📍 Detected Location: {userCity}
  </p>
)}
          <SearchInput onSearch={handleSearch} isLoading={isSearching} />
          {/* ✅ TEST BUTTON (ADD HERE) */}
  <button
  onClick={() => setShowAlert(true)}
  className="mt-3 px-4 py-2 bg-blue-500 text-white rounded relative z-50"
>
  Test Alert
</button>
        </div>

        <AnimatePresence mode="wait">
          {currentAQI && !('error' in currentAQI) ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-6 lg:grid-cols-3"
            >
              <div className="lg:col-span-2 space-y-6">
                <AQIDisplay data={currentAQI} />
                <button
  onClick={addFavorite}
  className="mt-2 px-3 py-1 bg-yellow-500 text-black rounded"
>
  ⭐ Add to Favorites
</button>
                {currentAQI?.aqi && getAlert(currentAQI.aqi) && (
  <div className="bg-red-500 text-white p-3 rounded-lg mt-4">
    {getAlert(currentAQI.aqi)}
  </div>
)}
                <AQIChart 
                  data={history || []} 
                  title={`${currentCity} - AQI History`}
                  forecast={currentAQI?.forecast}
                />
                <SafeTimeSuggestion history={history || []} />
                <PollutantDetails data={currentAQI} />
                <PollutionSource data={currentAQI} />
              </div>
              <div className="space-y-6">
                <HealthRecommendations aqi={currentAQI.aqi} />
                {coords && currentAQI && (
  <MapRoute
    lat={coords.lat}
    lon={coords.lon}
    aqi={currentAQI.aqi}
  />
)}
                {/* ⭐ ADD HERE */}
                <FavoriteCities onSelect={handleSearch} />   
                <SearchHistory history={searchHistory || []} onSelect={handleSearch} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-6 lg:grid-cols-3"
            >
              <div className="lg:col-span-2">
                <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-border/50 bg-card p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 border border-primary/20 mb-4"
                  >
                    <Wind className="h-10 w-10 text-primary" />
                  </motion.div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Search for a City
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    Enter a city name above to get real-time air quality data, historical trends, and personalized health recommendations.
                  </p>
                </div>
              </div>
              <div>
                <SearchHistory history={searchHistory || []} onSelect={handleSearch} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-border/50 py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            AQI Analyzer - Real-time air quality monitoring powered by environmental data
          </p>
        </div>
      </footer>
    </div>
    </>
  )
}
