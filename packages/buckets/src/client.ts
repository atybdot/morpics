import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config({ path: "../../../apps/server/.env" });
export const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.CF_ACCESS_KEY as string,
    secretAccessKey: process.env.CF_SECRECT_KEY as string,
  },
});
