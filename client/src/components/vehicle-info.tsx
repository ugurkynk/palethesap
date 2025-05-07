import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Truck, Ruler, InfoIcon } from "lucide-react";
import useVehicleStore from "@/hooks/use-vehicle-store";
import { vehicleTypes } from "@/lib/utils";

export default function VehicleInfo() {
  // Zustand store'dan her bileşen için ayrı seçici kullanma
  const selectedVehicleType = useVehicleStore(state => state.selectedVehicleType);
  const customDimensions = useVehicleStore(state => state.customDimensions);
  const showCustomDimensions = useVehicleStore(state => state.showCustomDimensions);
  const setSelectedVehicleType = useVehicleStore(state => state.setSelectedVehicleType);
  const setCustomDimensions = useVehicleStore(state => state.setCustomDimensions);
  const getVehicleDisplayData = useVehicleStore(state => state.getVehicleDisplayData);
  
  // useEffect dışında hesaplanması performans açısından daha verimli
  const vehicleData = getVehicleDisplayData();

  // Handle dimension input changes
  const handleDimensionChange = (dimension: 'length' | 'width' | 'height' | 'maxPayload', value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setCustomDimensions({ [dimension]: numValue });
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Araç Bilgileri
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-5 w-5 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Araç tipini seçin veya özel boyut girin</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="vehicleType" className="text-gray-700 font-medium">
              Araç Tipi
            </Label>
            <Select 
              value={selectedVehicleType} 
              onValueChange={setSelectedVehicleType}
            >
              <SelectTrigger id="vehicleType" className="w-full">
                <SelectValue placeholder="Araç tipi seçin" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {showCustomDimensions && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700 flex items-center gap-2">
                <Ruler className="h-4 w-4 text-primary" />
                Özel Ölçüler
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="containerLength" className="text-gray-700 text-sm">
                    Uzunluk (cm)
                  </Label>
                  <Input
                    type="number"
                    id="containerLength"
                    min="1"
                    value={customDimensions.length}
                    onChange={(e) => handleDimensionChange('length', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="containerWidth" className="text-gray-700 text-sm">
                    Genişlik (cm)
                  </Label>
                  <Input
                    type="number"
                    id="containerWidth"
                    min="1"
                    value={customDimensions.width}
                    onChange={(e) => handleDimensionChange('width', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="containerHeight" className="text-gray-700 text-sm">
                    Yükseklik (cm)
                  </Label>
                  <Input
                    type="number"
                    id="containerHeight"
                    min="1"
                    value={customDimensions.height}
                    onChange={(e) => handleDimensionChange('height', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="maxPayload" className="text-gray-700 text-sm">
                  Maksimum Yük (kg)
                </Label>
                <Input
                  type="number"
                  id="maxPayload"
                  min="1"
                  value={customDimensions.maxPayload}
                  onChange={(e) => handleDimensionChange('maxPayload', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
              <InfoIcon className="h-4 w-4 text-primary" />
              Araç Özeti
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-gray-500">İç Boyutlar</span>
                <span className="block font-medium text-gray-800">{vehicleData.dimensions}</span>
              </div>
              <div>
                <span className="block text-gray-500">Hacim</span>
                <span className="block font-medium text-gray-800">{vehicleData.volume}</span>
              </div>
              <div>
                <span className="block text-gray-500">Maksimum Yük</span>
                <span className="block font-medium text-gray-800">{vehicleData.maxPayload}</span>
              </div>
              <div>
                <span className="block text-gray-500">Taban Alanı</span>
                <span className="block font-medium text-gray-800">{vehicleData.floorArea}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
