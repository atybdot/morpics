import { env } from "cloudflare:workers";
import { S3Client } from "@aws-sdk/client-s3";
export const r2Bucket = env.IMAGES;
export const r2Client = new S3Client({
  region: "auto",
  endpoint: env.S3_ENDPOINT as string,
  credentials: {
    accessKeyId: env.CF_ACCESS_KEY as string,
    secretAccessKey: env.CF_SECRECT_KEY as string,
  },
});
