'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AQIData } from '@/lib/types'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  ComposedChart,
  Line
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, Calendar, Clock } from 'lucide-react'

interface AQIChartProps {
  data: AQIData[]
  title?: string
  forecast?: {
    pm25?: { avg: number; day: string; max: number; min: number }[]
    pm10?: { avg: number; day: string; max: number; min: number }[]
    o3?: { avg: number; day: string; max: number; min: number }[]
  } | null
}

function getAQIColor(aqi: number): string {
  if (aqi <= 50) return '#22c55e'
  if (aqi <= 100) return '#eab308'
  if (aqi <= 150) return '#f97316'
  if (aqi <= 200) return '#ef4444'
  if (aqi <= 300) return '#a855f7'
  return '#be123c'
}

function getTrend(data: AQIData[]): { direction: 'up' | 'down' | 'stable'; percentage: number } {
  if (data.length < 2) return { direction: 'stable', percentage: 0 }
  
  const recent = data.slice(0, Math.min(5, data.length))
  const older = data.slice(Math.min(5, data.length))
  
  if (older.length === 0) return { direction: 'stable', percentage: 0 }
  
  const recentAvg = recent.reduce((sum, d) => sum + d.aqi, 0) / recent.length
  const olderAvg = older.reduce((sum, d) => sum + d.aqi, 0) / older.length
  
  const percentage = Math.abs(((recentAvg - olderAvg) / olderAvg) * 100)
  
  if (percentage < 5) return { direction: 'stable', percentage: 0 }
  return {
    direction: recentAvg > olderAvg ? 'up' : 'down',
    percentage: Math.round(percentage)
  }
}

export function AQIChart({ data, title = 'AQI History', forecast }: AQIChartProps) {
  const safeData = Array.isArray(data) ? data : []
  
  const chartData = safeData
    .slice()
    .reverse()
    .map((item) => ({
      time: new Date(item.created_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      date: new Date(item.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      aqi: item.aqi,
      pm25: item.pm25,
      pm10: item.pm10,
      o3: item.o3,
      color: getAQIColor(item.aqi)
    }))

  const trend = getTrend(safeData)

  // Process forecast data
  const forecastData = forecast?.pm25?.map((item, index) => ({
    day: new Date(item.day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    pm25Avg: item.avg,
    pm25Max: item.max,
    pm25Min: item.min,
    pm10Avg: forecast?.pm10?.[index]?.avg || 0,
    o3Avg: forecast?.o3?.[index]?.avg || 0,
  })) || []

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium text-foreground">{entry.value}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-4"
    >
      {/* Main AQI History Chart */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg text-foreground">{title}</CardTitle>
                <p className="text-xs text-muted-foreground">Last {chartData.length} readings</p>
              </div>
            </div>
            {trend.direction !== 'stable' && (
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                trend.direction === 'down'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}>
                {trend.direction === 'up' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : trend.direction === 'down' ? (
                  <TrendingDown className="h-4 w-4" />
                ) : (
                  <Minus className="h-4 w-4" />
                )}
                <span>{trend.percentage}%</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="pm25Gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="pm10Gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                  <XAxis
                    dataKey="time"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 'auto']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    formatter={(value) => <span className="text-muted-foreground text-xs">{value}</span>}
                  />
                  <Area
                    type="monotone"
                    dataKey="aqi"
                    stroke="#14b8a6"
                    fill="url(#aqiGradient)"
                    strokeWidth={2.5}
                    name="AQI"
                    dot={{ fill: '#14b8a6', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, stroke: '#14b8a6', strokeWidth: 2, fill: '#0d1117' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pm25"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="PM2.5"
                    dot={false}
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="pm10"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="PM10"
                    dot={false}
                    strokeDasharray="3 3"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-muted-foreground">
              <Clock className="h-12 w-12 mb-3 opacity-30" />
              <p>Search for a city to see historical data</p>
              <p className="text-sm mt-1">Data is collected with each search</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forecast Chart */}
      {forecastData.length > 0 && (
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Calendar className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-lg text-foreground">Air Quality Forecast</CardTitle>
                <p className="text-xs text-muted-foreground">Next {forecastData.length} days prediction</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecastData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                  <XAxis
                    dataKey="day"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    formatter={(value) => <span className="text-muted-foreground text-xs">{value}</span>}
                  />
                  <Bar dataKey="pm25Avg" name="PM2.5 Avg" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pm10Avg" name="PM10 Avg" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="o3Avg" name="O3 Avg" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
