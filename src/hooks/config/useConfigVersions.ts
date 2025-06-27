
import { useState, useEffect } from 'react';
import { ConfigVersion, RF4SYamlConfig } from '../../types/config';

export const useConfigVersions = () => {
  const [versions, setVersions] = useState<ConfigVersion[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string>('default');

  useEffect(() => {
    const savedVersions = localStorage.getItem('rf4s-config-versions');
    if (savedVersions) {
      const parsedVersions = JSON.parse(savedVersions).map((v: any) => ({
        ...v,
        timestamp: new Date(v.timestamp)
      }));
      setVersions(parsedVersions);
    }
  }, []);

  const saveVersion = (config: RF4SYamlConfig, description: string, aiOptimized = false) => {
    const newVersion: ConfigVersion = {
      id: Date.now().toString(),
      timestamp: new Date(),
      config: { ...config },
      description,
      user: aiOptimized ? 'AI Assistant' : 'User',
      aiOptimized
    };

    const updatedVersions = [newVersion, ...versions.slice(0, 19)]; // Keep last 20
    setVersions(updatedVersions);
    setCurrentVersionId(newVersion.id);
    
    localStorage.setItem('rf4s-config-versions', JSON.stringify(updatedVersions));
    return newVersion.id;
  };

  const revertToVersion = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      setCurrentVersionId(versionId);
      return version.config;
    }
    return null;
  };

  return {
    versions,
    currentVersionId,
    saveVersion,
    revertToVersion
  };
};
