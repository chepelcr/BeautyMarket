import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { provinces, cantons, districts } from "../entities/Location";

export const insertProvinceSchema = createInsertSchema(provinces).omit({
  createdAt: true,
});

export const insertCantonSchema = createInsertSchema(cantons).omit({
  createdAt: true,
});

export const insertDistrictSchema = createInsertSchema(districts).omit({
  createdAt: true,
});

export type InsertProvince = z.infer<typeof insertProvinceSchema>;
export type InsertCanton = z.infer<typeof insertCantonSchema>;
export type InsertDistrict = z.infer<typeof insertDistrictSchema>;
