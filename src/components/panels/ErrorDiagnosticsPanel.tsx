
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import CustomSlider from '../ui/CustomSlider';
import ToggleSwitch from '../ui/ToggleSwitch';
import { useRF4SStore } from '../../stores/rf4sStore';
import { useGlobalStore } from '../../store/GlobalStore';
import { RealtimeDataService } from '../../services/RealtimeDataService';
import { AlertTriangle, Bug, FileText, Trash2, Download, RefreshCw } from 'lucide-react';

const ErrorDiagnosticsPanel: React.FC = () => {
  const { config, updateConfig } = useRF4SStore();
  const { lastError, errorCount } = useGlobalStore();
  const rf4sStatus = RealtimeDataService.getRF4SStatus();

  const handleDiagnosticsToggle = (setting: string, enabled: boolean) => {
    updateConfig('system', {
      ...config.system,
      [`diagnostics${setting}Enabled`]: enabled
    });
  };

  const handleDiagnosticsSettingChange = (setting: string, value: number) => {
    updateConfig('system', {
      ...config.system,
      [`diagnostics${setting}`]: value
    });
  };

  const getLogLevelText = (level: number) => {
    const levels = ['Error', 'Warning', 'Info', 'Debug', 'Trace'];
    return levels[level] || 'Unknown';
  };

  const handleRefreshErrors = () => {
    console.log('Refreshing error diagnostics...');
    // This would trigger a refresh of error data
  };

  const handleClearErrors = () => {
    console.log('Clearing error logs...');
    // This would clear the error logs
  };

  const handleExportLogs = () => {
    const logs = {
      errors: rf4sStatus.errors || [],
      timestamp: new Date().toISOString(),
      session: { errorCount, lastError }
    };
    
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rf4s-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            Error Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Total Errors</div>
              <div className="text-red-400 font-mono">{errorCount || 0}</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Warnings</div>
              <div className="text-yellow-400 font-mono">{rf4sStatus.warningCount || 0}</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Last Error</div>
              <div className="text-orange-400">{lastError ? 'Recent' : 'None'}</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Status</div>
              <div className={errorCount > 0 ? "text-yellow-400" : "text-green-400"}>
                {errorCount > 0 ? 'Issues' : 'Stable'}
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <button 
              onClick={handleRefreshErrors}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
            <button 
              onClick={handleClearErrors}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded flex items-center justify-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Bug className="w-4 h-4 text-red-500" />
            Debug Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleSwitch
            checked={config.system.diagnosticsVerboseLoggingEnabled || true}
            onChange={(val) => handleDiagnosticsToggle('VerboseLogging', val)}
            label="Verbose logging"
            size="sm"
          />
          <ToggleSwitch
            checked={config.system.diagnosticsStackTracesEnabled || false}
            onChange={(val) => handleDiagnosticsToggle('StackTraces', val)}
            label="Include stack traces"
            size="sm"
          />
          <CustomSlider
            label={`Log Level (${getLogLevelText(config.system.diagnosticsLogLevel || 2)})`}
            value={config.system.diagnosticsLogLevel || 2}
            onChange={(val) => handleDiagnosticsSettingChange('LogLevel', val)}
            min={0}
            max={4}
            step={1}
          />
          <CustomSlider
            label="Max Log Size"
            value={config.system.diagnosticsMaxLogSize || 50}
            onChange={(val) => handleDiagnosticsSettingChange('MaxLogSize', val)}
            min={10}
            max={500}
            unit="MB"
          />
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-500" />
            Recent Errors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-xs text-gray-300 space-y-2">
            {lastError ? (
              <div className="bg-red-900/20 border border-red-700 p-2 rounded">
                <div className="text-red-400 font-mono">Error</div>
                <div className="text-gray-400">{lastError}</div>
                <div className="text-gray-500">Recent</div>
              </div>
            ) : (
              <div className="bg-green-900/20 border border-green-700 p-2 rounded text-center">
                <div className="text-green-400">No recent errors</div>
              </div>
            )}
            {rf4sStatus.errors && rf4sStatus.errors.length > 0 ? (
              rf4sStatus.errors.slice(0, 2).map((error: any, index: number) => (
                <div key={index} className="bg-yellow-900/20 border border-yellow-700 p-2 rounded">
                  <div className="text-yellow-400 font-mono">Warning</div>
                  <div className="text-gray-400">{error.message || 'System warning'}</div>
                  <div className="text-gray-500">{error.timestamp || 'Recent'}</div>
                </div>
              ))
            ) : null}
          </div>
          <button 
            onClick={handleExportLogs}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded flex items-center justify-center gap-1"
          >
            <Download className="w-3 h-3" />
            Export Logs
          </button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs">
        <Badge variant="outline" className="text-green-400 border-green-400">
          Monitoring
        </Badge>
        <span className="text-gray-400">
          {config.system.diagnosticsVerboseLoggingEnabled ? 'Debug mode active' : 'Normal logging'}
        </span>
      </div>
    </div>
  );
};

export default ErrorDiagnosticsPanel;
