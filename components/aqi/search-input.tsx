'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchInputProps {
  onSearch: (city: string) => void
  isLoading?: boolean
}

const popularCities = [
  'New York',
  'London',
  'Tokyo',
  'Paris',
  'Beijing',
  'Mumbai',
]

export function SearchInput({ onSearch, isLoading }: SearchInputProps) {
  const [city, setCity] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (city.trim()) {
      onSearch(city.trim())
    }
  }

  const handleQuickSearch = (c: string) => {
    setCity(c)
    onSearch(c)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter city name..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="pl-10 h-12 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button
            type="submit"
            disabled={!city.trim() || isLoading}
            className="h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </div>
      </form>

      <div className="mt-4">
        <p className="text-sm text-muted-foreground mb-2">Popular cities:</p>
        <div className="flex flex-wrap gap-2">
          {popularCities.map((cityName, index) => (
            <motion.button
              key={cityName}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleQuickSearch(cityName)}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm rounded-full bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors border border-border/50 disabled:opacity-50"
            >
              {cityName}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
