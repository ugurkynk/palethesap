import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString('tr-TR', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  });
}

export function calculatePanelArea(width: number, length: number): number {
  const widthInMeters = width / 1000; // Convert mm to m
  const lengthInMeters = length / 1000; // Convert mm to m
  return widthInMeters * lengthInMeters;
}

export function calculatePanelWeight(area: number, weightPerSqm: number): number {
  return area * weightPerSqm;
}

export function calculateVehicleVolume(length: number, width: number, height: number): number {
  const lengthInMeters = length / 100; // Convert cm to m
  const widthInMeters = width / 100; // Convert cm to m
  const heightInMeters = height / 100; // Convert cm to m
  return lengthInMeters * widthInMeters * heightInMeters;
}

export function calculateFloorArea(length: number, width: number): number {
  const lengthInMeters = length / 100; // Convert cm to m
  const widthInMeters = width / 100; // Convert cm to m
  return lengthInMeters * widthInMeters;
}

// Get color hex for panel visualization based on panel color name
export function getPanelColorHex(colorName: string): string {
  // Map common RAL color names to hex values
  const colorMap: Record<string, string> = {
    "RAL 9016": "#f1f1f1", // Traffic White
    "RAL 9010": "#ffffff", // Pure White
    "RAL 9006": "#a5a5a5", // White Aluminium
    "RAL 9005": "#0a0a0a", // Jet Black
    "RAL 5010": "#0e294b", // Gentian Blue
    "RAL 5013": "#1e213d", // Cobalt Blue
    "RAL 3020": "#cc0605", // Traffic Red
    "RAL 6005": "#2f4538", // Moss Green
    "RAL 7016": "#292c2f", // Anthracite Grey
    "RAL 7035": "#cbd0cc", // Light Grey
    "RAL 1023": "#fad201", // Traffic Yellow
  };

  // Try to match the color name to our map
  for (const [key, value] of Object.entries(colorMap)) {
    if (colorName.toUpperCase().includes(key)) {
      return value;
    }
  }

  // Default color for unknown codes
  return "#b9d9eb"; // Light blue as default
}

// Utility to handle file download
export function downloadJsonFile(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Predefined vehicle types
export const vehicleTypes = [
  {
    value: "custom",
    label: "Özel Ölçüler",
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
      maxPayload: 0
    }
  },
  {
    value: "20ft_container",
    label: "20\" konteyner (5.90m x 2.35m x 2.39m)",
    dimensions: {
      length: 590,
      width: 235,
      height: 239,
      maxPayload: 28000
    }
  },
  {
    value: "40ft_container",
    label: "40\" konteyner (12.03m x 2.35m x 2.39m)",
    dimensions: {
      length: 1203,
      width: 235,
      height: 239,
      maxPayload: 26000
    }
  },
  {
    value: "40ft_hc_container",
    label: "40\" high cube konteyner (12.03m x 2.35m x 2.69m)",
    dimensions: {
      length: 1203,
      width: 235,
      height: 269,
      maxPayload: 26000
    }
  },
  {
    value: "standard_truck",
    label: "TIR (13.60m x 2.45m x 2.70m)",
    dimensions: {
      length: 1360,
      width: 245,
      height: 270,
      maxPayload: 26000
    }
  }
];
