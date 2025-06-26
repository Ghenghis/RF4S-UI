
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { useRF4SStore } from '../../stores/rf4sStore';
import { Bot, Eye, Zap, CheckCircle, AlertCircle, Play, Pause, RotateCcw } from 'lucide-react';

interface TuningStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  config: string;
}

const AITuningPanel: React.FC = () => {
  const { config, updateConfig } = useRF4SStore();
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tuningSteps, setTuningSteps] = useState<TuningStep[]>([
    {
      id: 'spool-detection',
      name: 'Spool Detection',
      description: 'Fine-tuning spool detection confidence using OCR analysis',
      status: 'pending',
      progress: 0,
      config: 'detection.spoolConfidence'
    },
    {
      id: 'fish-bite',
      name: 'Fish Bite Detection',
      description: 'Optimizing fish bite sensitivity based on visual patterns',
      status: 'pending',
      progress: 0,
      config: 'detection.fishBite'
    },
    {
      id: 'rod-tip',
      name: 'Rod Tip Movement',
      description: 'Calibrating rod tip movement detection thresholds',
      status: 'pending',
      progress: 0,
      config: 'detection.rodTip'
    },
    {
      id: 'timing-optimization',
      name: 'Timing Optimization',
      description: 'AI-powered optimization of cast delays and hook timing',
      status: 'pending',
      progress: 0,
      config: 'automation.bottomHookDelay'
    },
    {
      id: 'automation-tuning',
      name: 'Automation Settings',
      description: 'Fine-tuning automation parameters for optimal performance',
      status: 'pending',
      progress: 0,
      config: 'automation.spinRetrieveSpeed'
    }
  ]);

  const startTuning = async () => {
    setIsRunning(true);
    
    for (let i = 0; i < tuningSteps.length; i++) {
      setCurrentStep(i);
      
      // Update step status to running
      setTuningSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: 'running', progress: 0 } : step
      ));

      // Simulate AI tuning process
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        setTuningSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, progress } : step
        ));
      }

      // Apply optimized settings
      const optimizedValue = await simulateAIOptimization(tuningSteps[i]);
      applyOptimizedSetting(tuningSteps[i].config, optimizedValue);

      // Mark step as completed
      setTuningSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: 'completed', progress: 100 } : step
      ));
    }

    setIsRunning(false);
  };

  const simulateAIOptimization = async (step: TuningStep): Promise<number> => {
    // Simulate AI analysis and optimization
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return optimized values based on step type
    switch (step.id) {
      case 'spool-detection':
        return 0.95 + Math.random() * 0.04; // 0.95-0.99
      case 'fish-bite':
        return 0.80 + Math.random() * 0.1; // 0.80-0.90
      case 'rod-tip':
        return 0.65 + Math.random() * 0.1; // 0.65-0.75
      case 'timing-optimization':
        return 0.3 + Math.random() * 0.4; // 0.3-0.7
      case 'automation-tuning':
        return 45 + Math.random() * 20; // 45-65
      default:
        return 0.8;
    }
  };

  const applyOptimizedSetting = (configPath: string, value: number) => {
    const [section, key] = configPath.split('.');
    updateConfig(section as any, { [key]: value });
  };

  const resetTuning = () => {
    setTuningSteps(prev => prev.map(step => ({
      ...step,
      status: 'pending',
      progress: 0
    })));
    setCurrentStep(0);
    setIsRunning(false);
  };

  const pauseTuning = () => {
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Bot className="h-4 w-4 text-blue-400 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Eye className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-blue-600">Running</Badge>;
      case 'completed':
        return <Badge className="bg-green-600">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-600">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const overallProgress = (tuningSteps.reduce((acc, step) => acc + step.progress, 0) / tuningSteps.length);

  return (
    <div className="h-full bg-gray-900 text-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            AI Fine Tuning
          </h2>
          <p className="text-sm text-gray-400">Optimize your RF4S settings using AI-powered analysis</p>
        </div>
        
        <div className="flex space-x-2">
          {!isRunning ? (
            <Button onClick={startTuning} className="bg-blue-600 hover:bg-blue-700">
              <Play className="h-4 w-4 mr-1" />
              Start Tuning
            </Button>
          ) : (
            <Button onClick={pauseTuning} variant="outline">
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          )}
          
          <Button onClick={resetTuning} variant="outline">
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Overall Progress */}
      <Card className="p-4 mb-4 bg-gray-800 border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Overall Progress</span>
          <span className="text-sm text-gray-400">{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </Card>

      {/* Tuning Steps */}
      <div className="space-y-3">
        {tuningSteps.map((step, index) => (
          <Card key={step.id} className={`p-4 bg-gray-800 border-gray-700 ${index === currentStep && isRunning ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(step.status)}
                <span className="font-medium">{step.name}</span>
                {getStatusBadge(step.status)}
              </div>
              <span className="text-sm text-gray-400">{step.progress}%</span>
            </div>
            
            <p className="text-sm text-gray-400 mb-2">{step.description}</p>
            
            <div className="flex items-center space-x-2">
              <Progress value={step.progress} className="flex-1 h-1" />
              <span className="text-xs text-gray-500">{step.config}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Current Settings Preview */}
      <Card className="mt-4 p-4 bg-gray-800 border-gray-700">
        <h3 className="font-medium mb-3">Current Optimized Settings</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Spool Confidence:</span>
            <span className="ml-2 text-white">{config.detection.spoolConfidence.toFixed(3)}</span>
          </div>
          <div>
            <span className="text-gray-400">Fish Bite:</span>
            <span className="ml-2 text-white">{config.detection.fishBite.toFixed(3)}</span>
          </div>
          <div>
            <span className="text-gray-400">Rod Tip:</span>
            <span className="ml-2 text-white">{config.detection.rodTip.toFixed(3)}</span>
          </div>
          <div>
            <span className="text-gray-400">Hook Delay:</span>
            <span className="ml-2 text-white">{config.automation.bottomHookDelay.toFixed(1)}s</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AITuningPanel;
