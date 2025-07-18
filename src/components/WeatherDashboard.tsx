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
  AlertCircle,
  Settings,
  Calendar
} from 'lucide-react';
import { WeatherCard } from './WeatherCard';
import { WeatherHistory } from './WeatherHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { WeatherConfigData } from './WeatherConfig';

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
  metric: {
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

interface WeatherDashboardProps {
  config: WeatherConfigData;
  onSettingsClick: () => void;
}

export const WeatherDashboard = ({ config, onSettingsClick }: WeatherDashboardProps) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();

  const buildApiUrl = () => {
    const baseUrl = "https://api.weather.com/v2/pws/observations/current";
    const params = new URLSearchParams({
      apiKey: config.apiKey,
      format: 'json',
      stationId: config.stationId,
      units: 'm' // metric units
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = buildApiUrl();
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your configuration.');
        } else if (response.status === 404) {
          throw new Error('Weather station not found. Please check your station ID.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
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
        throw new Error('No weather data available for this station');
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
  }, [config.apiKey, config.stationId]);

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

  const formatTemperature = (temp: number) => {
    return Math.round(temp);
  };

  const formatPressure = (pressure: number) => {
    return Math.round(pressure);
  };

  const formatWindSpeed = (speed: number) => {
    return Math.round(speed);
  };

  const formatPrecipitation = (precip: number) => {
    return precip.toFixed(1);
  };

  if (loading && !weatherData) {
    return (
      <div className="min-h-screen bg-sky-gradient flex items-center justify-center p-4">
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
      <div className="min-h-screen bg-sky-gradient flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card-gradient border-0 shadow-weather">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
            <h2 className="text-2xl font-semibold text-foreground">Weather Unavailable</h2>
            <p className="text-muted-foreground text-sm">{error}</p>
            <div className="space-y-3">
              <Button onClick={fetchWeatherData} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={onSettingsClick} variant="outline" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Check Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!weatherData) return null;

  // Show history component if requested
  if (showHistory) {
    return (
      <WeatherHistory
        config={config}
        onBackClick={() => setShowHistory(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-sky-gradient">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Card className="bg-card-gradient border-0 shadow-weather">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  <div>
                    <CardTitle className="text-xl md:text-3xl font-bold text-foreground">
                      {weatherData.neighborhood}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {weatherData.stationID} • {weatherData.country}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchWeatherData}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-weather-rotate' : ''}`} />
                    <span className="hidden sm:inline ml-2">Refresh</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowHistory(true)}
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">History</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onSettingsClick}
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">Settings</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Main Temperature Card */}
        <div className="mb-6">
          <Card className="bg-temperature-gradient border-0 shadow-weather text-white">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 md:space-x-6">
                  <Thermometer className="w-12 h-12 md:w-16 md:h-16 text-white/90" />
                  <div>
                    <div className="text-4xl md:text-6xl font-bold">
                      {formatTemperature(weatherData.metric.temp)}°C
                    </div>
                    <div className="text-lg md:text-xl text-white/80">
                      Feels like {formatTemperature(weatherData.metric.heatIndex)}°C
                    </div>
                  </div>
                </div>
                <div className="text-right text-white/80">
                  <div className="text-xs md:text-sm">Last Updated</div>
                  <div className="text-sm md:text-lg font-semibold">
                    {formatTime(weatherData.obsTimeLocal)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weather Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <WeatherCard
            title="Humidity"
            value={weatherData.humidity}
            unit="%"
            icon={<Droplets className="w-5 h-5 md:w-6 md:h-6 text-weather-humidity" />}
            delay={100}
          />
          
          <WeatherCard
            title="Wind Speed"
            value={formatWindSpeed(weatherData.metric.windSpeed)}
            unit="km/h"
            icon={<Wind className="w-5 h-5 md:w-6 md:h-6 text-weather-wind" />}
            delay={200}
          />
          
          <WeatherCard
            title="Wind Direction"
            value={getWindDirection(weatherData.winddir)}
            unit={`${weatherData.winddir}°`}
            icon={<Wind className="w-5 h-5 md:w-6 md:h-6 text-weather-wind" style={{ transform: `rotate(${weatherData.winddir}deg)` }} />}
            delay={300}
          />
          
          <WeatherCard
            title="Pressure"
            value={formatPressure(weatherData.metric.pressure)}
            unit="hPa"
            icon={<Gauge className="w-5 h-5 md:w-6 md:h-6 text-weather-pressure" />}
            delay={400}
          />
          
          <WeatherCard
            title="UV Index"
            value={weatherData.uv}
            icon={<Sun className="w-5 h-5 md:w-6 md:h-6 text-weather-uv" />}
            delay={500}
          />
          
          <WeatherCard
            title="Solar Radiation"
            value={Math.round(weatherData.solarRadiation)}
            unit="W/m²"
            icon={<Sun className="w-5 h-5 md:w-6 md:h-6 text-weather-uv" />}
            delay={600}
          />
          
          <WeatherCard
            title="Dew Point"
            value={formatTemperature(weatherData.metric.dewpt)}
            unit="°C"
            icon={<Droplets className="w-5 h-5 md:w-6 md:h-6 text-weather-humidity" />}
            delay={700}
          />
          
          <WeatherCard
            title="Visibility"
            value="16"
            unit="km"
            icon={<Eye className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
            delay={800}
          />
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-card-gradient border-0 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <Wind className="w-4 h-4 text-weather-wind" />
                <span>Wind Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Wind Gust</span>
                  <span className="text-sm font-semibold">{formatWindSpeed(weatherData.metric.windGust)} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Wind Chill</span>
                  <span className="text-sm font-semibold">{formatTemperature(weatherData.metric.windChill)}°C</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card-gradient border-0 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <Droplets className="w-4 h-4 text-weather-humidity" />
                <span>Precipitation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Rate</span>
                  <span className="text-sm font-semibold">{formatPrecipitation(weatherData.metric.precipRate)} mm/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-sm font-semibold">{formatPrecipitation(weatherData.metric.precipTotal)} mm</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-muted-foreground">
          <p className="text-xs md:text-sm">
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