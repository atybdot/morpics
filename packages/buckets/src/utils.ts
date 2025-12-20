import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { R2Client } from "./types";

export const generatePresingedURL = async ({
  keys,
  client,
  metadata,
  bucketName,
}: {
  keys: string[];
  client: R2Client;
  metadata: { orgId: string; userId: string };
  bucketName: string;
}) => {
  const results = await Promise.allSettled(
    keys.map(async (key) => {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      return {
        key,
        url: await getSignedUrl(client, command, {
          expiresIn: 3600,
        }),
      };
    }),
  );
  const successfulUrls = results
    .filter(
      (
        result,
      ): result is PromiseFulfilledResult<{ key: string; url: string }> =>
        result.status === "fulfilled",
    )
    .map((result) => result.value);

  return { urls: successfulUrls };
};
export const toSlug = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};
