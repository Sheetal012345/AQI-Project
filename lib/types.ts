export interface ForecastDay {
  avg: number
  day: string
  max: number
  min: number
}

export interface AQIForecast {
  pm25?: ForecastDay[]
  pm10?: ForecastDay[]
  o3?: ForecastDay[]
}

export interface AQIData {
  id?: string
  city: string
  station_name?: string
  aqi: number
  pm25: number
  pm10: number
  o3: number
  no2: number
  so2: number
  co: number
  created_at: string
  temperature?: number | null
  humidity?: number | null
  pressure?: number | null
  wind_speed?: number | null
  dominant_pollutant?: string
  latitude?: number | null
  longitude?: number | null
  measurement_time?: string
  forecast?: AQIForecast | null
}

export interface SearchHistory {
  id: string
  city: string
  searched_at: string
}

export type AQICategory = 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous'

export interface AQICategoryInfo {
  label: string
  color: string
  bgColor: string
  borderColor: string
  min: number
  max: number
  description: string
  healthImplications: string
  cautionaryStatement: string
}

export const AQI_CATEGORIES: Record<AQICategory, AQICategoryInfo> = {
  'good': {
    label: 'Good',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    min: 0,
    max: 50,
    description: 'Air quality is satisfactory',
    healthImplications: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
    cautionaryStatement: 'None'
  },
  'moderate': {
    label: 'Moderate',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    min: 51,
    max: 100,
    description: 'Air quality is acceptable',
    healthImplications: 'Air quality is acceptable; however, there may be a moderate health concern for a very small number of people.',
    cautionaryStatement: 'Active children and adults, and people with respiratory disease, such as asthma, should limit prolonged outdoor exertion.'
  },
  'unhealthy-sensitive': {
    label: 'Unhealthy for Sensitive Groups',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30',
    min: 101,
    max: 150,
    description: 'Sensitive groups may experience health effects',
    healthImplications: 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.',
    cautionaryStatement: 'Active children and adults, and people with respiratory disease, such as asthma, should limit prolonged outdoor exertion.'
  },
  'unhealthy': {
    label: 'Unhealthy',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    min: 151,
    max: 200,
    description: 'Everyone may begin to experience health effects',
    healthImplications: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.',
    cautionaryStatement: 'Active children and adults, and people with respiratory disease, such as asthma, should avoid prolonged outdoor exertion; everyone else should limit prolonged outdoor exertion.'
  },
  'very-unhealthy': {
    label: 'Very Unhealthy',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    min: 201,
    max: 300,
    description: 'Health alert',
    healthImplications: 'Health warnings of emergency conditions. The entire population is more likely to be affected.',
    cautionaryStatement: 'Active children and adults, and people with respiratory disease, such as asthma, should avoid all outdoor exertion; everyone else should limit outdoor exertion.'
  },
  'hazardous': {
    label: 'Hazardous',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/20',
    borderColor: 'border-rose-500/30',
    min: 301,
    max: 500,
    description: 'Health emergency',
    healthImplications: 'Health alert: everyone may experience more serious health effects.',
    cautionaryStatement: 'Everyone should avoid all outdoor exertion.'
  }
}

export function getAQICategory(aqi: number): AQICategory {
  if (aqi <= 50) return 'good'
  if (aqi <= 100) return 'moderate'
  if (aqi <= 150) return 'unhealthy-sensitive'
  if (aqi <= 200) return 'unhealthy'
  if (aqi <= 300) return 'very-unhealthy'
  return 'hazardous'
}

export function getAQICategoryInfo(aqi: number): AQICategoryInfo {
  return AQI_CATEGORIES[getAQICategory(aqi)]
}
