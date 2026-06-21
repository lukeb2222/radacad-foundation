import type { Express } from "express";
import { ENV } from "./env";

/**
 * Storage proxy middleware.
 * On Manus hosting: proxies /manus-storage/* through the Forge presigned URL service.
 * On Railway (no BUILT_IN_FORGE_API_URL): returns 404 with a helpful message.
 * Images should be hosted via a CDN or uploaded as static assets for Railway.
 */
export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    // If Manus Forge is configured, proxy through it
    if (ENV.forgeApiUrl && ENV.forgeApiKey) {
      try {
        const forgeUrl = new URL(
          "v1/storage/presign/get",
          ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
        );
        forgeUrl.searchParams.set("path", key);

        const forgeResp = await fetch(forgeUrl, {
          headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
        });

        if (!forgeResp.ok) {
          const body = await forgeResp.text().catch(() => "");
          console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
          res.status(502).send("Storage backend error");
          return;
        }

        const { url } = (await forgeResp.json()) as { url: string };
        if (!url) {
          res.status(502).send("Empty signed URL from backend");
          return;
        }

        res.set("Cache-Control", "no-store");
        res.redirect(307, url);
        return;
      } catch (err) {
        console.error("[StorageProxy] failed:", err);
        res.status(502).send("Storage proxy error");
        return;
      }
    }

    // No Manus Forge configured (Railway deployment)
    console.warn(`[StorageProxy] No storage backend configured for key: ${key}`);
    res.status(404).send("Asset not available — storage not configured");
  });
}
