
import { useConfigState } from './config/useConfigState';
import { useConfigVersions } from './config/useConfigVersions';
import { useConfigValidation } from './config/useConfigValidation';
import { useConfigImportExport } from './config/useConfigImportExport';

export const useConfigManager = () => {
  const {
    config,
    setConfig,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    updateConfig,
    resetConfig
  } = useConfigState();

  const {
    versions,
    currentVersionId,
    saveVersion: saveVersionToHistory,
    revertToVersion: revertToVersionFromHistory
  } = useConfigVersions();

  const {
    isTestMode,
    testResults,
    testConfiguration,
    aiOptimizeConfig: performAiOptimization
  } = useConfigValidation();

  const {
    exportConfig: performExportConfig,
    importConfig: performImportConfig
  } = useConfigImportExport();

  const saveVersion = (description: string, aiOptimized = false) => {
    const versionId = saveVersionToHistory(config, description, aiOptimized);
    setHasUnsavedChanges(false);
    return versionId;
  };

  const revertToVersion = (versionId: string) => {
    const revertedConfig = revertToVersionFromHistory(versionId);
    if (revertedConfig) {
      setConfig(revertedConfig);
      setHasUnsavedChanges(false);
    }
  };

  const aiOptimizeConfig = async () => {
    const optimizedConfig = await performAiOptimization(config);
    setConfig(optimizedConfig);
    saveVersion('AI Optimization - Improved accuracy and timing', true);
  };

  const exportConfig = () => {
    performExportConfig(config);
  };

  const importConfig = async (file: File) => {
    try {
      const parsedConfig = await performImportConfig(file);
      setConfig(parsedConfig);
      saveVersion('Imported Configuration', false);
    } catch (error) {
      console.error('Error importing config:', error);
    }
  };

  return {
    config,
    versions,
    currentVersionId,
    hasUnsavedChanges,
    isTestMode,
    testResults,
    updateConfig,
    saveVersion,
    revertToVersion,
    testConfiguration: () => testConfiguration(config),
    aiOptimizeConfig,
    exportConfig,
    importConfig
  };
};
