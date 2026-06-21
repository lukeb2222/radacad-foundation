/**
 * Storage helpers — Railway-compatible.
 *
 * On Manus hosting: uses the Forge presigned URL service (BUILT_IN_FORGE_API_URL + BUILT_IN_FORGE_API_KEY).
 * On Railway with AWS S3: uses AWS_S3_BUCKET + AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY + AWS_REGION.
 * If neither is configured, storagePut throws a clear error so the caller knows to configure storage.
 */

import { ENV } from "./_core/env";

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

// ── Manus Forge path ────────────────────────────────────────────────────────

async function storagePutForge(
  key: string,
  data: Buffer | Uint8Array | string,
  contentType: string,
): Promise<{ key: string; url: string }> {
  const forgeUrl = ENV.forgeApiUrl.replace(/\/+$/, "");
  const forgeKey = ENV.forgeApiKey;

  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl.searchParams.set("path", key);

  const presignResp = await fetch(presignUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` },
  });

  if (!presignResp.ok) {
    const msg = await presignResp.text().catch(() => presignResp.statusText);
    throw new Error(`Storage presign failed (${presignResp.status}): ${msg}`);
  }

  const { url: s3Url } = (await presignResp.json()) as { url: string };
  if (!s3Url) throw new Error("Forge returned empty presign URL");

  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as unknown as BlobPart], { type: contentType });

  const uploadResp = await fetch(s3Url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });

  if (!uploadResp.ok) {
    throw new Error(`Storage upload to S3 failed (${uploadResp.status})`);
  }

  return { key, url: `/manus-storage/${key}` };
}

// ── AWS S3 path ──────────────────────────────────────────────────────────────

async function storagePutS3(
  key: string,
  data: Buffer | Uint8Array | string,
  contentType: string,
): Promise<{ key: string; url: string }> {
  // Dynamic import so the package is only required when AWS is configured
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

  const bucket = process.env.AWS_S3_BUCKET!;
  const region = process.env.AWS_REGION ?? "us-east-1";

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const body = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  return { key, url };
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));

  // Manus Forge takes priority (Manus hosting)
  if (ENV.forgeApiUrl && ENV.forgeApiKey) {
    return storagePutForge(key, data, contentType);
  }

  // AWS S3 (Railway or any cloud deployment)
  if (
    process.env.AWS_S3_BUCKET &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
  ) {
    return storagePutS3(key, data, contentType);
  }

  throw new Error(
    "File storage is not configured. Set AWS_S3_BUCKET + AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY, " +
    "or BUILT_IN_FORGE_API_URL + BUILT_IN_FORGE_API_KEY.",
  );
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  // If AWS S3 is configured, return a direct public URL
  if (process.env.AWS_S3_BUCKET) {
    const region = process.env.AWS_REGION ?? "us-east-1";
    const bucket = process.env.AWS_S3_BUCKET;
    return { key, url: `https://${bucket}.s3.${region}.amazonaws.com/${key}` };
  }

  // Fall back to Manus storage path
  return { key, url: `/manus-storage/${key}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = normalizeKey(relKey);

  // Manus Forge
  if (ENV.forgeApiUrl && ENV.forgeApiKey) {
    const getUrl = new URL("v1/storage/presign/get", ENV.forgeApiUrl.replace(/\/+$/, "") + "/");
    getUrl.searchParams.set("path", key);

    const resp = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
    });

    if (!resp.ok) {
      const msg = await resp.text().catch(() => resp.statusText);
      throw new Error(`Storage signed URL failed (${resp.status}): ${msg}`);
    }

    const { url } = (await resp.json()) as { url: string };
    return url;
  }

  // AWS S3 presigned URL
  if (
    process.env.AWS_S3_BUCKET &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
  ) {
    const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

    const region = process.env.AWS_REGION ?? "us-east-1";
    const client = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    return getSignedUrl(client, new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key }), { expiresIn: 3600 });
  }

  // No storage configured — return the path as-is
  return `/manus-storage/${key}`;
}
