import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertVehicleSchema, 
  insertPanelSchema, 
  insertLoadingPlanSchema,
  Vehicle,
  Panel,
  LoadingPlan
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Vehicles API
  app.get("/api/vehicles", async (_req: Request, res: Response) => {
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/:id", async (req: Request, res: Response) => {
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

  app.post("/api/vehicles", async (req: Request, res: Response) => {
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

  app.put("/api/vehicles/:id", async (req: Request, res: Response) => {
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

  app.delete("/api/vehicles/:id", async (req: Request, res: Response) => {
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

  // Panels API
  app.get("/api/panels", async (_req: Request, res: Response) => {
    try {
      const panels = await storage.getPanels();
      res.json(panels);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch panels" });
    }
  });

  app.get("/api/panels/:id", async (req: Request, res: Response) => {
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

  app.post("/api/panels", async (req: Request, res: Response) => {
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

  app.put("/api/panels/:id", async (req: Request, res: Response) => {
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

  app.delete("/api/panels/:id", async (req: Request, res: Response) => {
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

  // Loading Plans API
  app.get("/api/loading-plans", async (_req: Request, res: Response) => {
    try {
      const plans = await storage.getLoadingPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch loading plans" });
    }
  });

  app.get("/api/loading-plans/:id", async (req: Request, res: Response) => {
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

  app.post("/api/loading-plans", async (req: Request, res: Response) => {
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

  app.delete("/api/loading-plans/:id", async (req: Request, res: Response) => {
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

  // Calculate loading plan
  app.post("/api/calculate-loading-plan", async (req: Request, res: Response) => {
    try {
      console.log('Received calculate loading plan request:', req.body);
      
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
      
      // Process the request body
      const processedBody = {
        vehicleId: typeof req.body.vehicleId === 'string' ? parseInt(req.body.vehicleId) : req.body.vehicleId,
        panels: req.body.panels || []
      };
      
      // If panels array is not provided but panelIds is, we need to use the actual panel data
      if (Array.isArray(req.body.panelIds) && (!processedBody.panels || processedBody.panels.length === 0)) {
        // We need the full panel data, not just IDs
        return res.status(400).json({ 
          message: "Panel data is required. Please provide the full panel objects, not just panel IDs." 
        });
      }
      
      // Validate request data
      const validatedData = schema.parse(processedBody);
      
      if (validatedData.panels.length === 0) {
        return res.status(400).json({ message: "No panels provided" });
      }
      
      console.log('Validated panels data:', validatedData.panels);
      
      // Pass the full panel objects to the calculation function
      const loadingPlan = await storage.calculateLoadingPlan(
        validatedData.vehicleId,
        validatedData.panels
      );
      
      res.json(loadingPlan);
    } catch (error) {
      console.error('Error in calculate-loading-plan endpoint:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Failed to calculate loading plan" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
