'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAQICategoryInfo } from '@/lib/types'
import { Heart, Shield, Activity, AlertTriangle, Users, Wind } from 'lucide-react'

interface HealthRecommendationsProps {
  aqi: number
}

export function HealthRecommendations({ aqi }: HealthRecommendationsProps) {
  const categoryInfo = getAQICategoryInfo(aqi)
  
  const recommendations = getRecommendations(aqi)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className={`border ${categoryInfo.borderColor} ${categoryInfo.bgColor}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <Heart className={`h-5 w-5 ${categoryInfo.color}`} />
            Health Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 rounded-lg bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className={`h-4 w-4 ${categoryInfo.color}`} />
              <span className={`text-sm font-medium ${categoryInfo.color}`}>
                {categoryInfo.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {categoryInfo.cautionaryStatement}
            </p>
          </div>

          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 border border-border/30"
              >
                <rec.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">{rec.title}</p>
                  <p className="text-xs text-muted-foreground">{rec.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function getRecommendations(aqi: number) {
  if (aqi <= 50) {
    return [
      { icon: Activity, title: 'Enjoy Outdoor Activities', description: 'Air quality is ideal for outdoor exercise and activities.' },
      { icon: Wind, title: 'Open Windows', description: 'Great time to ventilate your home with fresh air.' },
      { icon: Users, title: 'No Restrictions', description: 'Everyone can enjoy normal outdoor activities.' },
    ]
  }
  if (aqi <= 100) {
    return [
      { icon: Activity, title: 'Moderate Outdoor Activity', description: 'Sensitive individuals should consider reducing prolonged outdoor exertion.' },
      { icon: Shield, title: 'Monitor Symptoms', description: 'People with respiratory conditions should be aware of symptoms.' },
      { icon: Users, title: 'General Population', description: 'Most people can engage in normal activities.' },
    ]
  }
  if (aqi <= 150) {
    return [
      { icon: Shield, title: 'Limit Outdoor Exposure', description: 'Sensitive groups should limit prolonged outdoor activities.' },
      { icon: Activity, title: 'Reduce Exercise Intensity', description: 'Consider indoor exercise alternatives.' },
      { icon: Wind, title: 'Keep Windows Closed', description: 'Use air purifiers if available.' },
    ]
  }
  if (aqi <= 200) {
    return [
      { icon: Shield, title: 'Avoid Outdoor Activities', description: 'Everyone should reduce prolonged outdoor exertion.' },
      { icon: Activity, title: 'Stay Indoors', description: 'Exercise indoors and keep windows closed.' },
      { icon: AlertTriangle, title: 'Wear Mask', description: 'Use N95 mask if outdoor exposure is necessary.' },
    ]
  }
  return [
    { icon: AlertTriangle, title: 'Health Emergency', description: 'Avoid all outdoor physical activities.' },
    { icon: Shield, title: 'Stay Indoors', description: 'Keep all windows and doors closed.' },
    { icon: Activity, title: 'Use Air Purifiers', description: 'Run HEPA air purifiers continuously.' },
  ]
}
