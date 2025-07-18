import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WeatherCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  className?: string;
  delay?: number;
}

export const WeatherCard = ({ 
  title, 
  value, 
  unit, 
  icon, 
  className,
  delay = 0
}: WeatherCardProps) => {
  return (
    <Card 
      className={cn(
        "group hover:shadow-weather transition-all duration-300 border-0",
        "bg-card-gradient backdrop-blur-sm border border-border/50",
        "animate-weather-fade-in hover:scale-105",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            {icon}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">
              {value}
              {unit && <span className="text-lg text-muted-foreground ml-1">{unit}</span>}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              {title}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};