import crypto from "node:crypto";
import { isCloudinaryConfigured, serverEnv } from "./env";

export function createCloudinaryUploadSignature(folder = "book_covers") {
  if (!isCloudinaryConfigured()) {
    return {
      configured: false as const,
      cloudName: null,
      apiKey: null,
      timestamp: null,
      signature: null,
      folder,
    };
  }

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${serverEnv.cloudinaryApiSecret}`;
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign)
    .digest("hex");

  return {
    configured: true as const,
    cloudName: serverEnv.cloudinaryCloudName,
    apiKey: serverEnv.cloudinaryApiKey,
    timestamp,
    signature,
    folder,
  };
}
