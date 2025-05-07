import { create } from 'zustand';
import { calculateVehicleVolume, calculateFloorArea, vehicleTypes } from '@/lib/utils';
import { VehicleType } from '@shared/schema';

interface VehicleState {
  selectedVehicleType: string;
  customDimensions: {
    length: number;
    width: number;
    height: number;
    maxPayload: number;
  };
  vehicleVolume: number;
  floorArea: number;
  showCustomDimensions: boolean;
  
  setSelectedVehicleType: (type: string) => void;
  setCustomDimensions: (dimensions: Partial<VehicleState['customDimensions']>) => void;
  getSelectedVehicleDimensions: () => {
    length: number;
    width: number;
    height: number;
    maxPayload: number;
  };
  getVehicleDisplayData: () => {
    dimensions: string;
    volume: string;
    floorArea: string;
    maxPayload: string;
  };
  getVehicleIdForType: () => number;
}

const useVehicleStore = create<VehicleState>((set, get) => ({
  selectedVehicleType: 'standard_truck',
  customDimensions: {
    length: 1360,
    width: 245,
    height: 270,
    maxPayload: 26000,
  },
  vehicleVolume: calculateVehicleVolume(1360, 245, 270),
  floorArea: calculateFloorArea(1360, 245),
  showCustomDimensions: false,
  
  setSelectedVehicleType: (type: string) => {
    const vehicleType = vehicleTypes.find(vt => vt.value === type);
    
    if (!vehicleType) return;
    
    const showCustomDimensions = type === 'custom';
    
    if (!showCustomDimensions) {
      const { length, width, height, maxPayload } = vehicleType.dimensions;
      const volume = calculateVehicleVolume(length, width, height);
      const floorArea = calculateFloorArea(length, width);
      
      set({
        selectedVehicleType: type,
        customDimensions: {
          length,
          width,
          height,
          maxPayload,
        },
        vehicleVolume: volume,
        floorArea,
        showCustomDimensions,
      });
    } else {
      set({
        selectedVehicleType: type,
        showCustomDimensions,
      });
    }
  },
  
  setCustomDimensions: (dimensions: Partial<VehicleState['customDimensions']>) => {
    const currentDimensions = get().customDimensions;
    const updatedDimensions = { ...currentDimensions, ...dimensions };
    
    const volume = calculateVehicleVolume(
      updatedDimensions.length,
      updatedDimensions.width,
      updatedDimensions.height
    );
    
    const floorArea = calculateFloorArea(
      updatedDimensions.length,
      updatedDimensions.width
    );
    
    set({
      customDimensions: updatedDimensions,
      vehicleVolume: volume,
      floorArea,
    });
  },
  
  getSelectedVehicleDimensions: () => {
    const { selectedVehicleType, customDimensions } = get();
    
    if (selectedVehicleType === 'custom') {
      return customDimensions;
    }
    
    const vehicleType = vehicleTypes.find(vt => vt.value === selectedVehicleType);
    
    if (!vehicleType) {
      return customDimensions;
    }
    
    return vehicleType.dimensions;
  },
  
  getVehicleDisplayData: () => {
    // Doğrudan seçilen araç tipinin boyutlarını kullan
    const selectedVehicleType = get().selectedVehicleType;
    const vehicleType = vehicleTypes.find(vt => vt.value === selectedVehicleType);
    
    // Eğer vehicle type bulunamazsa customDimensions'u kullan
    let dimensions = vehicleType?.dimensions;
    if (!dimensions) {
      dimensions = get().customDimensions;
    }
    
    const { length, width, height, maxPayload } = dimensions;
    
    // Boyutlar için hesaplamaları burada yap
    const volume = calculateVehicleVolume(length, width, height);
    const floorArea = calculateFloorArea(length, width);
    
    const lengthM = (length / 100).toFixed(2);
    const widthM = (width / 100).toFixed(2);
    const heightM = (height / 100).toFixed(2);
    
    return {
      dimensions: `${lengthM}m × ${widthM}m × ${heightM}m`,
      volume: `${volume.toFixed(2)} m³`,
      floorArea: `${floorArea.toFixed(2)} m²`,
      maxPayload: `${(maxPayload / 1000).toFixed(2)} ton`,
    };
  },
  
  getVehicleIdForType: () => {
    const selectedVehicleType = get().selectedVehicleType;
    
    // Araç tiplerine göre API'deki araç ID'lerini eşleştir
    switch (selectedVehicleType) {
      case '20ft_container':
        return 1; // 20" konteyner
      case '40ft_container':
        return 2; // 40" konteyner
      case '40ft_hc_container':
        return 3; // 40" high cube konteyner
      case 'standard_truck':
        return 4; // TIR
      case 'custom':
        // Özel boyutlar için varsayılan TIR'ı kullan
        return 4;
      default:
        // Bulunamazsa varsayılan olarak TIR kullan
        return 4;
    }
  },
}));

export default useVehicleStore;
