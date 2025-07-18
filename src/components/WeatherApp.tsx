import { useState, useEffect } from 'react';
import { WeatherDashboard } from './WeatherDashboard';
import { WeatherConfig, WeatherConfigData } from './WeatherConfig';

export const WeatherApp = () => {
  const [config, setConfig] = useState<WeatherConfigData | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved configuration on startup
  useEffect(() => {
    const savedConfig = localStorage.getItem('weatherConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        setShowConfig(false);
      } catch (error) {
        console.error('Failed to parse saved config:', error);
        localStorage.removeItem('weatherConfig');
        setShowConfig(true);
      }
    } else {
      setShowConfig(true);
    }
    setIsLoading(false);
  }, []);

  const handleConfigSave = (newConfig: WeatherConfigData) => {
    setConfig(newConfig);
    setShowConfig(false);
  };

  const handleSettingsClick = () => {
    setShowConfig(true);
  };

  // Show loading state while checking for saved config
  if (isLoading) {
    return (
      <div className="min-h-screen bg-sky-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-2xl font-semibold text-foreground">Loading...</h2>
        </div>
      </div>
    );
  }

  // Show configuration if no config exists or user requested settings
  if (showConfig || !config) {
    return (
      <WeatherConfig
        onConfigSave={handleConfigSave}
        initialConfig={config || undefined}
      />
    );
  }

  // Show weather dashboard with saved config
  return (
    <WeatherDashboard
      config={config}
      onSettingsClick={handleSettingsClick}
    />
  );
};