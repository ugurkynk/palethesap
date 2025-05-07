// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
import { pgTable, text, serial, integer, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  length: doublePrecision("length").notNull(),
  // Length in centimeters
  width: doublePrecision("width").notNull(),
  // Width in centimeters
  height: doublePrecision("height").notNull(),
  // Height in centimeters
  maxPayload: doublePrecision("max_payload").notNull()
  // Maximum payload in kilograms
});
var insertVehicleSchema = createInsertSchema(vehicles).pick({
  name: true,
  length: true,
  width: true,
  height: true,
  maxPayload: true
});
var panels = pgTable("panels", {
  id: serial("id").primaryKey(),
  color: text("color").notNull(),
  core: text("core").notNull(),
  // PE, FR, A2
  width: doublePrecision("width").notNull(),
  // Width in millimeters
  length: doublePrecision("length").notNull(),
  // Length in millimeters
  thickness: doublePrecision("thickness").notNull(),
  // Thickness in millimeters
  count: integer("count").notNull(),
  weightPerSqm: doublePrecision("weight_per_sqm").notNull()
  // Weight per square meter in kilograms
});
var insertPanelSchema = createInsertSchema(panels).pick({
  color: true,
  core: true,
  width: true,
  length: true,
  thickness: true,
  count: true,
  weightPerSqm: true
});
var loadingPlans = pgTable("loading_plans", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  totalVolume: doublePrecision("total_volume").notNull(),
  // Total volume in cubic meters
  usedVolume: doublePrecision("used_volume").notNull(),
  // Used volume in cubic meters
  totalWeight: doublePrecision("total_weight").notNull(),
  // Total weight in kilograms
  planData: jsonb("plan_data").notNull(),
  // JSON data for the loading plan visualization
  createdAt: doublePrecision("created_at").notNull()
});
var insertLoadingPlanSchema = createInsertSchema(loadingPlans).pick({
  vehicleId: true,
  totalVolume: true,
  usedVolume: true,
  totalWeight: true,
  planData: true,
  createdAt: true
});
var PALLET_SIZES = [
  // En: 1000mm paletler
  { length: 2010, width: 1e3 },
  { length: 2260, width: 1e3 },
  { length: 2510, width: 1e3 },
  { length: 2760, width: 1e3 },
  { length: 3010, width: 1e3 },
  { length: 3210, width: 1e3 },
  { length: 3510, width: 1e3 },
  { length: 3760, width: 1e3 },
  { length: 4010, width: 1e3 },
  { length: 4260, width: 1e3 },
  { length: 4510, width: 1e3 },
  { length: 4760, width: 1e3 },
  { length: 5010, width: 1e3 },
  { length: 5260, width: 1e3 },
  { length: 5510, width: 1e3 },
  { length: 5760, width: 1e3 },
  { length: 6010, width: 1e3 },
  { length: 6260, width: 1e3 },
  { length: 6410, width: 1e3 },
  // En: 1250mm paletler
  { length: 2010, width: 1250 },
  { length: 2260, width: 1250 },
  { length: 2510, width: 1250 },
  { length: 2760, width: 1250 },
  { length: 3010, width: 1250 },
  { length: 3210, width: 1250 },
  { length: 3510, width: 1250 },
  { length: 3760, width: 1250 },
  { length: 4010, width: 1250 },
  { length: 4260, width: 1250 },
  { length: 4510, width: 1250 },
  { length: 4760, width: 1250 },
  { length: 5010, width: 1250 },
  { length: 5260, width: 1250 },
  { length: 5510, width: 1250 },
  { length: 5760, width: 1250 },
  { length: 6010, width: 1250 },
  { length: 6260, width: 1250 },
  { length: 6410, width: 1250 },
  // En: 1300mm paletler
  { length: 3210, width: 1300 },
  // En: 1500mm paletler
  { length: 2010, width: 1500 },
  { length: 2260, width: 1500 },
  { length: 2510, width: 1500 },
  { length: 2760, width: 1500 },
  { length: 3010, width: 1500 },
  { length: 3210, width: 1500 },
  { length: 3510, width: 1500 },
  { length: 3760, width: 1500 },
  { length: 4010, width: 1500 },
  { length: 4260, width: 1500 },
  { length: 4510, width: 1500 },
  { length: 4760, width: 1500 },
  { length: 5010, width: 1500 },
  { length: 5260, width: 1500 },
  { length: 5510, width: 1500 },
  { length: 5760, width: 1500 },
  { length: 6010, width: 1500 },
  { length: 6260, width: 1500 },
  { length: 6410, width: 1500 },
  // En: 1600mm paletler
  { length: 3760, width: 1600 }
];
var PALLET_HEIGHT = 200;

// server/storage.ts
var MemStorage = class {
  vehicles;
  panels;
  loadingPlans;
  vehicleIdCounter;
  panelIdCounter;
  loadingPlanIdCounter;
  constructor() {
    this.vehicles = /* @__PURE__ */ new Map();
    this.panels = /* @__PURE__ */ new Map();
    this.loadingPlans = /* @__PURE__ */ new Map();
    this.vehicleIdCounter = 1;
    this.panelIdCounter = 1;
    this.loadingPlanIdCounter = 1;
    this.createVehicle({
      name: '20" konteyner',
      length: 590,
      width: 235,
      height: 239,
      maxPayload: 28e3
    });
    this.createVehicle({
      name: '40" konteyner',
      length: 1203,
      width: 235,
      height: 239,
      maxPayload: 26e3
    });
    this.createVehicle({
      name: '40" high cube konteyner',
      length: 1203,
      width: 235,
      height: 269,
      maxPayload: 26e3
    });
    this.createVehicle({
      name: "TIR",
      length: 1360,
      width: 245,
      height: 270,
      maxPayload: 26e3
    });
  }
  // Vehicle operations
  async getVehicles() {
    return Array.from(this.vehicles.values());
  }
  async getVehicle(id) {
    return this.vehicles.get(id);
  }
  async createVehicle(vehicle) {
    const id = this.vehicleIdCounter++;
    const newVehicle = { ...vehicle, id };
    this.vehicles.set(id, newVehicle);
    return newVehicle;
  }
  async updateVehicle(id, vehicle) {
    const existingVehicle = this.vehicles.get(id);
    if (!existingVehicle) return void 0;
    const updatedVehicle = { ...existingVehicle, ...vehicle };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }
  async deleteVehicle(id) {
    return this.vehicles.delete(id);
  }
  // Panel operations
  async getPanels() {
    return Array.from(this.panels.values());
  }
  async getPanel(id) {
    return this.panels.get(id);
  }
  async createPanel(panel) {
    const id = this.panelIdCounter++;
    const newPanel = { ...panel, id };
    this.panels.set(id, newPanel);
    return newPanel;
  }
  async updatePanel(id, panel) {
    const existingPanel = this.panels.get(id);
    if (!existingPanel) return void 0;
    const updatedPanel = { ...existingPanel, ...panel };
    this.panels.set(id, updatedPanel);
    return updatedPanel;
  }
  async deletePanel(id) {
    return this.panels.delete(id);
  }
  // Loading plan operations
  async getLoadingPlans() {
    return Array.from(this.loadingPlans.values());
  }
  async getLoadingPlan(id) {
    return this.loadingPlans.get(id);
  }
  async createLoadingPlan(plan) {
    const id = this.loadingPlanIdCounter++;
    const newPlan = { ...plan, id };
    this.loadingPlans.set(id, newPlan);
    return newPlan;
  }
  async deleteLoadingPlan(id) {
    return this.loadingPlans.delete(id);
  }
  // Helper method to find best fitting pallet size for a panel
  findBestFittingPallet(panel, palletSizes) {
    const sortedSizes = [...palletSizes].sort((a, b) => {
      return a.length * a.width - b.length * b.width;
    });
    for (const pallet of sortedSizes) {
      if (pallet.width >= panel.width && pallet.length >= panel.length) {
        return pallet;
      }
    }
    for (const pallet of sortedSizes) {
      if (pallet.width >= panel.length && pallet.length >= panel.width) {
        return pallet;
      }
    }
    const largestPallet = sortedSizes[sortedSizes.length - 1];
    if (largestPallet) {
      return largestPallet;
    }
    return {
      width: panel.width + 100,
      // Add margin
      length: panel.length + 100
      // Add margin
    };
  }
  async calculateLoadingPlan(vehicleId, panels2) {
    console.log("Calculating loading plan for", panels2.length, "panels");
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) {
      throw new Error(`Vehicle with ID ${vehicleId} not found`);
    }
    const vehicleLength = vehicle.length;
    const vehicleWidth = vehicle.width;
    const vehicleHeight = vehicle.height;
    const vehicleMaxPayload = vehicle.maxPayload;
    const vehicleVolume = vehicleLength * vehicleWidth * vehicleHeight / 1e6;
    const enhancedPanels = panels2.map((panel) => {
      const area = panel.width * panel.length / 1e6;
      const totalArea = area * panel.count;
      const totalWeight2 = totalArea * panel.weightPerSqm;
      return {
        ...panel,
        area,
        totalArea,
        totalWeight: totalWeight2
      };
    });
    const palletPositions = [];
    let totalPanelWeight = 0;
    let totalPalletWeight = 0;
    const panelSummary = [];
    for (const panel of enhancedPanels) {
      console.log(`Processing panel: ${panel.color}, ${panel.core}, ${panel.width}x${panel.length}mm, count: ${panel.count}`);
      if (!panel.count || panel.count <= 0) continue;
      const palletSize = this.findBestFittingPallet(panel, PALLET_SIZES);
      if (!palletSize) {
        console.warn(`No suitable pallet found for panel ${panel.id}`);
        continue;
      }
      let maxStackingAmount = 25;
      try {
        let closestWidth = 1e3;
        if (panel.width > 1375) closestWidth = 1500;
        else if (panel.width > 1125) closestWidth = 1250;
        else closestWidth = 1e3;
        const panelLength = panel.length;
        let closestLength = 1999;
        if (panelLength <= 1999) closestLength = 1999;
        else if (panelLength <= 2499) closestLength = 2499;
        else if (panelLength <= 2999) closestLength = 2999;
        else if (panelLength <= 3199) closestLength = 3199;
        else if (panelLength <= 3499) closestLength = 3499;
        else if (panelLength <= 3999) closestLength = 3999;
        else if (panelLength <= 4499) closestLength = 4499;
        else if (panelLength <= 4999) closestLength = 4999;
        else if (panelLength <= 5499) closestLength = 5499;
        else if (panelLength <= 6e3) closestLength = 6e3;
        else closestLength = 6400;
        console.log(`Panel length: ${panelLength}mm kategorize edildi: ${closestLength}mm aral\u0131\u011F\u0131na`);
        console.log(`Using panel core: ${panel.core}, width: ${closestWidth}, length: ${closestLength}`);
        if (panel.core === "PE") {
          if (closestWidth === 1e3) {
            if (closestLength <= 1999) maxStackingAmount = 100;
            else if (closestLength <= 2499) maxStackingAmount = 100;
            else if (closestLength <= 2999) maxStackingAmount = 85;
            else if (closestLength <= 3199) maxStackingAmount = 75;
            else if (closestLength <= 3499) maxStackingAmount = 75;
            else if (closestLength <= 3999) maxStackingAmount = 65;
            else if (closestLength <= 4499) maxStackingAmount = 60;
            else if (closestLength <= 4999) maxStackingAmount = 50;
            else if (closestLength <= 5499) maxStackingAmount = 40;
            else if (closestLength <= 6e3) maxStackingAmount = 30;
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
            else if (closestLength <= 6e3) maxStackingAmount = 30;
            else maxStackingAmount = 25;
          } else {
            if (closestLength <= 1999) maxStackingAmount = 100;
            else if (closestLength <= 2499) maxStackingAmount = 90;
            else if (closestLength <= 2999) maxStackingAmount = 75;
            else if (closestLength <= 3199) maxStackingAmount = 70;
            else if (closestLength <= 3499) maxStackingAmount = 65;
            else if (closestLength <= 3999) maxStackingAmount = 60;
            else if (closestLength <= 4499) maxStackingAmount = 50;
            else if (closestLength <= 4999) maxStackingAmount = 45;
            else if (closestLength <= 5499) maxStackingAmount = 40;
            else if (closestLength <= 6e3) maxStackingAmount = 30;
            else maxStackingAmount = 25;
          }
        } else if (panel.core === "FR") {
          if (closestWidth === 1e3) {
            if (closestLength <= 1999) maxStackingAmount = 90;
            else if (closestLength <= 2499) maxStackingAmount = 80;
            else if (closestLength <= 2999) maxStackingAmount = 70;
            else if (closestLength <= 3199) maxStackingAmount = 65;
            else if (closestLength <= 3499) maxStackingAmount = 60;
            else if (closestLength <= 3999) maxStackingAmount = 50;
            else if (closestLength <= 4499) maxStackingAmount = 45;
            else if (closestLength <= 4999) maxStackingAmount = 40;
            else if (closestLength <= 5499) maxStackingAmount = 35;
            else if (closestLength <= 6e3) maxStackingAmount = 30;
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
            else if (closestLength <= 6e3) maxStackingAmount = 30;
            else maxStackingAmount = 25;
          } else {
            if (closestLength <= 1999) maxStackingAmount = 80;
            else if (closestLength <= 2499) maxStackingAmount = 70;
            else if (closestLength <= 2999) maxStackingAmount = 60;
            else if (closestLength <= 3199) maxStackingAmount = 55;
            else if (closestLength <= 3499) maxStackingAmount = 50;
            else if (closestLength <= 3999) maxStackingAmount = 45;
            else if (closestLength <= 4499) maxStackingAmount = 35;
            else if (closestLength <= 4999) maxStackingAmount = 35;
            else if (closestLength <= 5499) maxStackingAmount = 30;
            else if (closestLength <= 6e3) maxStackingAmount = 25;
            else maxStackingAmount = 20;
          }
        } else if (panel.core === "A2") {
          if (closestWidth === 1e3) {
            if (closestLength <= 1999) maxStackingAmount = 75;
            else if (closestLength <= 2499) maxStackingAmount = 60;
            else if (closestLength <= 2999) maxStackingAmount = 50;
            else if (closestLength <= 3199) maxStackingAmount = 47;
            else if (closestLength <= 3499) maxStackingAmount = 43;
            else if (closestLength <= 3999) maxStackingAmount = 38;
            else if (closestLength <= 4499) maxStackingAmount = 33;
            else if (closestLength <= 4999) maxStackingAmount = 30;
            else if (closestLength <= 5499) maxStackingAmount = 27;
            else if (closestLength <= 6e3) maxStackingAmount = 20;
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
            else if (closestLength <= 5499) maxStackingAmount = 22;
            else if (closestLength <= 6e3) maxStackingAmount = 20;
            else maxStackingAmount = 17;
          } else {
            if (closestLength <= 1999) maxStackingAmount = 50;
            else if (closestLength <= 2499) maxStackingAmount = 40;
            else if (closestLength <= 2999) maxStackingAmount = 33;
            else if (closestLength <= 3199) maxStackingAmount = 31;
            else if (closestLength <= 3499) maxStackingAmount = 29;
            else if (closestLength <= 3999) maxStackingAmount = 25;
            else if (closestLength <= 4499) maxStackingAmount = 22;
            else if (closestLength <= 4999) maxStackingAmount = 20;
            else if (closestLength <= 5499) maxStackingAmount = 18;
            else if (closestLength <= 6e3) maxStackingAmount = 17;
            else maxStackingAmount = 16;
          }
        } else {
          maxStackingAmount = 25;
        }
      } catch (error) {
        console.error(`Error determining max stacking amount for panel ${panel.id}: ${error}`);
        maxStackingAmount = 25;
      }
      const validCount = Math.max(1, panel.count || 1);
      const palletCount = Math.ceil(validCount / maxStackingAmount);
      const countPerPallet = Math.min(validCount, maxStackingAmount);
      const remainingCount = validCount % maxStackingAmount;
      let singlePalletWeight = 0;
      if (panel.width <= 1e3) {
        if (panel.length <= 2e3) singlePalletWeight = 40.91;
        else if (panel.length <= 2500) singlePalletWeight = 46;
        else if (panel.length <= 3e3) singlePalletWeight = 51.09;
        else if (panel.length <= 3500) singlePalletWeight = 56.17;
        else if (panel.length <= 4e3) singlePalletWeight = 61.26;
        else if (panel.length <= 4500) singlePalletWeight = 71.44;
        else if (panel.length <= 5e3) singlePalletWeight = 81.62;
        else if (panel.length <= 5500) singlePalletWeight = 91.79;
        else if (panel.length <= 6e3) singlePalletWeight = 101.97;
        else singlePalletWeight = 112.15;
      } else if (panel.width <= 1250) {
        if (panel.length <= 2e3) singlePalletWeight = 51.14;
        else if (panel.length <= 2500) singlePalletWeight = 57.5;
        else if (panel.length <= 3e3) singlePalletWeight = 63.86;
        else if (panel.length <= 3500) singlePalletWeight = 70.22;
        else if (panel.length <= 4e3) singlePalletWeight = 76.58;
        else if (panel.length <= 4500) singlePalletWeight = 89.3;
        else if (panel.length <= 5e3) singlePalletWeight = 102.02;
        else if (panel.length <= 5500) singlePalletWeight = 114.74;
        else if (panel.length <= 6e3) singlePalletWeight = 127.46;
        else singlePalletWeight = 140.18;
      } else {
        if (panel.length <= 2e3) singlePalletWeight = 61.36;
        else if (panel.length <= 2500) singlePalletWeight = 69;
        else if (panel.length <= 3e3) singlePalletWeight = 76.63;
        else if (panel.length <= 3500) singlePalletWeight = 84.26;
        else if (panel.length <= 4e3) singlePalletWeight = 91.89;
        else if (panel.length <= 4500) singlePalletWeight = 107.16;
        else if (panel.length <= 5e3) singlePalletWeight = 122.42;
        else if (panel.length <= 5500) singlePalletWeight = 137.69;
        else if (panel.length <= 6e3) singlePalletWeight = 152.95;
        else singlePalletWeight = 168.22;
      }
      const netPanelWeight = panel.totalWeight;
      const palletWeight = palletCount * singlePalletWeight;
      const combinedWeight = netPanelWeight + palletWeight;
      totalPanelWeight += netPanelWeight;
      totalPalletWeight += palletWeight;
      panelSummary.push({
        panelId: panel.id,
        color: panel.color,
        core: panel.core,
        width: panel.width,
        length: panel.length,
        count: panel.count,
        palletCount,
        stackPerPallet: countPerPallet,
        netWeight: netPanelWeight,
        palletsWeight: palletWeight,
        totalWeight: combinedWeight
      });
      console.log(`Processing panel: ${panel.color}, ${panel.core}, ${panel.width}x${panel.length}mm, count: ${panel.count}, max stacking: ${maxStackingAmount}`);
      const panelWidthDisplay = panel.width / 10;
      const panelLengthDisplay = panel.length / 10;
      const palletWidthDisplay = Math.ceil(palletSize.width / 10) + 1;
      const palletLengthDisplay = Math.ceil(palletSize.length / 10) + 1;
      const stackHeight = (PALLET_HEIGHT + countPerPallet * panel.thickness) / 10;
      const maxPalletsPerColumn = 6;
      const pyramidColumnCount = Math.ceil(palletCount / maxPalletsPerColumn);
      const pyramidColumns = Array(pyramidColumnCount).fill(0).map(() => []);
      for (let i = 0; i < palletCount; i++) {
        const columnIndex = i % pyramidColumnCount;
        const panelsInThisPallet = i < palletCount - 1 || remainingCount === 0 ? maxStackingAmount : remainingCount;
        pyramidColumns[columnIndex].push({
          index: i,
          count: panelsInThisPallet,
          panelId: panel.id
        });
      }
      const xSpacing = 10;
      let currentX = 0;
      for (let columnIndex = 0; columnIndex < pyramidColumns.length; columnIndex++) {
        const column = pyramidColumns[columnIndex];
        let currentY = 0;
        column.sort((a, b) => b.count - a.count);
        for (let rowIndex = 0; rowIndex < column.length; rowIndex++) {
          const pallet = column[rowIndex];
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
          currentY += panelLengthDisplay + 1;
        }
        currentX += panelWidthDisplay + xSpacing;
      }
    }
    let totalPanelVolume = 0;
    for (const panel of enhancedPanels) {
      const panelVolume = panel.width / 1e3 * (panel.length / 1e3) * (panel.thickness / 1e3) * panel.count;
      totalPanelVolume += panelVolume;
    }
    const usedVolume = totalPanelVolume;
    const totalWeight = totalPanelWeight + totalPalletWeight;
    const volumePercentage = usedVolume / vehicleVolume * 100;
    const weightPercentage = totalWeight / vehicleMaxPayload * 100;
    const requiresMultipleVehicles = volumePercentage > 100 || weightPercentage > 100;
    const vehicleCount = Math.max(
      Math.ceil(volumePercentage / 100),
      Math.ceil(weightPercentage / 100)
    );
    console.log(`Net panel weight: ${totalPanelWeight} kg`);
    console.log(`Pallet weight: ${totalPalletWeight} kg`);
    console.log(`Total gross weight: ${totalWeight} kg`);
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
};
var storage = new MemStorage();

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/vehicles", async (_req, res) => {
    try {
      const vehicles2 = await storage.getVehicles();
      res.json(vehicles2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });
  app2.get("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vehicle ID" });
      }
      const vehicle = await storage.getVehicle(id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicle" });
    }
  });
  app2.post("/api/vehicles", async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(validatedData);
      res.status(201).json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vehicle data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create vehicle" });
    }
  });
  app2.put("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vehicle ID" });
      }
      const validatedData = insertVehicleSchema.partial().parse(req.body);
      const vehicle = await storage.updateVehicle(id, validatedData);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vehicle data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update vehicle" });
    }
  });
  app2.delete("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vehicle ID" });
      }
      const success = await storage.deleteVehicle(id);
      if (!success) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vehicle" });
    }
  });
  app2.get("/api/panels", async (_req, res) => {
    try {
      const panels2 = await storage.getPanels();
      res.json(panels2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch panels" });
    }
  });
  app2.get("/api/panels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid panel ID" });
      }
      const panel = await storage.getPanel(id);
      if (!panel) {
        return res.status(404).json({ message: "Panel not found" });
      }
      res.json(panel);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch panel" });
    }
  });
  app2.post("/api/panels", async (req, res) => {
    try {
      const validatedData = insertPanelSchema.parse(req.body);
      const panel = await storage.createPanel(validatedData);
      res.status(201).json(panel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid panel data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create panel" });
    }
  });
  app2.put("/api/panels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid panel ID" });
      }
      const validatedData = insertPanelSchema.partial().parse(req.body);
      const panel = await storage.updatePanel(id, validatedData);
      if (!panel) {
        return res.status(404).json({ message: "Panel not found" });
      }
      res.json(panel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid panel data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update panel" });
    }
  });
  app2.delete("/api/panels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid panel ID" });
      }
      const success = await storage.deletePanel(id);
      if (!success) {
        return res.status(404).json({ message: "Panel not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete panel" });
    }
  });
  app2.get("/api/loading-plans", async (_req, res) => {
    try {
      const plans = await storage.getLoadingPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch loading plans" });
    }
  });
  app2.get("/api/loading-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid loading plan ID" });
      }
      const plan = await storage.getLoadingPlan(id);
      if (!plan) {
        return res.status(404).json({ message: "Loading plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch loading plan" });
    }
  });
  app2.post("/api/loading-plans", async (req, res) => {
    try {
      const validatedData = insertLoadingPlanSchema.parse(req.body);
      const plan = await storage.createLoadingPlan(validatedData);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid loading plan data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create loading plan" });
    }
  });
  app2.delete("/api/loading-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid loading plan ID" });
      }
      const success = await storage.deleteLoadingPlan(id);
      if (!success) {
        return res.status(404).json({ message: "Loading plan not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete loading plan" });
    }
  });
  app2.post("/api/calculate-loading-plan", async (req, res) => {
    try {
      console.log("Received calculate loading plan request:", req.body);
      const schema = z.object({
        vehicleId: z.number(),
        panels: z.array(z.object({
          id: z.number(),
          color: z.string(),
          core: z.string(),
          width: z.number(),
          length: z.number(),
          thickness: z.number(),
          count: z.number(),
          weightPerSqm: z.number()
        }))
      });
      const processedBody = {
        vehicleId: typeof req.body.vehicleId === "string" ? parseInt(req.body.vehicleId) : req.body.vehicleId,
        panels: req.body.panels || []
      };
      if (Array.isArray(req.body.panelIds) && (!processedBody.panels || processedBody.panels.length === 0)) {
        return res.status(400).json({
          message: "Panel data is required. Please provide the full panel objects, not just panel IDs."
        });
      }
      const validatedData = schema.parse(processedBody);
      if (validatedData.panels.length === 0) {
        return res.status(400).json({ message: "No panels provided" });
      }
      console.log("Validated panels data:", validatedData.panels);
      const loadingPlan = await storage.calculateLoadingPlan(
        validatedData.vehicleId,
        validatedData.panels
      );
      res.json(loadingPlan);
    } catch (error) {
      console.error("Error in calculate-loading-plan endpoint:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to calculate loading plan" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
