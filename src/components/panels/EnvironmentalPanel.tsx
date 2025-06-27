import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { EnvironmentalEffectsService } from '../../services/EnvironmentalEffectsService';
import { EventManager } from '../../core/EventManager';
import { Cloud, Sun, CloudRain, Wind, Eye, Thermometer } from 'lucide-react';

const EnvironmentalPanel: React.FC = () => {
  const [conditions, setConditions] = useState<any[]>([]);
  const [effects, setEffects] = useState<any>({});
  const [weatherTypes, setWeatherTypes] = useState<string[]>([]);
  const [environmentalData, setEnvironmentalData] = useState<any>();

  useEffect(() => {
    const updateEnvironmentalData = (data: any) => {
      setEnvironmentalData(data);
    };

    EventManager.subscribe('environment.effects_updated', updateEnvironmentalData);
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  const getWeatherIcon = (weatherType: string) => {
    switch (weatherType.toLowerCase()) {
      case 'sunny': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'cloudy': return <Cloud className="w-4 h-4 text-gray-400" />;
      case 'rainy': return <CloudRain className="w-4 h-4 text-blue-500" />;
      case 'windy': return <Wind className="w-4 h-4 text-cyan-500" />;
      case 'foggy': return <Eye className="w-4 h-4 text-gray-500" />;
      default: return <Cloud className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEffectColor = (value: number) => {
    if (value > 1.1) return 'text-green-400';
    if (value < 0.9) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getCurrentWeather = () => {
    const weatherCondition = conditions.find(c => c.type === 'weather');
    return weatherCondition?.value || 'unknown';
  };

  const handleWeatherChange = (weatherType: string) => {
    EnvironmentalEffectsService.setWeather(weatherType);
  };

  return (
    <div className="space-y-3">
      {/* Current Weather */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            {getWeatherIcon(getCurrentWeather())}
            Current Weather
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Weather Type</span>
            <Badge variant="outline" className="text-blue-400 border-blue-400 capitalize">
              {getCurrentWeather()}
            </Badge>
          </div>
          
          {conditions.map((condition, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 capitalize">{condition.type}</span>
                <span className="text-white">{condition.value}</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress 
                  value={condition.intensity * 100} 
                  className="h-1 flex-1"
                />
                <span className="text-xs text-gray-500">{Math.round(condition.intensity * 100)}%</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Environmental Effects */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-orange-500" />
            Fishing Effects
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(effects).map(([effectName, value]: [string, any]) => (
            <div key={effectName} className="flex justify-between items-center">
              <span className="text-xs text-gray-300 capitalize">
                {effectName.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono ${getEffectColor(value)}`}>
                  {typeof value === 'number' ? (value * 100).toFixed(0) + '%' : value}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  value > 1.1 ? 'bg-green-500' : value < 0.9 ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Weather Control */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Weather Control</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-1">
            {weatherTypes.map((weather) => (
              <Button
                key={weather}
                onClick={() => handleWeatherChange(weather)}
                className={`h-7 text-xs ${
                  getCurrentWeather() === weather
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {getWeatherIcon(weather)}
                <span className="ml-1 capitalize">{weather}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Environmental Tips */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-3">
          <div className="text-xs space-y-1">
            <div className="text-white font-medium mb-1">Fishing Tips:</div>
            {effects.fishBiteRate > 1.2 && (
              <div className="text-green-400">• High fish activity - great time to fish!</div>
            )}
            {effects.fishBiteRate < 0.8 && (
              <div className="text-red-400">• Low fish activity - be patient</div>
            )}
            {effects.castAccuracy < 0.8 && (
              <div className="text-yellow-400">• Poor casting conditions - use shorter casts</div>
            )}
            {effects.lineVisibility < 0.6 && (
              <div className="text-blue-400">• Low visibility - fish may be less cautious</div>
            )}
            {effects.lureEffectiveness > 1.2 && (
              <div className="text-purple-400">• Lures are extra effective right now!</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnvironmentalPanel;
