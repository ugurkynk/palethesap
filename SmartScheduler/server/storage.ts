import { 
  Vehicle, InsertVehicle, 
  Panel, InsertPanel, 
  LoadingPlan, InsertLoadingPlan,
  LoadingPlanData,
  PalletPosition,
  PALLET_SIZES, PALLET_HEIGHT, PANEL_STACKING_AMOUNTS
} from "@shared/schema";

export interface IStorage {
  // Vehicle operations
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<boolean>;
  
  // Panel operations
  getPanels(): Promise<Panel[]>;
  getPanel(id: number): Promise<Panel | undefined>;
  createPanel(panel: InsertPanel): Promise<Panel>;
  updatePanel(id: number, panel: Partial<InsertPanel>): Promise<Panel | undefined>;
  deletePanel(id: number): Promise<boolean>;
  
  // Loading plan operations
  getLoadingPlans(): Promise<LoadingPlan[]>;
  getLoadingPlan(id: number): Promise<LoadingPlan | undefined>;
  createLoadingPlan(plan: InsertLoadingPlan): Promise<LoadingPlan>;
  deleteLoadingPlan(id: number): Promise<boolean>;
  
  // Calculate loading plan
  calculateLoadingPlan(vehicleId: number, panels: Panel[]): Promise<LoadingPlanData>;
}

// Panel data with area and weight calculations
type PanelData = Panel & {
  area: number;
  totalArea: number;
  totalWeight: number;
};

export class MemStorage implements IStorage {
  private vehicles: Map<number, Vehicle>;
  private panels: Map<number, Panel>;
  private loadingPlans: Map<number, LoadingPlan>;
  
  private vehicleIdCounter: number;
  private panelIdCounter: number;
  private loadingPlanIdCounter: number;

  constructor() {
    this.vehicles = new Map();
    this.panels = new Map();
    this.loadingPlans = new Map();
    
    this.vehicleIdCounter = 1;
    this.panelIdCounter = 1;
    this.loadingPlanIdCounter = 1;
    
    // Add default vehicles
    this.createVehicle({
      name: "20\" konteyner",
      length: 590,
      width: 235,
      height: 239,
      maxPayload: 28000
    });
    
    this.createVehicle({
      name: "40\" konteyner",
      length: 1203,
      width: 235,
      height: 239,
      maxPayload: 26000
    });
    
    this.createVehicle({
      name: "40\" high cube konteyner",
      length: 1203,
      width: 235,
      height: 269,
      maxPayload: 26000
    });
    
    this.createVehicle({
      name: "TIR",
      length: 1360,
      width: 245,
      height: 270,
      maxPayload: 26000
    });
  }

  // Vehicle operations
  async getVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values());
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.vehicleIdCounter++;
    const newVehicle = { ...vehicle, id };
    this.vehicles.set(id, newVehicle);
    return newVehicle;
  }

  async updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const existingVehicle = this.vehicles.get(id);
    if (!existingVehicle) return undefined;
    
    const updatedVehicle = { ...existingVehicle, ...vehicle };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async deleteVehicle(id: number): Promise<boolean> {
    return this.vehicles.delete(id);
  }

  // Panel operations
  async getPanels(): Promise<Panel[]> {
    return Array.from(this.panels.values());
  }

  async getPanel(id: number): Promise<Panel | undefined> {
    return this.panels.get(id);
  }

  async createPanel(panel: InsertPanel): Promise<Panel> {
    const id = this.panelIdCounter++;
    const newPanel = { ...panel, id };
    this.panels.set(id, newPanel);
    return newPanel;
  }

  async updatePanel(id: number, panel: Partial<InsertPanel>): Promise<Panel | undefined> {
    const existingPanel = this.panels.get(id);
    if (!existingPanel) return undefined;
    
    const updatedPanel = { ...existingPanel, ...panel };
    this.panels.set(id, updatedPanel);
    return updatedPanel;
  }

  async deletePanel(id: number): Promise<boolean> {
    return this.panels.delete(id);
  }

  // Loading plan operations
  async getLoadingPlans(): Promise<LoadingPlan[]> {
    return Array.from(this.loadingPlans.values());
  }

  async getLoadingPlan(id: number): Promise<LoadingPlan | undefined> {
    return this.loadingPlans.get(id);
  }

  async createLoadingPlan(plan: InsertLoadingPlan): Promise<LoadingPlan> {
    const id = this.loadingPlanIdCounter++;
    const newPlan = { ...plan, id };
    this.loadingPlans.set(id, newPlan);
    return newPlan;
  }

  async deleteLoadingPlan(id: number): Promise<boolean> {
    return this.loadingPlans.delete(id);
  }

  // Helper method to find best fitting pallet size for a panel
  private findBestFittingPallet(panel: Panel, palletSizes: {length: number, width: number}[]): {length: number, width: number} | null {
    // Sort pallets by area (smallest to largest)
    const sortedSizes = [...palletSizes].sort((a, b) => {
      return (a.length * a.width) - (b.length * b.width);
    });
    
    // Find the smallest pallet that fits the panel
    for (const pallet of sortedSizes) {
      if (pallet.width >= panel.width && pallet.length >= panel.length) {
        return pallet;
      }
    }
    
    // If no exact fit, try rotating the panel
    for (const pallet of sortedSizes) {
      if (pallet.width >= panel.length && pallet.length >= panel.width) {
        return pallet;
      }
    }
    
    // If no pallet fits, use the largest available size
    const largestPallet = sortedSizes[sortedSizes.length - 1];
    if (largestPallet) {
      return largestPallet;
    }
    
    // Fallback to using panel dimensions if no pallet fits
    return {
      width: panel.width + 100, // Add margin
      length: panel.length + 100 // Add margin
    };
  }

  async calculateLoadingPlan(vehicleId: number, panels: Panel[]): Promise<LoadingPlanData> {
    console.log("Calculating loading plan for", panels.length, "panels");
    
    // Get the selected vehicle
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) {
      throw new Error(`Vehicle with ID ${vehicleId} not found`);
    }
    
    // Convert panel dimensions to cm for easier visualization
    const vehicleLength = vehicle.length; // cm
    const vehicleWidth = vehicle.width; // cm
    const vehicleHeight = vehicle.height; // cm
    const vehicleMaxPayload = vehicle.maxPayload; // kg
    
    // Total volume of the vehicle in cubic meters
    const vehicleVolume = (vehicleLength * vehicleWidth * vehicleHeight) / 1000000; // cm^3 to m^3
    
    // Enhance panel data with calculated fields
    const enhancedPanels: PanelData[] = panels.map(panel => {
      // Calculate panel area in square meters
      const area = (panel.width * panel.length) / 1000000; // mm^2 to m^2
      
      // Calculate total area for all panels of this type
      const totalArea = area * panel.count;
      
      // Calculate total weight for all panels of this type
      const totalWeight = totalArea * panel.weightPerSqm;
      
      return {
        ...panel,
        area,
        totalArea,
        totalWeight
      };
    });
    
    // Step 1: For each panel type, find the appropriate pallet size
    const palletPositions: PalletPosition[] = [];
    let totalPanelWeight = 0; // Net panel weight
    let totalPalletWeight = 0; // Empty pallet weight
    const panelSummary: any[] = [];
    
    // Step 2: Loop through each panel type and place them optimally
    for (const panel of enhancedPanels) {
      console.log(`Processing panel: ${panel.color}, ${panel.core}, ${panel.width}x${panel.length}mm, count: ${panel.count}`);
      
      // Skip panels with no count
      if (!panel.count || panel.count <= 0) continue;
      
      // Get appropriate pallet size for this panel
      const palletSize = this.findBestFittingPallet(panel, PALLET_SIZES);
      if (!palletSize) {
        console.warn(`No suitable pallet found for panel ${panel.id}`);
        continue;
      }
      
      // Get the maximum number of panels that can be stacked safely
      // This is based on the panel type, size, and core material
      let maxStackingAmount = 25; // Default fallback
      
      try {
        // Map panel width to closest standard width (1000, 1250, 1500, or 1600)
        let closestWidth = 1000;
        if (panel.width > 1375) closestWidth = 1500;
        else if (panel.width > 1125) closestWidth = 1250;
        else closestWidth = 1000;
        
        // Map panel length to closest category from PANEL_STACKING_AMOUNTS
        // First, categorize the length into the ranges defined
        const panelLength = panel.length;
        let closestLength = 1999; // Default to smallest
        
        if (panelLength <= 1999) closestLength = 1999;
        else if (panelLength <= 2499) closestLength = 2499;
        else if (panelLength <= 2999) closestLength = 2999;
        else if (panelLength <= 3199) closestLength = 3199;
        else if (panelLength <= 3499) closestLength = 3499;
        else if (panelLength <= 3999) closestLength = 3999;
        else if (panelLength <= 4499) closestLength = 4499;
        else if (panelLength <= 4999) closestLength = 4999;
        else if (panelLength <= 5499) closestLength = 5499;
        else if (panelLength <= 6000) closestLength = 6000;
        else closestLength = 6400;
        
        console.log(`Panel length: ${panelLength}mm kategorize edildi: ${closestLength}mm aralığına`);
        console.log(`Using panel core: ${panel.core}, width: ${closestWidth}, length: ${closestLength}`);
        
        // Get the stacking amount from the constants
        if (panel.core === "PE") {
          // PE core için değerler - gönderilen tabloya göre tam değerler
          if (closestWidth === 1000) {
            if (closestLength <= 1999) maxStackingAmount = 100;
            else if (closestLength <= 2499) maxStackingAmount = 100;
            else if (closestLength <= 2999) maxStackingAmount = 85;
            else if (closestLength <= 3199) maxStackingAmount = 75;
            else if (closestLength <= 3499) maxStackingAmount = 75;
            else if (closestLength <= 3999) maxStackingAmount = 65;
            else if (closestLength <= 4499) maxStackingAmount = 60;
            else if (closestLength <= 4999) maxStackingAmount = 50;
            else if (closestLength <= 5499) maxStackingAmount = 40;
            else if (closestLength <= 6000) maxStackingAmount = 30;
            else maxStackingAmount = 25;
          } else if (closestWidth === 1250) {
            if (closestLength <= 1999) maxStackingAmount = 100;
            else if (closestLength <= 2499) maxStackingAmount = 90;
            else if (closestLength <= 2999) maxStackingAmount = 80;
            else if (closestLength <= 3199) maxStackingAmount = 75;
            else if (closestLength <= 3499) maxStackingAmount = 75;
            else if (closestLength <= 3999) maxStackingAmount = 60;
            else if (closestLength <= 4499) maxStackingAmount = 50;
            else if (closestLength <= 4999) maxStackingAmount = 45;
            else if (closestLength <= 5499) maxStackingAmount = 40;
            else if (closestLength <= 6000) maxStackingAmount = 30;
            else maxStackingAmount = 25;
          } else { // 1500 genişlik
            if (closestLength <= 1999) maxStackingAmount = 100;
            else if (closestLength <= 2499) maxStackingAmount = 90;
            else if (closestLength <= 2999) maxStackingAmount = 75;
            else if (closestLength <= 3199) maxStackingAmount = 70;
            else if (closestLength <= 3499) maxStackingAmount = 65;
            else if (closestLength <= 3999) maxStackingAmount = 60;
            else if (closestLength <= 4499) maxStackingAmount = 50;
            else if (closestLength <= 4999) maxStackingAmount = 45;
            else if (closestLength <= 5499) maxStackingAmount = 40;
            else if (closestLength <= 6000) maxStackingAmount = 30;
            else maxStackingAmount = 25;
          }
        } else if (panel.core === "FR") {
          // FR core için değerler - gönderilen tabloya göre tam değerler
          if (closestWidth === 1000) {
            if (closestLength <= 1999) maxStackingAmount = 90;
            else if (closestLength <= 2499) maxStackingAmount = 80;
            else if (closestLength <= 2999) maxStackingAmount = 70;
            else if (closestLength <= 3199) maxStackingAmount = 65;
            else if (closestLength <= 3499) maxStackingAmount = 60;
            else if (closestLength <= 3999) maxStackingAmount = 50;
            else if (closestLength <= 4499) maxStackingAmount = 45;
            else if (closestLength <= 4999) maxStackingAmount = 40;
            else if (closestLength <= 5499) maxStackingAmount = 35;
            else if (closestLength <= 6000) maxStackingAmount = 30;
            else maxStackingAmount = 25;
          } else if (closestWidth === 1250) {
            if (closestLength <= 1999) maxStackingAmount = 90;
            else if (closestLength <= 2499) maxStackingAmount = 80;
            else if (closestLength <= 2999) maxStackingAmount = 70;
            else if (closestLength <= 3199) maxStackingAmount = 65;
            else if (closestLength <= 3499) maxStackingAmount = 60;
            else if (closestLength <= 3999) maxStackingAmount = 50;
            else if (closestLength <= 4499) maxStackingAmount = 45;
            else if (closestLength <= 4999) maxStackingAmount = 40;
            else if (closestLength <= 5499) maxStackingAmount = 35;
            else if (closestLength <= 6000) maxStackingAmount = 30;
            else maxStackingAmount = 25;
          } else { // 1500 genişlik
            if (closestLength <= 1999) maxStackingAmount = 80;
            else if (closestLength <= 2499) maxStackingAmount = 70;
            else if (closestLength <= 2999) maxStackingAmount = 60;
            else if (closestLength <= 3199) maxStackingAmount = 55;
            else if (closestLength <= 3499) maxStackingAmount = 50;
            else if (closestLength <= 3999) maxStackingAmount = 45;
            else if (closestLength <= 4499) maxStackingAmount = 35;
            else if (closestLength <= 4999) maxStackingAmount = 35;
            else if (closestLength <= 5499) maxStackingAmount = 30;
            else if (closestLength <= 6000) maxStackingAmount = 25;
            else maxStackingAmount = 20;
          }
        } else if (panel.core === "A2") {
          // A2 core için değerler - gönderilen tabloya göre tam değerler
          if (closestWidth === 1000) {
            if (closestLength <= 1999) maxStackingAmount = 75;
            else if (closestLength <= 2499) maxStackingAmount = 60;
            else if (closestLength <= 2999) maxStackingAmount = 50;
            else if (closestLength <= 3199) maxStackingAmount = 47;
            else if (closestLength <= 3499) maxStackingAmount = 43;
            else if (closestLength <= 3999) maxStackingAmount = 38;
            else if (closestLength <= 4499) maxStackingAmount = 33;
            else if (closestLength <= 4999) maxStackingAmount = 30;
            else if (closestLength <= 5499) maxStackingAmount = 27;
            else if (closestLength <= 6000) maxStackingAmount = 20;
            else maxStackingAmount = 17;
          } else if (closestWidth === 1250) {
            if (closestLength <= 1999) maxStackingAmount = 60;
            else if (closestLength <= 2499) maxStackingAmount = 48;
            else if (closestLength <= 2999) maxStackingAmount = 40;
            else if (closestLength <= 3199) maxStackingAmount = 38;
            else if (closestLength <= 3499) maxStackingAmount = 34;
            else if (closestLength <= 3999) maxStackingAmount = 30;
            else if (closestLength <= 4499) maxStackingAmount = 27;
            else if (closestLength <= 4999) maxStackingAmount = 24;
            else if (closestLength <= 5499) maxStackingAmount = 22; // Bu değeri 30'dan 22'ye düzeltiyorum
            else if (closestLength <= 6000) maxStackingAmount = 20;
            else maxStackingAmount = 17;
          } else { // 1500 genişlik
            if (closestLength <= 1999) maxStackingAmount = 50;
            else if (closestLength <= 2499) maxStackingAmount = 40;
            else if (closestLength <= 2999) maxStackingAmount = 33;
            else if (closestLength <= 3199) maxStackingAmount = 31;
            else if (closestLength <= 3499) maxStackingAmount = 29;
            else if (closestLength <= 3999) maxStackingAmount = 25;
            else if (closestLength <= 4499) maxStackingAmount = 22;
            else if (closestLength <= 4999) maxStackingAmount = 20;
            else if (closestLength <= 5499) maxStackingAmount = 18;
            else if (closestLength <= 6000) maxStackingAmount = 17;
            else maxStackingAmount = 16;
          }
        } else {
          // Bilinmeyen core tipi için varsayılan
          maxStackingAmount = 25;
        }
      } catch (error) {
        console.error(`Error determining max stacking amount for panel ${panel.id}: ${error}`);
        maxStackingAmount = 25; // Default fallback
      }
      
      // Calculate how many pallets we need for this panel type
      // Yuvarlama hatası olmaması için panel sayısını doğru sayaçlar olarak kullan
      const validCount = Math.max(1, panel.count || 1); // En az 1 panel olmalı
      const palletCount = Math.ceil(validCount / maxStackingAmount);
      const countPerPallet = Math.min(validCount, maxStackingAmount);
      const remainingCount = validCount % maxStackingAmount;

      // Palet ağırlığını hesapla
      // Paylaşılan tabloda palet ağırlıkları var, burada en uygun boyuta göre ağırlık belirleyelim
      let singlePalletWeight = 0;
      
      // Genişlik ve uzunluğa göre palet ağırlığını belirle
      if (panel.width <= 1000) {
        if (panel.length <= 2000) singlePalletWeight = 40.91;
        else if (panel.length <= 2500) singlePalletWeight = 46.0;
        else if (panel.length <= 3000) singlePalletWeight = 51.09;
        else if (panel.length <= 3500) singlePalletWeight = 56.17;
        else if (panel.length <= 4000) singlePalletWeight = 61.26;
        else if (panel.length <= 4500) singlePalletWeight = 71.44;
        else if (panel.length <= 5000) singlePalletWeight = 81.62;
        else if (panel.length <= 5500) singlePalletWeight = 91.79;
        else if (panel.length <= 6000) singlePalletWeight = 101.97;
        else singlePalletWeight = 112.15;
      } else if (panel.width <= 1250) {
        if (panel.length <= 2000) singlePalletWeight = 51.14;
        else if (panel.length <= 2500) singlePalletWeight = 57.5;
        else if (panel.length <= 3000) singlePalletWeight = 63.86;
        else if (panel.length <= 3500) singlePalletWeight = 70.22;
        else if (panel.length <= 4000) singlePalletWeight = 76.58;
        else if (panel.length <= 4500) singlePalletWeight = 89.3;
        else if (panel.length <= 5000) singlePalletWeight = 102.02;
        else if (panel.length <= 5500) singlePalletWeight = 114.74;
        else if (panel.length <= 6000) singlePalletWeight = 127.46;
        else singlePalletWeight = 140.18;
      } else { // 1500 or larger
        if (panel.length <= 2000) singlePalletWeight = 61.36;
        else if (panel.length <= 2500) singlePalletWeight = 69.0;
        else if (panel.length <= 3000) singlePalletWeight = 76.63;
        else if (panel.length <= 3500) singlePalletWeight = 84.26;
        else if (panel.length <= 4000) singlePalletWeight = 91.89;
        else if (panel.length <= 4500) singlePalletWeight = 107.16;
        else if (panel.length <= 5000) singlePalletWeight = 122.42;
        else if (panel.length <= 5500) singlePalletWeight = 137.69;
        else if (panel.length <= 6000) singlePalletWeight = 152.95;
        else singlePalletWeight = 168.22;
      }
      
      // Toplam panel ve palet ağırlıklarını hesapla
      const netPanelWeight = panel.totalWeight;
      const palletWeight = palletCount * singlePalletWeight;
      const combinedWeight = netPanelWeight + palletWeight;
      
      // Toplam ağırlıklara ekle
      totalPanelWeight += netPanelWeight;
      totalPalletWeight += palletWeight;

      // Panel özet bilgilerini ekle
      panelSummary.push({
        panelId: panel.id,
        color: panel.color,
        core: panel.core,
        width: panel.width,
        length: panel.length,
        count: panel.count,
        palletCount: palletCount,
        stackPerPallet: countPerPallet,
        netWeight: netPanelWeight,
        palletsWeight: palletWeight,
        totalWeight: combinedWeight
      });

      console.log(`Processing panel: ${panel.color}, ${panel.core}, ${panel.width}x${panel.length}mm, count: ${panel.count}, max stacking: ${maxStackingAmount}`);
      
      // Adjust panel width and length to mm
      // This is just for display scaling, the actual dimensions should be used for calculations
      const panelWidthDisplay = panel.width / 10; // mm to cm
      const panelLengthDisplay = panel.length / 10; // mm to cm
      
      // Adjust pallet dimensions to mm - add 1 cm to each dimension for margin
      const palletWidthDisplay = Math.ceil(palletSize.width / 10) + 1; // mm to cm
      const palletLengthDisplay = Math.ceil(palletSize.length / 10) + 1; // mm to cm
      
      // Calculate the stack height based on panel count and thickness
      // Palet yüksekliği (200 mm) + (panel sayısı * panel kalınlığı)
      const stackHeight = (PALLET_HEIGHT + (countPerPallet * panel.thickness)) / 10; // mm to cm
      
      // If a panel type has more than 6 pallets, organize them in a pyramid
      // (this helps with stability during transport)
      const maxPalletsPerColumn = 6; // Maximum pallets in a pyramid column
      const pyramidColumnCount = Math.ceil(palletCount / maxPalletsPerColumn);
      
      // Distribute pallets into pyramid columns - sort by size (largest first for bottom of pyramid)
      const pyramidColumns = Array(pyramidColumnCount).fill(0).map(() => []);
      
      // Create a pallet for each panel set
      for (let i = 0; i < palletCount; i++) {
        // Determine which column this pallet should go in
        const columnIndex = i % pyramidColumnCount;
        
        // How many panels in this specific pallet
        const panelsInThisPallet = i < palletCount - 1 || remainingCount === 0 ? 
          maxStackingAmount : remainingCount;
        
        // Add pallet to the appropriate column
        pyramidColumns[columnIndex].push({
          index: i,
          count: panelsInThisPallet,
          panelId: panel.id
        });
      }
      
      // Now place the pallets in the vehicle
      // For each column in the pyramid
      const xSpacing = 10; // cm spacing between columns
      let currentX = 0; // current X position in the vehicle
      
      // Place pallets in pyramid formation
      for (let columnIndex = 0; columnIndex < pyramidColumns.length; columnIndex++) {
        const column = pyramidColumns[columnIndex];
        let currentY = 0; // current Y position in the vehicle
        
        // Sort column by size (larger pallets at the bottom)
        column.sort((a, b) => b.count - a.count);
        
        // Place each pallet in this column
        for (let rowIndex = 0; rowIndex < column.length; rowIndex++) {
          const pallet = column[rowIndex];
          
          // Add the pallet to our position list
          palletPositions.push({
            x: currentX,
            y: currentY,
            width: panelWidthDisplay,
            height: panelLengthDisplay,
            panelId: pallet.panelId,
            stackHeight,
            count: pallet.count,
            palletLength: palletSize.length,
            palletWidth: palletSize.width,
            palletWeight: singlePalletWeight
          });
          
          // Increment Y position for next pallet in this column
          currentY += panelLengthDisplay + 1; // add 1 cm spacing between pallets
        }
        
        // Increment X position for next column
        currentX += panelWidthDisplay + xSpacing;
      }
    }
    
    // Step 3: Calculate the volume and weight usage percentages
    // Calculate occupied volume
    // For simplicity, we'll base this on the total stack height of all pallets
    let totalPanelVolume = 0;
    
    for (const panel of enhancedPanels) {
      const panelVolume = (panel.width / 1000) * (panel.length / 1000) * (panel.thickness / 1000) * panel.count;
      totalPanelVolume += panelVolume;
    }
    
    // Convert to cubic meters for comparison
    const usedVolume = totalPanelVolume; // already in m^3
    
    // Total weight (panels + pallets)
    const totalWeight = totalPanelWeight + totalPalletWeight;
    
    // Calculate percentages
    const volumePercentage = (usedVolume / vehicleVolume) * 100;
    const weightPercentage = (totalWeight / vehicleMaxPayload) * 100;
    
    // Determine if multiple vehicles are needed
    const requiresMultipleVehicles = volumePercentage > 100 || weightPercentage > 100;
    const vehicleCount = Math.max(
      Math.ceil(volumePercentage / 100),
      Math.ceil(weightPercentage / 100)
    );
    
    console.log(`Net panel weight: ${totalPanelWeight} kg`);
    console.log(`Pallet weight: ${totalPalletWeight} kg`);
    console.log(`Total gross weight: ${totalWeight} kg`);
    
    // Return the loading plan data
    return {
      pallets: palletPositions,
      vehicleLength,
      vehicleWidth,
      vehicleHeight,
      usedVolume,
      totalVolume: vehicleVolume,
      netWeight: totalPanelWeight,
      palletsWeight: totalPalletWeight,
      totalWeight,
      volumePercentage,
      weightPercentage,
      requiresMultipleVehicles,
      vehicleCount,
      panelSummary
    };
  }
}

export const storage = new MemStorage();
