import { useState, useEffect } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Gauge, 
  Sun, 
  Eye, 
  MapPin,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { WeatherCard } from './WeatherCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface WeatherData {
  stationID: string;
  obsTimeUtc: string;
  obsTimeLocal: string;
  neighborhood: string;
  country: string;
  solarRadiation: number;
  lon: number;
  lat: number;
  uv: number;
  winddir: number;
  humidity: number;
  imperial: {
    temp: number;
    heatIndex: number;
    dewpt: number;
    windChill: number;
    windSpeed: number;
    windGust: number;
    pressure: number;
    precipRate: number;
    precipTotal: number;
    elev: number;
  };
}

interface WeatherResponse {
  observations: WeatherData[];
}

export const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { toast } = useToast();

  const API_URL = "https://api.weather.com/v2/pws/observations/current?apiKey=d90d5c85931b4fdb8d5c85931b2fdb05&format=json&stationId=IBORLN23&units=e";

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: WeatherResponse = await response.json();
      
      if (data.observations && data.observations.length > 0) {
        setWeatherData(data.observations[0]);
        setLastUpdate(new Date());
        toast({
          title: "Weather Updated",
          description: "Weather data refreshed successfully",
          duration: 3000,
        });
      } else {
        throw new Error('No weather data available');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  if (loading && !weatherData) {
    return (
      <div className="min-h-screen bg-sky-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 text-primary animate-weather-rotate mx-auto" />
          <h2 className="text-2xl font-semibold text-foreground">Loading Weather Data...</h2>
          <p className="text-muted-foreground">Fetching latest readings from your weather station</p>
        </div>
      </div>
    );
  }

  if (error && !weatherData) {
    return (
      <div className="min-h-screen bg-sky-gradient flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
            <h2 className="text-2xl font-semibold text-foreground">Weather Unavailable</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={fetchWeatherData} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!weatherData) return null;

  return (
    <div className="min-h-screen bg-sky-gradient">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Card className="bg-card-gradient border-0 shadow-weather">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-8 h-8 text-primary" />
                  <div>
                    <CardTitle className="text-3xl font-bold text-foreground">
                      {weatherData.neighborhood}
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Station: {weatherData.stationID} • {weatherData.country}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchWeatherData}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-weather-rotate' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Main Temperature Card */}
        <div className="mb-8">
          <Card className="bg-temperature-gradient border-0 shadow-weather text-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <Thermometer className="w-16 h-16 text-white/90" />
                  <div>
                    <div className="text-6xl font-bold">
                      {weatherData.imperial.temp}°F
                    </div>
                    <div className="text-xl text-white/80">
                      Feels like {weatherData.imperial.heatIndex}°F
                    </div>
                  </div>
                </div>
                <div className="text-right text-white/80">
                  <div className="text-sm">Last Updated</div>
                  <div className="text-lg font-semibold">
                    {formatTime(weatherData.obsTimeLocal)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weather Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <WeatherCard
            title="Humidity"
            value={weatherData.humidity}
            unit="%"
            icon={<Droplets className="w-6 h-6 text-weather-humidity" />}
            delay={100}
          />
          
          <WeatherCard
            title="Wind Speed"
            value={weatherData.imperial.windSpeed}
            unit="mph"
            icon={<Wind className="w-6 h-6 text-weather-wind" />}
            delay={200}
          />
          
          <WeatherCard
            title="Wind Direction"
            value={getWindDirection(weatherData.winddir)}
            unit={`${weatherData.winddir}°`}
            icon={<Wind className="w-6 h-6 text-weather-wind" style={{ transform: `rotate(${weatherData.winddir}deg)` }} />}
            delay={300}
          />
          
          <WeatherCard
            title="Pressure"
            value={weatherData.imperial.pressure}
            unit="inHg"
            icon={<Gauge className="w-6 h-6 text-weather-pressure" />}
            delay={400}
          />
          
          <WeatherCard
            title="UV Index"
            value={weatherData.uv}
            icon={<Sun className="w-6 h-6 text-weather-uv" />}
            delay={500}
          />
          
          <WeatherCard
            title="Solar Radiation"
            value={weatherData.solarRadiation}
            unit="W/m²"
            icon={<Sun className="w-6 h-6 text-weather-uv" />}
            delay={600}
          />
          
          <WeatherCard
            title="Dew Point"
            value={weatherData.imperial.dewpt}
            unit="°F"
            icon={<Droplets className="w-6 h-6 text-weather-humidity" />}
            delay={700}
          />
          
          <WeatherCard
            title="Visibility"
            value="10"
            unit="mi"
            icon={<Eye className="w-6 h-6 text-primary" />}
            delay={800}
          />
        </div>

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card-gradient border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wind className="w-5 h-5 text-weather-wind" />
                <span>Wind Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wind Gust</span>
                  <span className="font-semibold">{weatherData.imperial.windGust} mph</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wind Chill</span>
                  <span className="font-semibold">{weatherData.imperial.windChill}°F</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card-gradient border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Droplets className="w-5 h-5 text-weather-humidity" />
                <span>Precipitation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-semibold">{weatherData.imperial.precipRate} in/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">{weatherData.imperial.precipTotal} in</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-muted-foreground">
          <p className="text-sm">
            Data from personal weather station • Updated every 5 minutes
          </p>
          {lastUpdate && (
            <p className="text-xs mt-1">
              Last refresh: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};