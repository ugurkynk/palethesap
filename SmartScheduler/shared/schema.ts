import { pgTable, text, serial, integer, boolean, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Vehicle types
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  length: doublePrecision("length").notNull(), // Length in centimeters
  width: doublePrecision("width").notNull(), // Width in centimeters
  height: doublePrecision("height").notNull(), // Height in centimeters
  maxPayload: doublePrecision("max_payload").notNull(), // Maximum payload in kilograms
});

export const insertVehicleSchema = createInsertSchema(vehicles).pick({
  name: true,
  length: true,
  width: true,
  height: true,
  maxPayload: true,
});

// Panel data
export const panels = pgTable("panels", {
  id: serial("id").primaryKey(),
  color: text("color").notNull(),
  core: text("core").notNull(), // PE, FR, A2
  width: doublePrecision("width").notNull(), // Width in millimeters
  length: doublePrecision("length").notNull(), // Length in millimeters
  thickness: doublePrecision("thickness").notNull(), // Thickness in millimeters
  count: integer("count").notNull(),
  weightPerSqm: doublePrecision("weight_per_sqm").notNull(), // Weight per square meter in kilograms
});

export const insertPanelSchema = createInsertSchema(panels).pick({
  color: true,
  core: true,
  width: true,
  length: true,
  thickness: true,
  count: true,
  weightPerSqm: true,
});

// Loading plan data
export const loadingPlans = pgTable("loading_plans", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  totalVolume: doublePrecision("total_volume").notNull(), // Total volume in cubic meters
  usedVolume: doublePrecision("used_volume").notNull(), // Used volume in cubic meters
  totalWeight: doublePrecision("total_weight").notNull(), // Total weight in kilograms
  planData: jsonb("plan_data").notNull(), // JSON data for the loading plan visualization
  createdAt: doublePrecision("created_at").notNull(),
});

export const insertLoadingPlanSchema = createInsertSchema(loadingPlans).pick({
  vehicleId: true,
  totalVolume: true,
  usedVolume: true,
  totalWeight: true,
  planData: true,
  createdAt: true,
});

// Types
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

export type InsertPanel = z.infer<typeof insertPanelSchema>;
export type Panel = typeof panels.$inferSelect;

export type InsertLoadingPlan = z.infer<typeof insertLoadingPlanSchema>;
export type LoadingPlan = typeof loadingPlans.$inferSelect;

// Additional types needed for the app
export type PanelData = Panel & {
  area: number; // Square meters
  totalArea: number; // Square meters
  totalWeight: number; // Kilograms
};

// Standard pallet sizes in mm based on provided data
export const PALLET_SIZES = [
  // En: 1000mm paletler
  { length: 2010, width: 1000 },
  { length: 2260, width: 1000 },
  { length: 2510, width: 1000 },
  { length: 2760, width: 1000 },
  { length: 3010, width: 1000 },
  { length: 3210, width: 1000 },
  { length: 3510, width: 1000 },
  { length: 3760, width: 1000 },
  { length: 4010, width: 1000 },
  { length: 4260, width: 1000 },
  { length: 4510, width: 1000 },
  { length: 4760, width: 1000 },
  { length: 5010, width: 1000 },
  { length: 5260, width: 1000 },
  { length: 5510, width: 1000 },
  { length: 5760, width: 1000 },
  { length: 6010, width: 1000 },
  { length: 6260, width: 1000 },
  { length: 6410, width: 1000 },
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

// Standard pallet height
export const PALLET_HEIGHT = 200; // mm

// Maximum panel stacking amounts by core type, panel width and panel length
export const PANEL_STACKING_AMOUNTS = {
  // PE CORE
  PE: {
    1000: { // Panel width
      1999: 100, // Panel length : Max amount
      2499: 100,
      2999: 85,
      3199: 75,
      3499: 75,
      3999: 65,
      4499: 60,
      4999: 50,
      5499: 40,
      6000: 30,
      6400: 25
    },
    1250: { // Panel width
      1999: 100, // Panel length : Max amount
      2499: 90,
      2999: 80,
      3199: 75,
      3499: 75,
      3999: 60,
      4499: 50,
      4999: 45,
      5499: 40,
      6000: 30,
      6400: 25
    },
    1500: { // Panel width
      1999: 100, // Panel length : Max amount
      2499: 90,
      2999: 75,
      3199: 70,
      3499: 65,
      3999: 60,
      4499: 50,
      4999: 45,
      5499: 40,
      6000: 30,
      6400: 25
    }
  },
  // FR CORE
  FR: {
    1000: { // Panel width
      1999: 90, // Panel length : Max amount
      2499: 80,
      2999: 70,
      3199: 65,
      3499: 60,
      3999: 50,
      4499: 45,
      4999: 40,
      5499: 35,
      6000: 30,
      6400: 25
    },
    1250: { // Panel width
      1999: 90, // Panel length : Max amount
      2499: 80,
      2999: 70,
      3199: 65,
      3499: 60,
      3999: 50,
      4499: 45,
      4999: 40,
      5499: 35,
      6000: 30,
      6400: 25
    },
    1500: { // Panel width
      1999: 80, // Panel length : Max amount
      2499: 70,
      2999: 60,
      3199: 55,
      3499: 50,
      3999: 45,
      4499: 35,
      4999: 35,
      5499: 30,
      6000: 25,
      6400: 20
    }
  },
  // A2 CORE
  A2: {
    1000: { // Panel width
      1999: 75, // Panel length : Max amount
      2499: 60,
      2999: 50,
      3199: 47,
      3499: 43,
      3999: 38,
      4499: 33,
      4999: 30,
      5499: 27,
      6000: 20,
      6400: 17
    },
    1250: { // Panel width
      1999: 60, // Panel length : Max amount
      2499: 48,
      2999: 40,
      3199: 38,
      3499: 34,
      3999: 30,
      4499: 27,
      4999: 24,
      5499: 22,
      6000: 20,
      6400: 17
    },
    1500: { // Panel width
      1999: 50, // Panel length : Max amount
      2499: 40,
      2999: 33,
      3199: 31,
      3499: 29,
      3999: 25,
      4499: 22,
      4999: 20,
      5499: 18,
      6000: 17,
      6400: 16
    }
  }
};

export type PalletPosition = {
  x: number;
  y: number;
  width: number;
  height: number;
  panelId: number;
  stackHeight: number;
  count: number;
  palletLength: number; // Length of the pallet
  palletWidth: number;  // Width of the pallet
  palletWeight: number; // Weight of the empty pallet in kg
};

export type LoadingPlanData = {
  pallets: PalletPosition[];
  vehicleLength: number;
  vehicleWidth: number;
  vehicleHeight: number;
  usedVolume: number;
  totalVolume: number;
  netWeight: number;   // Yalnızca panellerin ağırlığı
  palletsWeight: number; // Boş paletlerin toplam ağırlığı
  totalWeight: number; // Brüt ağırlık (paneller + paletler)
  volumePercentage: number;
  weightPercentage: number;
  requiresMultipleVehicles: boolean;
  vehicleCount: number;
  panelSummary: {
    panelId: number;
    color: string;
    core: string;
    width: number;
    length: number;
    count: number;
    palletCount: number; // Gereken toplam palet sayısı
    stackPerPallet: number; // Her palete kaç panel sığıyor
    netWeight: number; // Panellerin net ağırlığı
    palletsWeight: number; // Paletlerin ağırlığı
    totalWeight: number; // Brüt ağırlık (paneller + paletler)
  }[];
};

export type VehicleType = {
  value: string;
  label: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    maxPayload: number;
  };
};
