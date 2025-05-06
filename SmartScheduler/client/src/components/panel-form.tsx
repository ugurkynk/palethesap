import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  LayoutGrid, 
  InfoIcon, 
  PlusCircle, 
  RefreshCcw, 
  FileInput, 
  FileOutput, 
  Calculator 
} from "lucide-react";
import { calculatePanelArea, calculatePanelWeight } from "@/lib/utils";
import usePanelStore from "@/hooks/use-panel-store";
import useVehicleStore from "@/hooks/use-vehicle-store";
import { formatNumber } from "@/lib/utils";

export default function PanelForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Zustand store'dan verileri seçici bir şekilde alıyoruz ve belleğe alıyoruz
  const editingPanel = usePanelStore(state => state.editingPanel);
  const setEditingPanel = usePanelStore(state => state.setEditingPanel);
  const addPanel = usePanelStore(state => state.addPanel);
  const updatePanel = usePanelStore(state => state.updatePanel);
  const importPanels = usePanelStore(state => state.importPanels);
  const exportPanels = usePanelStore(state => state.exportPanels);
  const calculateLoadingPlan = usePanelStore(state => state.calculateLoadingPlan);
  const resetAll = usePanelStore(state => state.resetAll);
  
  const getSelectedVehicleDimensions = useVehicleStore(state => state.getSelectedVehicleDimensions);
  const getVehicleIdForType = useVehicleStore(state => state.getVehicleIdForType);
  
  const handleAddOrUpdatePanel = () => {
    if (editingPanel.editingPanelId) {
      updatePanel(editingPanel.editingPanelId);
    } else {
      addPanel();
    }
  };
  
  const handleCalculate = () => {
    // Seçilen araç tipine uygun ID'yi al
    const vehicleId = getVehicleIdForType();
    
    console.log(`Hesaplama için araç ID'si: ${vehicleId}`);
    calculateLoadingPlan(vehicleId);
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importPanels(file);
    }
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };
  
  // Calculate panel metrics based on current form values
  const panelWidth = editingPanel.width / 1000; // mm to m
  const panelLength = editingPanel.length / 1000; // mm to m
  const panelArea = panelWidth * panelLength;
  const panelWeight = panelArea * editingPanel.weightPerSqm;
  const totalArea = panelArea * editingPanel.count;
  const totalWeight = panelWeight * editingPanel.count;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            Panel Ekle
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-5 w-5 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Yüklenecek panel bilgilerini girin</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="panelColor" className="text-gray-700 text-sm">
                Renk / Kod
              </Label>
              <Input
                id="panelColor"
                value={editingPanel.color}
                onChange={(e) => setEditingPanel({ color: e.target.value })}
                placeholder="Renk giriniz"
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="panelCore" className="text-gray-700 text-sm">
                Core Tipi
              </Label>
              <Select 
                value={editingPanel.core} 
                onValueChange={(value) => setEditingPanel({ core: value })}
              >
                <SelectTrigger id="panelCore" className="w-full">
                  <SelectValue placeholder="Core tipi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PE">PE</SelectItem>
                  <SelectItem value="FR">FR</SelectItem>
                  <SelectItem value="A2">A2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="panelWidth" className="text-gray-700 text-sm">
                En (mm)
              </Label>
              <Select 
                value={editingPanel.width.toString()} 
                onValueChange={(value) => setEditingPanel({ width: parseInt(value) })}
              >
                <SelectTrigger id="panelWidth" className="w-full">
                  <SelectValue placeholder="Panel eni seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1000">1000 mm</SelectItem>
                  <SelectItem value="1250">1250 mm</SelectItem>
                  <SelectItem value="1500">1500 mm</SelectItem>
                  <SelectItem value="1600">1600 mm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="panelLength" className="text-gray-700 text-sm">
                Boy (mm)
              </Label>
              <Input
                type="number"
                id="panelLength"
                min="1"
                value={editingPanel.length || ''}
                onChange={(e) => setEditingPanel({ length: parseInt(e.target.value) || 0 })}
                placeholder="Panel boyunu girin"
                className="w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="panelThickness" className="text-gray-700 text-sm">
                Kalınlık (mm)
              </Label>
              <Input
                type="text"
                id="panelThickness"
                value="4"
                readOnly
                className="w-full bg-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="panelCount" className="text-gray-700 text-sm">
                Adet
              </Label>
              <Input
                type="number"
                id="panelCount"
                min="1"
                value={editingPanel.count || ''}
                onChange={(e) => setEditingPanel({ count: parseInt(e.target.value) || 0 })}
                placeholder="Adet"
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="panelWeight" className="text-gray-700 text-sm">
                Ağırlık (kg/m²)
              </Label>
              <Input
                type="text"
                id="panelWeight"
                value={editingPanel.weightPerSqm}
                readOnly
                className="w-full bg-gray-100"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 bg-blue-50 p-3 rounded-md">
            <div>
              <span className="block text-gray-500 text-sm">Panel Alanı</span>
              <span className="block font-medium text-gray-800">{formatNumber(panelArea)} m²</span>
            </div>
            <div>
              <span className="block text-gray-500 text-sm">Toplam Alan</span>
              <span className="block font-medium text-gray-800">{formatNumber(totalArea)} m²</span>
            </div>
            <div>
              <span className="block text-gray-500 text-sm">Birim Ağırlık</span>
              <span className="block font-medium text-gray-800">{formatNumber(panelWeight)} kg</span>
            </div>
            <div>
              <span className="block text-gray-500 text-sm">Toplam Ağırlık</span>
              <span className="block font-medium text-gray-800">{formatNumber(totalWeight)} kg</span>
            </div>
          </div>
          <Button 
            onClick={handleAddOrUpdatePanel}
            className="w-full bg-primary flex items-center justify-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            {editingPanel.editingPanelId ? 'Panel Güncelle' : 'Panel Ekle'}
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button 
            onClick={handleImportClick}
            className="bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-2 text-sm"
          >
            <FileInput className="h-4 w-4" />
            JSON İçe Aktar
          </Button>
          <Button 
            onClick={exportPanels}
            className="bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center gap-2 text-sm"
          >
            <FileOutput className="h-4 w-4" />
            JSON Dışa Aktar
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept=".json" 
            className="hidden" 
          />
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button 
            onClick={handleCalculate}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Yükleme Planı Hesapla
          </Button>
          <Button 
            onClick={resetAll}
            className="bg-gray-500 hover:bg-gray-600 text-white flex items-center justify-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Formu Sıfırla
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
