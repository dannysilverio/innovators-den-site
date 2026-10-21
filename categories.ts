import { pgTable, text } from "drizzle-orm/pg-core";

/** Editorial branding belongs to a category, not individual articles. */
export const categoriesTable = pgTable("categories", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull().unique(),
  subBrand: text("sub_brand"),
});
