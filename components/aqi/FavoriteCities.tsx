'use client'

import { useEffect, useState } from 'react'

interface Props {
  onSelect: (city: string) => void
}

export function FavoriteCities({ onSelect }: Props) {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('favorites')
    if (saved) setFavorites(JSON.parse(saved))
  }, [])

  const removeCity = (city: string) => {
    const updated = favorites.filter(c => c !== city)
    setFavorites(updated)
    localStorage.setItem('favorites', JSON.stringify(updated))
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4">
      <h3 className="text-lg font-semibold mb-3">⭐ Favorite Cities</h3>

      {favorites.length === 0 ? (
        <p className="text-muted-foreground">No favorites yet</p>
      ) : (
        <div className="space-y-2">
          {favorites.map(city => (
            <div key={city} className="flex justify-between items-center">
              <button
                onClick={() => onSelect(city)}
                className="text-blue-400 hover:underline"
              >
                {city}
              </button>
              <button
                onClick={() => removeCity(city)}
                className="text-red-400"
              >
                ✖
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}