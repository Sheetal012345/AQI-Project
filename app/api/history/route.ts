import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const city = searchParams.get('city')
  const limit = parseInt(searchParams.get('limit') || '24')

  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('aqi_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (city) {
      query = query.ilike('city', `%${city}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}
