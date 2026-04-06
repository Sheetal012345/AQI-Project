'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AQIData } from '@/lib/types'
import { Droplets, Wind, CloudSun, AlertCircle, Flame, Gauge } from 'lucide-react'

interface PollutantDetailsProps {
  data: AQIData
}

const pollutants = [
  { key: 'pm25', label: 'PM2.5', unit: 'μg/m³', icon: Droplets, description: 'Fine particulate matter', threshold: 35 },
  { key: 'pm10', label: 'PM10', unit: 'μg/m³', icon: Wind, description: 'Coarse particulate matter', threshold: 150 },
  { key: 'o3', label: 'Ozone (O₃)', unit: 'ppb', icon: CloudSun, description: 'Ground-level ozone', threshold: 70 },
  { key: 'no2', label: 'Nitrogen Dioxide', unit: 'ppb', icon: AlertCircle, description: 'NO₂ concentration', threshold: 100 },
  { key: 'so2', label: 'Sulfur Dioxide', unit: 'ppb', icon: Flame, description: 'SO₂ concentration', threshold: 75 },
  { key: 'co', label: 'Carbon Monoxide', unit: 'ppm', icon: Gauge, description: 'CO concentration', threshold: 9 },
] as const

export function PollutantDetails({ data }: PollutantDetailsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-foreground">Pollutant Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {pollutants.map((pollutant, index) => {
              const value = data[pollutant.key as keyof AQIData] as number
              const percentage = Math.min((value / pollutant.threshold) * 100, 100)
              const isHigh = percentage > 80
              const Icon = pollutant.icon

              return (
                <motion.div
                  key={pollutant.key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="p-3 rounded-lg bg-secondary/30 border border-border/50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-4 w-4 ${isHigh ? 'text-destructive' : 'text-primary'}`} />
                    <span className="text-xs text-muted-foreground">{pollutant.label}</span>
                  </div>
                  <p className={`text-xl font-bold ${isHigh ? 'text-destructive' : 'text-foreground'}`}>
                    {value}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      {pollutant.unit}
                    </span>
                  </p>
                  <div className="mt-2 h-1.5 rounded-full bg-secondary/50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                      className={`h-full rounded-full ${
                        percentage > 80 ? 'bg-destructive' :
                        percentage > 50 ? 'bg-yellow-500' :
                        'bg-primary'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{pollutant.description}</p>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
