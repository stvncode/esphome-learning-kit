import { S3Client } from "bun";

/**
 * Cloudflare R2 client, built from the S3-compatible endpoint + API token keys.
 *
 * `S3_API` is the R2 endpoint with the bucket as its first path segment, e.g.
 * `https://<account>.r2.cloudflarestorage.com/esphome-learning`. The S3 client
 * wants those split apart, so we parse the bucket out of the path.
 *
 * Returns `null` when storage isn't configured so routes can fail gracefully
 * (e.g. local dev without R2 credentials) instead of throwing at import time.
 */
function createS3(): S3Client | null {
  const raw = process.env.S3_API;
  const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
  if (!raw || !accessKeyId || !secretAccessKey) return null;

  const url = new URL(raw);
  const bucket = url.pathname.replace(/^\/+/, "").split("/")[0];
  if (!bucket) return null;

  return new S3Client({
    endpoint: `${url.protocol}//${url.host}`,
    bucket,
    accessKeyId,
    secretAccessKey,
  });
}

export const s3 = createS3();

/** Object key for a user's avatar. Stable per user, so re-uploads overwrite. */
export const avatarKey = (userId: string): string => `avatars/${userId}`;

/**
 * Backend's own public base URL — it serves the avatar proxy route, so stored
 * `user.image` links must point here (not at the frontend or R2 directly).
 */
export const backendUrl = (): string =>
  (process.env.BETTER_AUTH_URL ?? "http://localhost:3001").replace(/\/+$/, "");
