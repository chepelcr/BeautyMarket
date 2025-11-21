import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { preDeployments } from "../entities/PreDeployment";

export const insertPreDeploymentSchema = createInsertSchema(preDeployments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPreDeployment = z.infer<typeof insertPreDeploymentSchema>;
