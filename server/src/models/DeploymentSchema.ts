import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { deploymentHistory } from "../entities/Deployment";

export const insertDeploymentHistorySchema = createInsertSchema(deploymentHistory).omit({
  id: true,
  startedAt: true,
});

export type InsertDeploymentHistory = z.infer<typeof insertDeploymentHistorySchema>;
