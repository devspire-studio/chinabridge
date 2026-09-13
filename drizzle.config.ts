import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: ["./src/db/schema.ts", "./src/db/auth-schema.ts"],
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://8a8d693dfd62eed1754e9dcef139128931699a05c70a6d7571b6e973757372ff:sk__39MJDAhnUhMp5ejM6htw@pooled.db.prisma.io:5432/postgres?sslmode=require",
  },
  verbose: true,
  strict: false,
});
