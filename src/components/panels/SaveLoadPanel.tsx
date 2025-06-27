
import React, { useState, useEffect } from 'react';
import { SaveLoadService } from '../../services/SaveLoadService';
import QuickSaveSection from './saveLoad/QuickSaveSection';
import SaveSlotsList from './saveLoad/SaveSlotsList';
import SaveStatistics from './saveLoad/SaveStatistics';

const SaveLoadPanel: React.FC = () => {
  const [saveSlots, setSaveSlots] = useState<any[]>([]);
  const [newSaveName, setNewSaveName] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  useEffect(() => {
    loadSaveSlots();
  }, []);

  const loadSaveSlots = () => {
    const slots = SaveLoadService.getSaveSlots();
    setSaveSlots(slots);
  };

  const handleSave = async () => {
    if (!newSaveName.trim()) return;
    
    const success = await SaveLoadService.saveSession(newSaveName);
    if (success) {
      setNewSaveName('');
      loadSaveSlots();
    }
  };

  const handleAutoSave = async () => {
    const success = await SaveLoadService.saveSession('auto-save');
    if (success) {
      loadSaveSlots();
    }
  };

  const handleLoad = async (slotId: string) => {
    const success = await SaveLoadService.loadSession(slotId);
    if (success) {
      setSelectedSlot(slotId);
    }
  };

  const handleDelete = (slotId: string) => {
    if (confirm('Are you sure you want to delete this save?')) {
      SaveLoadService.deleteSaveSlot(slotId);
      loadSaveSlots();
    }
  };

  const handleExport = (slotId: string) => {
    const exportData = SaveLoadService.exportSave(slotId);
    if (exportData) {
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rf4s-save-${slotId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = SaveLoadService.importSave(content, file.name);
      if (success) {
        loadSaveSlots();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-3">
      <QuickSaveSection
        newSaveName={newSaveName}
        onSaveNameChange={setNewSaveName}
        onSave={handleSave}
        onAutoSave={handleAutoSave}
        onImport={handleImport}
      />

      <SaveSlotsList
        saveSlots={saveSlots}
        selectedSlot={selectedSlot}
        onLoad={handleLoad}
        onExport={handleExport}
        onDelete={handleDelete}
      />

      <SaveStatistics saveSlots={saveSlots} />
    </div>
  );
};

export default SaveLoadPanel;
