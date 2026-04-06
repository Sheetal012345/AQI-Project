import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const WAQI_API_TOKEN = 'a4c6b2383fff98e8808cfa3173fff36970bea235'
const WAQI_API_URL = 'https://api.waqi.info'

interface WAQIResponse {
  status: string
  data: {
    aqi: number
    idx: number
    attributions: { url: string; name: string }[]
    city: {
      geo: [number, number]
      name: string
      url: string
    }
    dominentpol?: string
    iaqi: {
      pm25?: { v: number }
      pm10?: { v: number }
      o3?: { v: number }
      no2?: { v: number }
      so2?: { v: number }
      co?: { v: number }
      t?: { v: number }
      h?: { v: number }
      p?: { v: number }
      w?: { v: number }
    }
    time: {
      s: string
      tz: string
      v: number
      iso: string
    }
    forecast?: {
      daily: {
        pm25?: { avg: number; day: string; max: number; min: number }[]
        pm10?: { avg: number; day: string; max: number; min: number }[]
        o3?: { avg: number; day: string; max: number; min: number }[]
      }
    }
  }
}

async function fetchRealAQI(city: string): Promise<WAQIResponse | null> {
  try {
    const url = `${WAQI_API_URL}/feed/${encodeURIComponent(city)}/?token=${WAQI_API_TOKEN}`
    console.log('[v0] Fetching WAQI data from:', url)
    
    const response = await fetch(url, { cache: 'no-store' })
    const data = await response.json()
    
    console.log('[v0] WAQI response status:', data.status)
    console.log('[v0] WAQI data:', JSON.stringify(data).slice(0, 500))
    
    if (data.status === 'ok') {
      return data
    }
    
    // Try searching if direct feed fails
    console.log('[v0] Direct feed failed, trying search...')
    const searchUrl = `${WAQI_API_URL}/search/?keyword=${encodeURIComponent(city)}&token=${WAQI_API_TOKEN}`
    const searchResponse = await fetch(searchUrl, { cache: 'no-store' })
    const searchData = await searchResponse.json()
    
    console.log('[v0] Search results:', searchData.data?.length || 0, 'stations found')
    
    if (searchData.status === 'ok' && searchData.data?.length > 0) {
      const stationId = searchData.data[0].uid
      console.log('[v0] Using station ID:', stationId)
      const stationResponse = await fetch(
        `${WAQI_API_URL}/feed/@${stationId}/?token=${WAQI_API_TOKEN}`,
        { cache: 'no-store' }
      )
      const stationData = await stationResponse.json()
      console.log('[v0] Station data AQI:', stationData.data?.aqi)
      return stationData
    }
    
    return null
  } catch (error) {
    console.error('[v0] WAQI API error:', error)
    return null
  }
}

function parseWAQIData(waqiData: WAQIResponse, cityName: string) {
  const { data } = waqiData
  const iaqi = data.iaqi || {}
  
  return {
    city: cityName,
    station_name: data.city?.name || cityName,
    aqi: data.aqi || 0,
    pm25: iaqi.pm25?.v || 0,
    pm10: iaqi.pm10?.v || 0,
    o3: iaqi.o3?.v || 0,
    no2: iaqi.no2?.v || 0,
    so2: iaqi.so2?.v || 0,
    co: iaqi.co?.v || 0,
    temperature: iaqi.t?.v || null,
    humidity: iaqi.h?.v || null,
    pressure: iaqi.p?.v || null,
    wind_speed: Math.round(iaqi.w?.v || 0),
    dominant_pollutant: data.dominentpol || 'pm25',
    latitude: data.city?.geo?.[0] || null,
    longitude: data.city?.geo?.[1] || null,
    measurement_time: data.time?.iso || new Date().toISOString(),
    forecast: data.forecast?.daily || null
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const city = searchParams.get('city')

  if (!city) {
    return NextResponse.json({ error: 'City is required' }, { status: 400 })
  }

  try {
    // Fetch real AQI data from WAQI API
    const waqiResponse = await fetchRealAQI(city)
    
    if (!waqiResponse || waqiResponse.status !== 'ok') {
      return NextResponse.json(
        { error: 'Could not find air quality data for this city. Try a major city name.' },
        { status: 404 }
      )
    }

    const aqiData = parseWAQIData(waqiResponse, city)
    
    // Store in Supabase for history
    const supabase = await createClient()
    
    const dbRecord = {
      city: aqiData.city,
      aqi: aqiData.aqi,
      pm25: aqiData.pm25,
      pm10: aqiData.pm10,
      o3: aqiData.o3,
      no2: aqiData.no2,
      so2: aqiData.so2,
      co: aqiData.co,
      temperature: aqiData.temperature,
      humidity: aqiData.humidity,
      pressure: aqiData.pressure,
      dominant_pollutant: aqiData.dominant_pollutant
    }

    const { data: savedData, error } = await supabase
      .from('aqi_data')
      .insert([dbRecord])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
    }

    // Log to search history
    await supabase
      .from('search_history')
      .insert([{ city: aqiData.city }])

    // Return full data including forecast
    return NextResponse.json({
      ...aqiData,
      id: savedData?.id,
      created_at: savedData?.created_at || new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching AQI:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AQI data' },
      { status: 500 }
    )
  }
}
