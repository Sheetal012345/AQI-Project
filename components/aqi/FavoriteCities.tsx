'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  onSelect: (city: string) => void
}

export function FavoriteCities({ onSelect }: Props) {
  const [favorites, setFavorites] = useState<any[]>([])

  const fetchFavorites = async () => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('favorite_cities')
      .select('*')

    if (!error && data) {
      setFavorites(data)
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [])

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4">
      <h3 className="text-lg font-semibold mb-4 text-yellow-400">
        ⭐ Favorite Cities
      </h3>

      <div className="space-y-2">
        {favorites.map((fav) => (
          <div
            key={fav.id}
            className="flex justify-between items-center bg-black/30 p-2 rounded cursor-pointer"
          >
            <span
              onClick={() => onSelect(fav.city)}
              className="text-blue-400"
            >
              {fav.city}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}