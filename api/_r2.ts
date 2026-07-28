// Cloudflare R2 (S3-compatible) — used for video uploads, which are too
// large to route through a Vercel function's request body limit. The
// browser uploads directly to R2 via a short-lived presigned URL; our
// backend never sees the file bytes.
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let _client: S3Client | null = null;

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Set ${name} as an environment variable (Cloudflare dashboard -> R2 -> your bucket).`);
  return v;
}

function client(): S3Client {
  if (_client) return _client;
  _client = new S3Client({
    region: 'auto',
    endpoint: `https://${env('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env('R2_ACCESS_KEY_ID'),
      secretAccessKey: env('R2_SECRET_ACCESS_KEY'),
    },
  });
  return _client;
}

function bucket(): string {
  return env('R2_BUCKET_NAME');
}

function publicUrlBase(): string {
  return env('R2_PUBLIC_URL').replace(/\/$/, '');
}

export async function createUploadUrl(path: string, contentType: string): Promise<{ uploadUrl: string; publicUrl: string }> {
  const command = new PutObjectCommand({ Bucket: bucket(), Key: path, ContentType: contentType });
  const uploadUrl = await getSignedUrl(client(), command, { expiresIn: 300 });
  return { uploadUrl, publicUrl: `${publicUrlBase()}/${path}` };
}

export async function deleteObject(path: string): Promise<void> {
  await client().send(new DeleteObjectCommand({ Bucket: bucket(), Key: path }));
}
