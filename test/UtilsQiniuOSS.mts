import assert from "node:assert/strict";
import test from "node:test";

import {
  parseEnvFiles,
  getDirname,
  getFilePath,
  joinPath,
  getConfigFromQiniuOSS,
  getMacFromQiniuOSS,
  uploadLocalFileToQiniuOSS,
  getBucketManagerFromQiniuOSS,
  getPublicDownloadUrlFromQiniuOSS,
} from "#src/index";

const __dirname = getDirname(import.meta.url);

parseEnvFiles([joinPath(__dirname, "../.env.local")]);

const {
  QINIU_ACCESS_KEY,
  QINIU_SECRET_KEY,
  QINIU_BUCKET_NAME,
  QINIU_ZONE_NAME,
  QINIU_PUBLIC_BUCKET_DOMAIN,
} = process.env;

const KEY_PREFIX = "nsuite";

test("Qiniu environment variables should be defined for testing", () => {
  assert.strictEqual(typeof QINIU_ACCESS_KEY, "string");
  assert.strictEqual(typeof QINIU_SECRET_KEY, "string");
  assert.strictEqual(typeof QINIU_BUCKET_NAME, "string");
  assert.strictEqual(typeof QINIU_ZONE_NAME, "string");
  assert.strictEqual(typeof QINIU_PUBLIC_BUCKET_DOMAIN, "string");
});

test("Upload current file", async () => {
  const currentFilePath = getFilePath(import.meta.url);
  const config = getConfigFromQiniuOSS({});
  const mac = getMacFromQiniuOSS({
    accessKey: QINIU_ACCESS_KEY,
    secretKey: QINIU_SECRET_KEY,
  });
  const key = `${KEY_PREFIX}/single`;
  const baseUrl = QINIU_PUBLIC_BUCKET_DOMAIN;
  const finalUrl = `${baseUrl}/${key}`;
  const res = await uploadLocalFileToQiniuOSS({
    config,
    mac,
    localPath: currentFilePath,
    key,
    baseUrl,
    bucket: QINIU_BUCKET_NAME,
    putPolicyOptions: {},
  });
  assert.strictEqual(typeof res, "object");
  assert.strictEqual(res.key, key);
  assert.strictEqual(typeof res.etag, "string");
  assert.strictEqual(res.etag.length > 0, true);
  assert.strictEqual(res.fileSize > 0, true);
  assert.strictEqual(res.bucket, QINIU_BUCKET_NAME);
  assert.strictEqual(res.name, "null");
  assert.strictEqual(res.url, finalUrl);

  const bucketManager = getBucketManagerFromQiniuOSS({
    config,
    mac,
  });
  const downloadUrl = getPublicDownloadUrlFromQiniuOSS({
    bucketManager,
    key,
    baseUrl,
  });
  assert.strictEqual(downloadUrl, finalUrl);
});
