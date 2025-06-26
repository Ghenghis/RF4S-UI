import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Settings, Play, Pause, Square, Monitor, Database, Zap, Target, Fish, Brain, Shield, Bell, Save, Upload, Download, RefreshCw } from 'lucide-react';

const RF4SCompactUI = () => {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({ 'detection': true });
  const [panels, setPanels] = useState({
    config: true,
    dashboard: true,
    monitoring: true,
    tools: true
  });

  // Comprehensive feature catalog organized by category
  const featureCategories = {
    'detection': {
      icon: Target,
      title: 'Detection & Recognition',
      color: 'from-blue-600 to-blue-800',
      features: {
        'spool_confidence': { name: 'Spool Confidence', type: 'slider', value: 0.98, min: 0.1, max: 1.0, step: 0.01 },
        'bite_sensitivity': { name: 'Bite Sensitivity', type: 'slider', value: 0.85, min: 0.1, max: 1.0, step: 0.01 },
        'ocr_threshold': { name: 'OCR Threshold', type: 'slider', value: 0.75, min: 0.1, max: 1.0, step: 0.01 },
        'template_matching': { name: 'Template Matching', type: 'dropdown', value: 'high', options: ['low', 'medium', 'high', 'ultra'] },
        'color_detection': { name: 'Color Detection', type: 'toggle', value: true },
        'region_scanning': { name: 'Region Scanning', type: 'toggle', value: true },
        'adaptive_threshold': { name: 'Adaptive Threshold', type: 'toggle', value: false },
        'multi_template': { name: 'Multi-Template Mode', type: 'toggle', value: true },
        'detection_timeout': { name: 'Detection Timeout', type: 'number', value: 5000, min: 1000, max: 30000 },
        'retry_attempts': { name: 'Retry Attempts', type: 'number', value: 3, min: 1, max: 10 }
      }
    },
    'fishing_profiles': {
      icon: Fish,
      title: 'Fishing Profiles',
      color: 'from-cyan-600 to-cyan-800',
      features: {
        'bottom_power': { name: 'Bottom Cast Power', type: 'slider', value: 8.0, min: 0.0, max: 10.0, step: 0.1 },
        'bottom_delay': { name: 'Bottom Cast Delay', type: 'slider', value: 8.0, min: 0.0, max: 60.0, step: 0.1 },
        'spin_power': { name: 'Spin Cast Power', type: 'slider', value: 5.0, min: 0.0, max: 10.0, step: 0.1 },
        'spin_retrieve': { name: 'Spin Retrieve Speed', type: 'slider', value: 2.5, min: 0.0, max: 10.0, step: 0.1 },
        'float_sensitivity': { name: 'Float Sensitivity', type: 'slider', value: 0.8, min: 0.0, max: 1.0, step: 0.01 },
        'pirk_duration': { name: 'Pirk Duration', type: 'slider', value: 15.0, min: 1.0, max: 60.0, step: 0.1 },
        'elevator_lift': { name: 'Elevator Lift Time', type: 'slider', value: 2.0, min: 0.1, max: 10.0, step: 0.1 },
        'telescopic_depth': { name: 'Telescopic Depth', type: 'slider', value: 3.0, min: 0.5, max: 20.0, step: 0.1 },
        'profile_mode': { name: 'Active Profile', type: 'dropdown', value: 'bottom', options: ['bottom', 'spin', 'float', 'pirk', 'elevator', 'telescopic'] },
        'auto_switch': { name: 'Auto Profile Switch', type: 'toggle', value: false }
      }
    },
    'automation': {
      icon: Zap,
      title: 'Automation & AI',
      color: 'from-purple-600 to-purple-800',
      features: {
        'smart_casting': { name: 'Smart Casting', type: 'toggle', value: true },
        'adaptive_timing': { name: 'Adaptive Timing', type: 'toggle', value: true },
        'pattern_learning': { name: 'Pattern Learning', type: 'toggle', value: false },
        'behavior_randomization': { name: 'Behavior Randomization', type: 'slider', value: 0.25, min: 0.0, max: 1.0, step: 0.01 },
        'efficiency_mode': { name: 'Efficiency Mode', type: 'dropdown', value: 'balanced', options: ['conservative', 'balanced', 'aggressive', 'custom'] },
        'auto_repair': { name: 'Auto Repair Equipment', type: 'toggle', value: true },
        'auto_restock': { name: 'Auto Restock Bait', type: 'toggle', value: true },
        'smart_location': { name: 'Smart Location Switch', type: 'toggle', value: false },
        'weather_adaptation': { name: 'Weather Adaptation', type: 'toggle', value: false },
        'ai_decision_delay': { name: 'AI Decision Delay', type: 'slider', value: 1.5, min: 0.1, max: 5.0, step: 0.1 }
      }
    },
    'stealth': {
      icon: Shield,
      title: 'Stealth & Anti-Detection',
      color: 'from-slate-600 to-slate-800',
      features: {
        'stealth_mode': { name: 'Stealth Mode', type: 'toggle', value: true },
        'human_simulation': { name: 'Human Simulation', type: 'slider', value: 0.8, min: 0.0, max: 1.0, step: 0.01 },
        'input_randomization': { name: 'Input Randomization', type: 'slider', value: 0.3, min: 0.0, max: 1.0, step: 0.01 },
        'memory_protection': { name: 'Memory Protection', type: 'toggle', value: true },
        'process_hiding': { name: 'Process Hiding', type: 'toggle', value: false },
        'traffic_obfuscation': { name: 'Traffic Obfuscation', type: 'toggle', value: true },
        'detection_evasion': { name: 'Detection Evasion', type: 'dropdown', value: 'medium', options: ['off', 'low', 'medium', 'high', 'maximum'] },
        'behavioral_mimicry': { name: 'Behavioral Mimicry', type: 'toggle', value: true },
        'timing_variance': { name: 'Timing Variance', type: 'slider', value: 0.15, min: 0.0, max: 0.5, step: 0.01 },
        'stealth_interval': { name: 'Stealth Check Interval', type: 'number', value: 30, min: 10, max: 300 }
      }
    },
    'notifications': {
      icon: Bell,
      title: 'Notifications & Alerts',
      color: 'from-orange-600 to-orange-800',
      features: {
        'discord_webhooks': { name: 'Discord Webhooks', type: 'toggle', value: false },
        'email_notifications': { name: 'Email Notifications', type: 'toggle', value: false },
        'sound_alerts': { name: 'Sound Alerts', type: 'toggle', value: true },
        'popup_notifications': { name: 'Popup Notifications', type: 'toggle', value: true },
        'catch_notifications': { name: 'Catch Notifications', type: 'toggle', value: true },
        'error_notifications': { name: 'Error Notifications', type: 'toggle', value: true },
        'session_reports': { name: 'Session Reports', type: 'toggle', value: false },
        'performance_alerts': { name: 'Performance Alerts', type: 'toggle', value: true },
        'notification_cooldown': { name: 'Notification Cooldown', type: 'number', value: 30, min: 0, max: 300 },
        'alert_priority': { name: 'Alert Priority', type: 'dropdown', value: 'medium', options: ['low', 'medium', 'high', 'critical'] }
      }
    },
    'performance': {
      icon: Monitor,
      title: 'Performance & Optimization',
      color: 'from-green-600 to-green-800',
      features: {
        'cpu_limit': { name: 'CPU Usage Limit', type: 'slider', value: 0.8, min: 0.1, max: 1.0, step: 0.01 },
        'memory_limit': { name: 'Memory Limit (MB)', type: 'number', value: 512, min: 128, max: 2048 },
        'cache_size': { name: 'Cache Size (MB)', type: 'number', value: 256, min: 64, max: 1024 },
        'optimization_level': { name: 'Optimization Level', type: 'dropdown', value: 'balanced', options: ['battery', 'balanced', 'performance', 'maximum'] },
        'threading_mode': { name: 'Threading Mode', type: 'dropdown', value: 'auto', options: ['single', 'multi', 'auto'] },
        'gpu_acceleration': { name: 'GPU Acceleration', type: 'toggle', value: false },
        'background_processing': { name: 'Background Processing', type: 'toggle', value: true },
        'resource_monitoring': { name: 'Resource Monitoring', type: 'toggle', value: true },
        'auto_cleanup': { name: 'Auto Cleanup', type: 'toggle', value: true },
        'performance_logging': { name: 'Performance Logging', type: 'toggle', value: false }
      }
    }
  };

  const [featureValues, setFeatureValues] = useState(() => {
    const initialValues = {};
    Object.keys(featureCategories).forEach(category => {
      Object.keys(featureCategories[category].features).forEach(feature => {
        initialValues[feature] = featureCategories[category].features[feature].value;
      });
    });
    return initialValues;
  });

  const [dashboardData, setDashboardData] = useState({
    sessionTime: '00:45:23',
    fishCaught: 47,
    totalCasts: 152,
    successRate: 31,
    fishPerHour: 63,
    currentAction: 'Retrieving',
    botStatus: 'Running',
    gameStatus: 'Connected',
    cpuUsage: 23,
    memoryUsage: 412,
    efficiency: 89
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDashboardData(prev => ({
        ...prev,
        fishCaught: prev.fishCaught + Math.random() > 0.95 ? 1 : 0,
        totalCasts: prev.totalCasts + Math.random() > 0.9 ? 1 : 0,
        cpuUsage: Math.max(15, Math.min(35, prev.cpuUsage + (Math.random() - 0.5) * 4)),
        memoryUsage: Math.max(380, Math.min(450, prev.memoryUsage + (Math.random() - 0.5) * 10)),
        efficiency: Math.max(80, Math.min(95, prev.efficiency + (Math.random() - 0.5) * 2))
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const selectFeature = (category, featureKey) => {
    setSelectedFeature({ category, featureKey });
  };

  const updateFeatureValue = (featureKey, value) => {
    setFeatureValues(prev => ({
      ...prev,
      [featureKey]: value
    }));
  };

  const renderFeatureControl = (feature, featureKey) => {
    const value = featureValues[featureKey];
    
    switch (feature.type) {
      case 'slider':
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{feature.name}</span>
              <span className="font-mono text-blue-400">{value}</span>
            </div>
            <input
              type="range"
              min={feature.min}
              max={feature.max}
              step={feature.step}
              value={value}
              onChange={(e) => updateFeatureValue(featureKey, parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        );
      
      case 'dropdown':
        return (
          <div className="space-y-2">
            <label className="text-sm">{feature.name}</label>
            <select
              value={value}
              onChange={(e) => updateFeatureValue(featureKey, e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm focus:border-blue-500 focus:outline-none"
            >
              {feature.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      
      case 'toggle':
        return (
          <div className="flex items-center justify-between">
            <span className="text-sm">{feature.name}</span>
            <button
              onClick={() => updateFeatureValue(featureKey, !value)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                value ? 'bg-blue-600' : 'bg-slate-600'
              }`}
            >
              <div className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform duration-200 ${
                value ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        );
      
      case 'number':
        return (
          <div className="space-y-2">
            <label className="text-sm">{feature.name}</label>
            <input
              type="number"
              min={feature.min}
              max={feature.max}
              value={value}
              onChange={(e) => updateFeatureValue(featureKey, parseInt(e.target.value))}
              className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 border-b border-slate-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Fish className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold">RF4S Advanced Control Studio</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-green-600 rounded-full text-xs font-semibold">CONNECTED</div>
            <button className="p-2 hover:bg-slate-600 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Configuration Panel */}
        {panels.config && (
          <div className="w-80 bg-slate-800 border-r border-slate-600 flex flex-col">
            <div className="p-4 border-b border-slate-600">
              <h2 className="text-lg font-semibold mb-3">Configuration</h2>
              <div className="space-y-1">
                {Object.entries(featureCategories).map(([categoryKey, category]) => {
                  const IconComponent = category.icon;
                  const isExpanded = expandedCategories[categoryKey];
                  
                  return (
                    <div key={categoryKey}>
                      <button
                        onClick={() => toggleCategory(categoryKey)}
                        className="w-full flex items-center justify-between p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`p-1.5 rounded-lg bg-gradient-to-r ${category.color}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">{category.title}</span>
                        </div>
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      
                      {isExpanded && (
                        <div className="ml-6 mt-1 space-y-1">
                          {Object.entries(category.features).map(([featureKey, feature]) => (
                            <button
                              key={featureKey}
                              onClick={() => selectFeature(categoryKey, featureKey)}
                              className={`w-full text-left p-2 text-sm rounded transition-colors ${
                                selectedFeature?.featureKey === featureKey
                                  ? 'bg-blue-600 text-white'
                                  : 'hover:bg-slate-700 text-slate-300'
                              }`}
                            >
                              {feature.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Feature Configuration */}
            {selectedFeature && (
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  <h3 className="font-semibold text-blue-400">
                    {featureCategories[selectedFeature.category].features[selectedFeature.featureKey].name}
                  </h3>
                  {renderFeatureControl(
                    featureCategories[selectedFeature.category].features[selectedFeature.featureKey],
                    selectedFeature.featureKey
                  )}
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="p-4 border-t border-slate-600">
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                  <Save className="w-4 h-4" />
                  <span className="text-sm">Save</span>
                </button>
                <button className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Load</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Panel */}
        {panels.dashboard && (
          <div className="flex-1 bg-slate-900 flex flex-col">
            {/* Control Bar */}
            <div className="p-4 bg-slate-800 border-b border-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                    <Play className="w-4 h-4" />
                    <span>Start</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                    <Square className="w-4 h-4" />
                    <span>Stop</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors">
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{dashboardData.fishCaught}</div>
                    <div className="text-xs text-slate-400">Fish Caught</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">{dashboardData.totalCasts}</div>
                    <div className="text-xs text-slate-400">Total Casts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{dashboardData.successRate}%</div>
                    <div className="text-xs text-slate-400">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{dashboardData.sessionTime}</div>
                    <div className="text-xs text-slate-400">Session Time</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Cards */}
            <div className="p-4 grid grid-cols-4 gap-4">
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Bot Status</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-lg font-semibold">{dashboardData.botStatus}</div>
                <div className="text-sm text-slate-400">{dashboardData.currentAction}</div>
              </div>
              
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Game Status</span>
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
                <div className="text-lg font-semibold">{dashboardData.gameStatus}</div>
                <div className="text-sm text-slate-400">RF4 Process: Active</div>
              </div>
              
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Performance</span>
                  <Monitor className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-lg font-semibold">{dashboardData.cpuUsage}% CPU</div>
                <div className="text-sm text-slate-400">{dashboardData.memoryUsage}MB RAM</div>
              </div>
              
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Efficiency</span>
                  <Zap className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-lg font-semibold">{dashboardData.efficiency}%</div>
                <div className="text-sm text-slate-400">{dashboardData.fishPerHour}/hour</div>
              </div>
            </div>

            {/* Activity Log */}
            <div className="flex-1 m-4 bg-slate-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Activity Log</h3>
              <div className="space-y-2 text-sm font-mono">
                <div className="text-green-400">[14:23:45] Fish caught: Mackerel (0.8kg)</div>
                <div className="text-blue-400">[14:23:42] Cast successful - retrieving</div>
                <div className="text-yellow-400">[14:23:38] Energy threshold reached - consuming tea</div>
                <div className="text-cyan-400">[14:23:35] Switching to Spin profile</div>
                <div className="text-green-400">[14:23:30] Fish caught: Herring (0.6kg)</div>
                <div className="text-blue-400">[14:23:25] Cast successful - waiting for bite</div>
                <div className="text-slate-400">[14:23:20] Monitoring detection regions</div>
                <div className="text-purple-400">[14:23:15] AI decision: Continue current strategy</div>
              </div>
            </div>
          </div>
        )}

        {/* Monitoring & Tools Panel */}
        {panels.monitoring && (
          <div className="w-80 bg-slate-800 border-l border-slate-600 flex flex-col">
            <div className="p-4 border-b border-slate-600">
              <h2 className="text-lg font-semibold mb-4">System Monitoring</h2>
              
              {/* Performance Meters */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CPU Usage</span>
                    <span>{dashboardData.cpuUsage}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${dashboardData.cpuUsage}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Memory Usage</span>
                    <span>{dashboardData.memoryUsage}MB</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(dashboardData.memoryUsage / 512) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Efficiency</span>
                    <span>{dashboardData.efficiency}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${dashboardData.efficiency}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Tools */}
            <div className="p-4 border-b border-slate-600">
              <h3 className="text-sm font-semibold mb-3">Quick Tools</h3>
              <div className="grid grid-cols-2 gap-2">
                <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs transition-colors">
                  Test Detection
                </button>
                <button className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs transition-colors">
                  Full Scan
                </button>
                <button className="p-2 bg-green-600 hover:bg-green-700 rounded-lg text-xs transition-colors">
                  Calibrate
                </button>
                <button className="p-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-xs transition-colors">
                  Export Log
                </button>
              </div>
            </div>
            
            {/* Detection Status */}
            <div className="flex-1 p-4">
              <h3 className="text-sm font-semibold mb-3">Detection Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Game Window</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">OCR Engine</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Template Match</span>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Stealth Engine</span>
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e293b;
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e293b;
        }
      `}</style>
    </div>
  );
};

export default RF4SCompactUI;