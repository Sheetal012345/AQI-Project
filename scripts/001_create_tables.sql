-- Create aqi_data table
CREATE TABLE IF NOT EXISTS aqi_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  aqi INTEGER NOT NULL,
  pm25 DECIMAL,
  pm10 DECIMAL,
  o3 DECIMAL,
  no2 DECIMAL,
  so2 DECIMAL,
  co DECIMAL,
  dominant_pollutant TEXT,
  temperature DECIMAL,
  humidity DECIMAL,
  pressure DECIMAL,
  weather_condition TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create search_history table
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_aqi_data_city ON aqi_data(city);
CREATE INDEX IF NOT EXISTS idx_aqi_data_created_at ON aqi_data(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_searched_at ON search_history(searched_at DESC);

-- Note: Not enabling RLS since this is public AQI data that doesn't require authentication
