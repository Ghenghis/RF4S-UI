
import { RF4SYamlConfig } from '../../types/config';

export const useConfigImportExport = () => {
  const exportConfig = (config: RF4SYamlConfig) => {
    const yamlString = convertToYaml(config);
    const blob = new Blob([yamlString], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rf4s-config-${Date.now()}.yaml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = (file: File): Promise<RF4SYamlConfig> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const yamlContent = e.target?.result as string;
          const parsedConfig = parseYamlConfig(yamlContent);
          resolve(parsedConfig);
        } catch (error) {
          console.error('Error importing config:', error);
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  };

  const convertToYaml = (config: RF4SYamlConfig): string => {
    // Simple YAML conversion - in a real app, use a proper YAML library
    return JSON.stringify(config, null, 2).replace(/"/g, '');
  };

  const parseYamlConfig = (yaml: string): RF4SYamlConfig => {
    // Simple YAML parsing - in a real app, use a proper YAML library
    return JSON.parse(yaml);
  };

  return {
    exportConfig,
    importConfig
  };
};
