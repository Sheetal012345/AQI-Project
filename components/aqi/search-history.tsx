'use client'

import { motion } from 'framer-motion'
import { Clock, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchHistory as SearchHistoryType } from '@/lib/types'

interface SearchHistoryProps {
  history: SearchHistoryType[]
  onSelect: (city: string) => void
}

export function SearchHistory({ history, onSelect }: SearchHistoryProps) {
  if (history.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Recent Searches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {history.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelect(item.city)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-left border border-border/50"
              >
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.city}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(item.searched_at).toLocaleDateString()}
                </span>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
