import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Save, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface WeatherConfigData {
  apiKey: string;
  stationId: string;
  rememberMe: boolean;
}

interface WeatherConfigProps {
  onConfigSave: (config: WeatherConfigData) => void;
  initialConfig?: WeatherConfigData;
}

export const WeatherConfig = ({ onConfigSave, initialConfig }: WeatherConfigProps) => {
  const [config, setConfig] = useState<WeatherConfigData>({
    apiKey: initialConfig?.apiKey || '',
    stationId: initialConfig?.stationId || '',
    rememberMe: initialConfig?.rememberMe || false
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    if (!config.apiKey.trim()) {
      toast({
        title: "Missing API Key",
        description: "Please enter your Weather.com API key",
        variant: "destructive"
      });
      return;
    }

    if (!config.stationId.trim()) {
      toast({
        title: "Missing Station ID",
        description: "Please enter your weather station ID",
        variant: "destructive"
      });
      return;
    }

    // Save to localStorage if remember me is checked
    if (config.rememberMe) {
      localStorage.setItem('weatherConfig', JSON.stringify(config));
    } else {
      localStorage.removeItem('weatherConfig');
    }

    onConfigSave(config);
    
    toast({
      title: "Configuration Saved",
      description: "Your weather station settings have been saved successfully",
      duration: 3000
    });
  };

  const handleConfigChange = (key: keyof WeatherConfigData, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen bg-sky-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card-gradient border-0 shadow-weather">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Settings className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Weather Station Setup
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Configure your personal weather station
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="stationId" className="text-sm font-medium">
              Station ID
            </Label>
            <Input
              id="stationId"
              type="text"
              placeholder="e.g., IBORLN23"
              value={config.stationId}
              onChange={(e) => handleConfigChange('stationId', e.target.value)}
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">
              Your personal weather station identifier
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-sm font-medium">
              API Key
            </Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                placeholder="Enter your Weather.com API key"
                value={config.apiKey}
                onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                className="h-12 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your Weather.com API key for data access
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="rememberMe" className="text-sm font-medium">
                Remember Me
              </Label>
              <p className="text-xs text-muted-foreground">
                Save settings for future visits
              </p>
            </div>
            <Switch
              id="rememberMe"
              checked={config.rememberMe}
              onCheckedChange={(checked) => handleConfigChange('rememberMe', checked)}
            />
          </div>

          <Button 
            onClick={handleSave}
            className="w-full h-12 text-base font-medium"
            size="lg"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>

          <div className="text-center pt-4 space-y-2">
            <p className="text-xs text-muted-foreground">
              Data will be displayed in metric units (°C, km/h, etc.)
            </p>
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally and never shared
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};