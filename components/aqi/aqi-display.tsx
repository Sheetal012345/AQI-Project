'use client'

import { motion } from 'framer-motion'
import { Wind, Droplets, Thermometer, Gauge, Cloud } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { AQIData, getAQICategoryInfo, getAQICategory } from '@/lib/types'

interface AQIDisplayProps {
  data: AQIData
}

export function AQIDisplay({ data }: AQIDisplayProps) {
  const categoryInfo = getAQICategoryInfo(data.aqi)
  const category = getAQICategory(data.aqi)
  
  const gradientClass = `gradient-${category.replace('unhealthy-sensitive', 'unhealthy-sensitive')}`
  const glowClass = `glow-${category.replace('unhealthy-sensitive', 'unhealthy-sensitive')}`

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Card className={`overflow-hidden border-2 ${categoryInfo.borderColor} ${gradientClass} ${glowClass}`}>
        <CardContent className="p-6 md:p-8">
          {/* Header with city and AQI */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold text-foreground mb-1"
              >
                {data.city}
              </motion.h2>
              {data.station_name && data.station_name !== data.city && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="text-sm text-muted-foreground mb-2"
                >
                  {data.station_name}
                </motion.p>
              )}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground"
              >
                {data.temperature !== null && data.temperature !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <Thermometer className="h-4 w-4 text-orange-400" />
                    <span>{data.temperature}°C</span>
                  </div>
                )}
                {data.humidity !== null && data.humidity !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <Droplets className="h-4 w-4 text-blue-400" />
                    <span>{data.humidity}%</span>
                  </div>
                )}
                {data.wind_speed !== null && data.wind_speed !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <Wind className="h-4 w-4 text-cyan-400" />
                    <span>{data.wind_speed} m/s</span>
                  </div>
                )}
                {data.dominant_pollutant && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary/50 text-xs">
                    <span className="text-muted-foreground">Main pollutant:</span>
                    <span className="font-medium text-foreground uppercase">{data.dominant_pollutant}</span>
                  </div>
                )}
              </motion.div>
            </div>
            
            {/* AQI Circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
              className="flex flex-col items-center"
            >
              <div className={`relative w-32 h-32 rounded-full ${categoryInfo.bgColor} border-4 ${categoryInfo.borderColor} flex items-center justify-center`}>
                <div className="text-center">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={`text-4xl font-bold ${categoryInfo.color}`}
                  >
                    {data.aqi}
                  </motion.span>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">AQI</p>
                </div>
                {/* Animated ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="58"
                    fill="none"
                    strokeWidth="4"
                    stroke="currentColor"
                    className={categoryInfo.color.replace('text-', 'stroke-').replace('-400', '-500')}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: Math.min(data.aqi / 500, 1) }}
                    transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                    style={{ 
                      strokeDasharray: '1 1',
                    }}
                  />
                </svg>
              </div>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`mt-3 px-4 py-1.5 rounded-full text-sm font-semibold ${categoryInfo.bgColor} ${categoryInfo.color} border ${categoryInfo.borderColor}`}
              >
                {categoryInfo.label}
              </motion.span>
            </motion.div>
          </div>

          {/* AQI Scale Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="relative h-4 rounded-full overflow-hidden bg-secondary/50">
              <div className="absolute inset-0 flex">
                <div className="flex-1 bg-emerald-500" />
                <div className="flex-1 bg-yellow-500" />
                <div className="flex-1 bg-orange-500" />
                <div className="flex-1 bg-red-500" />
                <div className="flex-1 bg-purple-500" />
                <div className="flex-1 bg-rose-600" />
              </div>
              {/* Indicator */}
              <motion.div
                initial={{ left: '0%' }}
                animate={{ left: `${Math.min((data.aqi / 500) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              >
                <div className="w-6 h-6 rounded-full bg-white border-2 border-background shadow-lg flex items-center justify-center">
                  <div className={`w-3 h-3 rounded-full ${
                    data.aqi <= 50 ? 'bg-emerald-500' :
                    data.aqi <= 100 ? 'bg-yellow-500' :
                    data.aqi <= 150 ? 'bg-orange-500' :
                    data.aqi <= 200 ? 'bg-red-500' :
                    data.aqi <= 300 ? 'bg-purple-500' : 'bg-rose-600'
                  }`} />
                </div>
              </motion.div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>0</span>
              <span>50</span>
              <span>100</span>
              <span>150</span>
              <span>200</span>
              <span>300</span>
              <span>500</span>
            </div>
          </motion.div>

          {/* Pollutant Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <PollutantCard icon={Droplets} label="PM2.5" value={data.pm25} unit="μg/m³" color="text-blue-400" bgColor="bg-blue-500/10" delay={0.5} />
            <PollutantCard icon={Wind} label="PM10" value={data.pm10} unit="μg/m³" color="text-cyan-400" bgColor="bg-cyan-500/10" delay={0.6} />
            <PollutantCard icon={Gauge} label="O₃" value={data.o3} unit="ppb" color="text-amber-400" bgColor="bg-amber-500/10" delay={0.7} />
            <PollutantCard icon={Cloud} label="NO₂" value={data.no2} unit="ppb" color="text-rose-400" bgColor="bg-rose-500/10" delay={0.8} />
          </div>

          {/* Health Advisory */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className={`mt-6 p-4 rounded-xl ${categoryInfo.bgColor} border ${categoryInfo.borderColor}`}
          >
            <h4 className={`text-sm font-semibold ${categoryInfo.color} mb-1`}>Health Advisory</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{categoryInfo.healthImplications}</p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function PollutantCard({ 
  icon: Icon, 
  label, 
  value, 
  unit, 
  color,
  bgColor,
  delay 
}: { 
  icon: React.ElementType
  label: string
  value: number
  unit: string
  color: string
  bgColor: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-xl ${bgColor} border border-border/50 backdrop-blur-sm`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${bgColor}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">
        {value}
        <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>
      </p>
    </motion.div>
  )
}
