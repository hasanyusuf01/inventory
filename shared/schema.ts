import { pgTable, text, serial, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull().unique(),
  dateAdded: date("date_added").notNull().defaultNow(),
  isIssued: boolean("is_issued").notNull().default(false),
  issuedTo: text("issued_to"),
  dateIssued: date("date_issued"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDeviceSchema = createInsertSchema(devices).pick({
  deviceId: true,
  dateAdded: true,
  isIssued: true,
  issuedTo: true,
  dateIssued: true,
});

export const updateDeviceSchema = createInsertSchema(devices).pick({
  isIssued: true,
  issuedTo: true,
  dateIssued: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type UpdateDevice = z.infer<typeof updateDeviceSchema>;
export type Device = typeof devices.$inferSelect;
