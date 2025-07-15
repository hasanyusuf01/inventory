import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertDeviceSchema, updateDeviceSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Device routes
  app.get("/api/devices", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { search, status } = req.query;
    const devices = await storage.getDevices(
      search as string,
      status as 'all' | 'available' | 'issued'
    );
    res.json(devices);
  });

  app.get("/api/devices/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const stats = await storage.getDeviceStats();
    res.json(stats);
  });

  app.post("/api/devices", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const deviceData = insertDeviceSchema.parse(req.body);
      
      // Check if device ID already exists
      const existingDevice = await storage.getDeviceByDeviceId(deviceData.deviceId);
      if (existingDevice) {
        return res.status(400).json({ message: "Device ID already exists" });
      }
      
      const device = await storage.createDevice(deviceData);
      res.status(201).json(device);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid device data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create device" });
    }
  });

  app.patch("/api/devices/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const deviceId = parseInt(req.params.id);
      const updateData = updateDeviceSchema.parse(req.body);
      
      const device = await storage.getDevice(deviceId);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      const updatedDevice = await storage.updateDevice(deviceId, updateData);
      res.json(updatedDevice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid device data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update device" });
    }
  });

  app.delete("/api/devices/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const deviceId = parseInt(req.params.id);
      
      const device = await storage.getDevice(deviceId);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      await storage.deleteDevice(deviceId);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete device" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
