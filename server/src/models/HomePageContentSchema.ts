import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { homePageContent } from "../entities/HomePageContent";

export const insertHomePageContentSchema = createInsertSchema(homePageContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertHomePageContent = z.infer<typeof insertHomePageContentSchema>;
