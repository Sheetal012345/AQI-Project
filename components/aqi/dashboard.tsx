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

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function Dashboard() {
  const [currentCity, setCurrentCity] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)

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

  return (
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
          <SearchInput onSearch={handleSearch} isLoading={isSearching} />
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
                <AQIChart 
                  data={history || []} 
                  title={`${currentCity} - AQI History`}
                  forecast={currentAQI?.forecast}
                />
                <PollutantDetails data={currentAQI} />
              </div>
              <div className="space-y-6">
                <HealthRecommendations aqi={currentAQI.aqi} />
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
  )
}
