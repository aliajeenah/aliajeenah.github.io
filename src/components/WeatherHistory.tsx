import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  RefreshCw, 
  AlertCircle,
  Calendar,
  ThermometerSun,
  Droplets,
  Wind,
  Gauge,
  Sun,
  CloudRain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { WeatherConfigData } from './WeatherConfig';

interface DailySummary {
  stationID: string;
  tz: string;
  obsTimeUtc: string;
  obsTimeLocal: string;
  epoch: number;
  lat: number;
  lon: number;
  solarRadiationHigh: number;
  uvHigh: number;
  winddirAvg: number;
  humidityHigh: number;
  humidityLow: number;
  humidityAvg: number;
  qcStatus: number;
  metric: {
    tempHigh: number;
    tempLow: number;
    tempAvg: number;
    windspeedHigh: number;
    windspeedLow: number;
    windspeedAvg: number;
    windgustHigh: number;
    windgustLow: number;
    windgustAvg: number;
    dewptHigh: number;
    dewptLow: number;
    dewptAvg: number;
    windchillHigh: number;
    windchillLow: number;
    windchillAvg: number;
    heatindexHigh: number;
    heatindexLow: number;
    heatindexAvg: number;
    pressureMax: number;
    pressureMin: number;
    pressureTrend: number;
    precipRate: number;
    precipTotal: number;
  };
}

interface HistoryResponse {
  summaries: DailySummary[];
}

interface WeatherHistoryProps {
  config: WeatherConfigData;
  onBackClick: () => void;
}

export const WeatherHistory = ({ config, onBackClick }: WeatherHistoryProps) => {
  const [historyData, setHistoryData] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const buildHistoryApiUrl = () => {
    const baseUrl = "https://api.weather.com/v2/pws/dailysummary/7day";
    const params = new URLSearchParams({
      apiKey: config.apiKey,
      format: 'json',
      stationId: config.stationId,
      units: 'm'
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = buildHistoryApiUrl();
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
      
      const data: HistoryResponse = await response.json();
      
      if (data.summaries && data.summaries.length > 0) {
        setHistoryData(data.summaries.reverse()); // Show most recent first
        toast({
          title: "History Updated",
          description: "Weather history loaded successfully",
          duration: 3000,
        });
      } else {
        throw new Error('No historical data available for this station');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather history';
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
    fetchHistoryData();
  }, [config.apiKey, config.stationId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTemp = (temp: number) => Math.round(temp);
  const formatPressure = (pressure: number) => Math.round(pressure);
  const formatWind = (speed: number) => Math.round(speed);
  const formatPrecip = (precip: number) => precip.toFixed(1);

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-gradient flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 text-primary animate-weather-rotate mx-auto" />
          <h2 className="text-2xl font-semibold text-foreground">Loading Weather History...</h2>
          <p className="text-muted-foreground">Fetching 7-day summary data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-sky-gradient flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card-gradient border-0 shadow-weather">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
            <h2 className="text-2xl font-semibold text-foreground">History Unavailable</h2>
            <p className="text-muted-foreground text-sm">{error}</p>
            <div className="space-y-3">
              <Button onClick={fetchHistoryData} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={onBackClick} variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
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
                  <Calendar className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  <div>
                    <CardTitle className="text-xl md:text-3xl font-bold text-foreground">
                      Weather History
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      7-day summary • {config.stationId}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchHistoryData}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-weather-rotate' : ''}`} />
                    <span className="hidden sm:inline ml-2">Refresh</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onBackClick}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">Back</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* History Cards */}
        <div className="space-y-4">
          {historyData.map((day, index) => (
            <Card key={day.epoch} className="bg-card-gradient border-0 shadow-weather">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        {formatDate(day.obsTimeLocal)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {index === 0 ? 'Today' : index === 1 ? 'Yesterday' : `${index} days ago`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <ThermometerSun className="w-4 h-4 text-weather-temp" />
                      <span className="text-lg font-bold text-foreground">
                        {formatTemp(day.metric.tempHigh)}°C
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Low: {formatTemp(day.metric.tempLow)}°C
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Droplets className="w-4 h-4 text-weather-humidity" />
                      <span className="text-sm font-medium">Humidity</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {day.humidityHigh}% / {day.humidityLow}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avg: {day.humidityAvg}%
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Wind className="w-4 h-4 text-weather-wind" />
                      <span className="text-sm font-medium">Wind</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatWind(day.metric.windspeedHigh)} km/h
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getWindDirection(day.winddirAvg)} • Avg: {formatWind(day.metric.windspeedAvg)} km/h
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Gauge className="w-4 h-4 text-weather-pressure" />
                      <span className="text-sm font-medium">Pressure</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatPressure(day.metric.pressureMax)} hPa
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Min: {formatPressure(day.metric.pressureMin)} hPa
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <CloudRain className="w-4 h-4 text-weather-humidity" />
                      <span className="text-sm font-medium">Precipitation</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatPrecip(day.metric.precipTotal)} mm
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Rate: {formatPrecip(day.metric.precipRate)} mm/hr
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border/20">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">UV Index:</span>
                      <span className="font-medium">{day.uvHigh}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Solar Radiation:</span>
                      <span className="font-medium">{Math.round(day.solarRadiationHigh)} W/m²</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Wind Gust:</span>
                      <span className="font-medium">{formatWind(day.metric.windgustHigh)} km/h</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-muted-foreground">
          <p className="text-xs md:text-sm">
            Historical data from personal weather station • Daily summaries
          </p>
        </div>
      </div>
    </div>
  );
};