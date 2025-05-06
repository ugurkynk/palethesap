import { create } from 'zustand';
import { Panel, PanelData } from '@shared/schema';
import { calculatePanelArea, calculatePanelWeight, getPanelColorHex, downloadJsonFile } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface PanelFormState {
  color: string;
  core: string;
  width: number;
  length: number;
  thickness: number;
  count: number;
  weightPerSqm: number;
  editingPanelId: number | null;
}

interface PanelState {
  panels: PanelData[];
  editingPanel: PanelFormState;
  isCalculated: boolean;
  calculationResults: any | null;
  
  setEditingPanel: (panel: Partial<PanelFormState>) => void;
  resetEditingPanel: () => void;
  
  addPanel: () => void;
  updatePanel: (id: number) => void;
  removePanel: (id: number) => void;
  editPanel: (id: number) => void;
  
  calculateLoadingPlan: (vehicleId: number) => Promise<void>;
  resetCalculation: () => void;
  
  importPanels: (file: File) => Promise<void>;
  exportPanels: () => void;
  
  resetAll: () => void;
}

const initialEditingPanel: PanelFormState = {
  color: '',
  core: '',
  width: 0,
  length: 0,
  thickness: 4,  // Sabit panel kalınlığı 4 mm
  count: 0,
  weightPerSqm: 0,
  editingPanelId: null
};

const usePanelStore = create<PanelState>((set, get) => ({
  panels: [],
  editingPanel: { ...initialEditingPanel },
  isCalculated: false,
  calculationResults: null,
  
  setEditingPanel: (panel: Partial<PanelFormState>) => {
    set(state => {
      const updatedPanel = { ...state.editingPanel, ...panel };
      
      // Panel thickness is always fixed at 4 mm
      updatedPanel.thickness = 4;
      
      // Automatically set weight based on core type
      if (panel.core) {
        if (panel.core === 'PE') {
          updatedPanel.weightPerSqm = 5.60;
        } else if (panel.core === 'FR') {
          updatedPanel.weightPerSqm = 7.30;
        } else if (panel.core === 'A2') {
          updatedPanel.weightPerSqm = 8.60;
        }
      }
      
      return { editingPanel: updatedPanel };
    });
  },
  
  resetEditingPanel: () => {
    set({ editingPanel: { ...initialEditingPanel } });
  },
  
  addPanel: () => {
    const { editingPanel, panels } = get();
    const { color, core, width, length, thickness, count, weightPerSqm } = editingPanel;
    
    // Validate inputs
    if (!color || !length || !count) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm panel bilgilerini doldurun.",
        variant: "destructive"
      });
      return;
    }
    
    const area = calculatePanelArea(width, length);
    const weight = calculatePanelWeight(area, weightPerSqm);
    
    const newPanel: PanelData = {
      id: Date.now(),
      color,
      core,
      width,
      length,
      thickness,
      count,
      weightPerSqm,
      area,
      totalArea: area * count,
      totalWeight: weight * count
    };
    
    set(state => ({
      panels: [...state.panels, newPanel],
      editingPanel: { ...initialEditingPanel }
    }));
    
    toast({
      title: "Panel Eklendi",
      description: `${color} panel başarıyla eklendi.`
    });
  },
  
  updatePanel: (id: number) => {
    const { editingPanel, panels } = get();
    const { color, core, width, length, thickness, count, weightPerSqm } = editingPanel;
    
    // Validate inputs
    if (!color || !length || !count) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm panel bilgilerini doldurun.",
        variant: "destructive"
      });
      return;
    }
    
    const area = calculatePanelArea(width, length);
    const weight = calculatePanelWeight(area, weightPerSqm);
    
    const updatedPanels = panels.map(panel => {
      if (panel.id === id) {
        return {
          ...panel,
          color,
          core,
          width,
          length,
          thickness,
          count,
          weightPerSqm,
          area,
          totalArea: area * count,
          totalWeight: weight * count
        };
      }
      return panel;
    });
    
    set({
      panels: updatedPanels,
      editingPanel: { ...initialEditingPanel }
    });
    
    toast({
      title: "Panel Güncellendi",
      description: `${color} panel başarıyla güncellendi.`
    });
  },
  
  removePanel: (id: number) => {
    set(state => ({
      panels: state.panels.filter(panel => panel.id !== id)
    }));
    
    toast({
      title: "Panel Silindi",
      description: "Panel başarıyla silindi."
    });
  },
  
  editPanel: (id: number) => {
    const panel = get().panels.find(p => p.id === id);
    
    if (panel) {
      set({
        editingPanel: {
          color: panel.color,
          core: panel.core,
          width: panel.width,
          length: panel.length,
          thickness: panel.thickness,
          count: panel.count,
          weightPerSqm: panel.weightPerSqm,
          editingPanelId: id
        }
      });
    }
  },
  
  calculateLoadingPlan: async (vehicleId: number) => {
    const { panels } = get();
    
    if (panels.length === 0) {
      toast({
        title: "Panel Ekleyin",
        description: "Yükleme planı hesaplamak için en az bir panel ekleyin.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log('Calculating loading plan with panels:', panels);
      
      // Panel verilerinin tümünü gönder (sadece ID'leri değil)
      const response = await apiRequest('POST', '/api/calculate-loading-plan', {
        vehicleId: Number(vehicleId),
        panels: panels.map(panel => ({
          id: Number(panel.id),
          color: panel.color,
          core: panel.core,
          width: Number(panel.width),
          length: Number(panel.length),
          thickness: Number(panel.thickness),
          count: Number(panel.count),
          weightPerSqm: Number(panel.weightPerSqm)
        }))
      });
      
      const results = await response.json();
      console.log('Loading plan results:', results);
      
      set({
        isCalculated: true,
        calculationResults: results
      });
      
      toast({
        title: "Yükleme Planı Hazır",
        description: "Yükleme planı başarıyla hesaplandı."
      });
    } catch (error) {
      console.error('Error calculating loading plan:', error);
      toast({
        title: "Hesaplama Hatası",
        description: "Yükleme planı hesaplanamadı. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
    }
  },
  
  resetCalculation: () => {
    set({
      isCalculated: false,
      calculationResults: null
    });
  },
  
  importPanels: async (file: File) => {
    try {
      const fileContent = await file.text();
      const importedData = JSON.parse(fileContent);
      
      if (!Array.isArray(importedData)) {
        throw new Error('Geçersiz veri formatı.');
      }
      
      const validPanels = importedData.filter(panel => 
        panel.color && 
        panel.core && 
        panel.width && 
        panel.length && 
        panel.thickness && 
        panel.count && 
        panel.weightPerSqm
      );
      
      const processedPanels = validPanels.map(panel => {
        const area = calculatePanelArea(panel.width, panel.length);
        const weight = calculatePanelWeight(area, panel.weightPerSqm);
        
        return {
          id: Date.now() + Math.random() * 1000,
          color: panel.color,
          core: panel.core,
          width: panel.width,
          length: panel.length,
          thickness: panel.thickness,
          count: panel.count,
          weightPerSqm: panel.weightPerSqm,
          area,
          totalArea: area * panel.count,
          totalWeight: weight * panel.count
        };
      });
      
      set(state => ({
        panels: [...state.panels, ...processedPanels]
      }));
      
      toast({
        title: "İçe Aktarma Başarılı",
        description: `${processedPanels.length} panel başarıyla içe aktarıldı.`
      });
    } catch (error) {
      console.error('Error importing panels:', error);
      toast({
        title: "İçe Aktarma Hatası",
        description: "Paneller içe aktarılamadı. Lütfen JSON dosyasını kontrol edin.",
        variant: "destructive"
      });
    }
  },
  
  exportPanels: () => {
    const { panels } = get();
    
    if (panels.length === 0) {
      toast({
        title: "Dışa Aktarma Hatası",
        description: "Dışa aktarılacak panel bulunamadı.",
        variant: "destructive"
      });
      return;
    }
    
    const exportData = panels.map(panel => ({
      color: panel.color,
      core: panel.core,
      width: panel.width,
      length: panel.length,
      thickness: panel.thickness,
      count: panel.count,
      weightPerSqm: panel.weightPerSqm
    }));
    
    downloadJsonFile(exportData, 'kompozit-panel-verileri.json');
    
    toast({
      title: "Dışa Aktarma Başarılı",
      description: `${panels.length} panel başarıyla dışa aktarıldı.`
    });
  },
  
  resetAll: () => {
    set({
      panels: [],
      editingPanel: { ...initialEditingPanel },
      isCalculated: false,
      calculationResults: null
    });
    
    toast({
      title: "Sıfırlama Başarılı",
      description: "Tüm veriler başarıyla sıfırlandı."
    });
  }
}));

export default usePanelStore;
