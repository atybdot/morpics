import { env } from "cloudflare:workers";
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema/index";

// neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

const sql = neon(env.DATABASE_URL || "");
export const db = drizzle(sql, { schema });
