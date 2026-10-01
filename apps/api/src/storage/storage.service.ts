import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  NotFound,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Env } from '../config/env';

const UPLOAD_URL_TTL_SECONDS = 5 * 60;
const DOWNLOAD_URL_TTL_SECONDS = 60 * 60;

/**
 * Private bucket; clients only ever get short-lived presigned URLs.
 * Two clients because the host is part of the signature: the API reaches S3 at S3_ENDPOINT,
 * devices at S3_PUBLIC_ENDPOINT (e.g. 10.0.2.2 on the Android emulator). With real S3 both are
 * the AWS endpoint.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly internal: S3Client;
  private readonly signer: S3Client;
  private readonly bucket: string;

  constructor(config: ConfigService<Env, true>) {
    const client = (endpoint: string) =>
      new S3Client({
        endpoint,
        region: config.get('S3_REGION', { infer: true }),
        credentials: {
          accessKeyId: config.get('S3_ACCESS_KEY', { infer: true }),
          secretAccessKey: config.get('S3_SECRET_KEY', { infer: true }),
        },
        // SeaweedFS/MinIO serve buckets as a path, not a subdomain.
        forcePathStyle: true,
        // Otherwise the SDK signs a CRC32 of the (empty) body into presigned PUT URLs, and every
        // real upload fails with BadDigest. The device's file isn't known when we presign.
        requestChecksumCalculation: 'WHEN_REQUIRED',
      });
    this.internal = client(config.get('S3_ENDPOINT', { infer: true }));
    this.signer = client(config.get('S3_PUBLIC_ENDPOINT', { infer: true }));
    this.bucket = config.get('S3_BUCKET', { infer: true });
  }

  /** The device PUTs the file here with the same Content-Type header. */
  async presignPut(key: string, contentType: string) {
    const uploadUrl = await getSignedUrl(
      this.signer,
      new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType }),
      { expiresIn: UPLOAD_URL_TTL_SECONDS },
    );
    return { uploadUrl, expiresInSeconds: UPLOAD_URL_TTL_SECONDS };
  }

  presignGet(key: string): Promise<string> {
    return getSignedUrl(this.signer, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
      expiresIn: DOWNLOAD_URL_TTL_SECONDS,
    });
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.internal.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch (error) {
      if (error instanceof NotFound) return false;
      throw error;
    }
  }

  /** Best effort: a leftover object costs storage, not correctness, so failures are only logged. */
  async deleteQuietly(key: string): Promise<void> {
    try {
      await this.internal.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    } catch (error) {
      this.logger.warn(
        `Failed to delete ${key}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
