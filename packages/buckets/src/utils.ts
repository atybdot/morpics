import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { R2Client } from "./types";

export const getPreSingedUrl = async ({
  keys,
  client,
}: {
  keys: string[];
  client: R2Client;
}) => {
  "use server";
  const results = await Promise.allSettled(
    keys.map(async (key) => {
      const command = new PutObjectCommand({ Bucket: "morpics", Key: key });
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
