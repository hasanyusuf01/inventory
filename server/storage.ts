import { users, devices, type User, type InsertUser, type Device, type InsertDevice, type UpdateDevice } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getDevices(search?: string, statusFilter?: 'all' | 'available' | 'issued'): Promise<Device[]>;
  getDevice(id: number): Promise<Device | undefined>;
  getDeviceByDeviceId(deviceId: string): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: number, device: UpdateDevice): Promise<Device>;
  deleteDevice(id: number): Promise<void>;
  getDeviceStats(): Promise<{
    totalDevices: number;
    availableDevices: number;
    issuedDevices: number;
    addedThisMonth: number;
  }>;
  
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getDevices(search?: string, statusFilter?: 'all' | 'available' | 'issued'): Promise<Device[]> {
    let query = db.select().from(devices);
    
    const conditions = [];
    
    if (search) {
      conditions.push(ilike(devices.deviceId, `%${search}%`));
    }
    
    if (statusFilter === 'available') {
      conditions.push(eq(devices.isIssued, false));
    } else if (statusFilter === 'issued') {
      conditions.push(eq(devices.isIssued, true));
    }
    
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : or(...conditions));
    }
    
    return await query.orderBy(desc(devices.createdAt));
  }

  async getDevice(id: number): Promise<Device | undefined> {
    const [device] = await db.select().from(devices).where(eq(devices.id, id));
    return device || undefined;
  }

  async getDeviceByDeviceId(deviceId: string): Promise<Device | undefined> {
    const [device] = await db.select().from(devices).where(eq(devices.deviceId, deviceId));
    return device || undefined;
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const [device] = await db
      .insert(devices)
      .values(insertDevice)
      .returning();
    return device;
  }

  async updateDevice(id: number, updateDevice: UpdateDevice): Promise<Device> {
    const [device] = await db
      .update(devices)
      .set(updateDevice)
      .where(eq(devices.id, id))
      .returning();
    return device;
  }

  async deleteDevice(id: number): Promise<void> {
    await db.delete(devices).where(eq(devices.id, id));
  }

  async getDeviceStats(): Promise<{
    totalDevices: number;
    availableDevices: number;
    issuedDevices: number;
    addedThisMonth: number;
  }> {
    const allDevices = await db.select().from(devices);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const totalDevices = allDevices.length;
    const availableDevices = allDevices.filter(d => !d.isIssued).length;
    const issuedDevices = allDevices.filter(d => d.isIssued).length;
    const addedThisMonth = allDevices.filter(d => 
      new Date(d.createdAt) >= startOfMonth
    ).length;

    return {
      totalDevices,
      availableDevices,
      issuedDevices,
      addedThisMonth
    };
  }
}

export const storage = new DatabaseStorage();
