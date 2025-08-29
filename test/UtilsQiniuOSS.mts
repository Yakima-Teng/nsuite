import { basename } from "node:path";
import assert from "node:assert/strict";
import test from "node:test";

import {
  logError,
  attachLogToFunc,
  parseEnvFiles,
  getDirname,
  getFilePath,
  joinPath,
  getConfigFromQiniuOSS,
  getMacFromQiniuOSS,
  uploadLocalFileToQiniuOSS,
  uploadDirToQiniuOSS,
  getBucketManagerFromQiniuOSS,
  getPublicDownloadUrlFromQiniuOSS,
  deleteRemotePathListFromQiniuOSS,
} from "#lib/index";

const __dirname = getDirname(import.meta.url);

parseEnvFiles([joinPath(__dirname, "../../aimian/.env")]);

process.env.QINIU_HTTP_CLIENT_TIMEOUT = "120000";

const {
  QINIU_ACCESS_KEY = "",
  QINIU_SECRET_KEY = "",
  QINIU_BUCKET_NAME = "",
  QINIU_ZONE_NAME = "",
  QINIU_PUBLIC_BUCKET_DOMAIN = "",
} = process.env;

const KEY_PREFIX = "nsuite";
const baseUrl = QINIU_PUBLIC_BUCKET_DOMAIN;
const currentFilePath = getFilePath(import.meta.url);
const currentFileName = basename(currentFilePath);
const config = getConfigFromQiniuOSS({});
const mac = getMacFromQiniuOSS({
  accessKey: QINIU_ACCESS_KEY,
  secretKey: QINIU_SECRET_KEY,
});
const bucketManager = getBucketManagerFromQiniuOSS({
  config,
  mac,
});

const deleteRemoteTempFiles = async () => {
  return await attachLogToFunc(deleteRemotePathListFromQiniuOSS)({
    bucketManager,
    bucket: QINIU_BUCKET_NAME,
    remotePathList: [KEY_PREFIX],
  });
};

test("Qiniu environment variables should be defined for testing", () => {
  assert.strictEqual(typeof QINIU_ACCESS_KEY, "string");
  assert.strictEqual(typeof QINIU_SECRET_KEY, "string");
  assert.strictEqual(typeof QINIU_BUCKET_NAME, "string");
  assert.strictEqual(typeof QINIU_ZONE_NAME, "string");
  assert.strictEqual(typeof QINIU_PUBLIC_BUCKET_DOMAIN, "string");
  assert.ok(QINIU_ACCESS_KEY.length > 0);
  assert.ok(QINIU_SECRET_KEY.length > 0);
  assert.ok(QINIU_BUCKET_NAME.length > 0);
  assert.ok(QINIU_ZONE_NAME.length > 0);
  assert.ok(QINIU_PUBLIC_BUCKET_DOMAIN.length > 0);
});

test("Upload current file and then delete it successfully", async () => {
  await deleteRemoteTempFiles();

  const key = `${KEY_PREFIX}/single`;
  const finalUrl = `${baseUrl}/${key}`;
  const res = await attachLogToFunc(uploadLocalFileToQiniuOSS)({
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
  assert.strictEqual(res.name, currentFileName);
  assert.strictEqual(res.url, finalUrl);

  const downloadUrl = attachLogToFunc(getPublicDownloadUrlFromQiniuOSS)({
    bucketManager,
    key,
    baseUrl,
  });
  assert.strictEqual(downloadUrl, finalUrl);

  await assert.rejects(
    async () => {
      await attachLogToFunc(deleteRemotePathListFromQiniuOSS)({
        bucketManager,
        bucket: QINIU_BUCKET_NAME,
        remotePathList: [`${baseUrl}/${KEY_PREFIX}`],
      });
    },
    (err) => {
      if (err instanceof Error) {
        assert.strictEqual(
          err.message.startsWith("prefix should not start with http"),
          true,
        );
        return true;
      }
      return false;
    },
  );
  await assert.rejects(
    async () => {
      await attachLogToFunc(deleteRemotePathListFromQiniuOSS)({
        bucketManager,
        bucket: QINIU_BUCKET_NAME,
        remotePathList: [`/${KEY_PREFIX}`],
      });
    },
    (err: Error) => {
      assert.strictEqual(
        err.message.startsWith("prefix should not start with /"),
        true,
      );
      return true;
    },
  );

  const { successItems, failItems } = await deleteRemoteTempFiles();
  assert.strictEqual(Array.isArray(successItems), true);
  assert.strictEqual(successItems.length, 1);
  assert.strictEqual(successItems[0], key);
  assert.strictEqual(failItems.length, 0);
});

test("Upload current folder with dryRun will not actually upload files", async () => {
  const res = await uploadDirToQiniuOSS({
    config,
    mac,
    bucket: QINIU_BUCKET_NAME,
    baseUrl,
    keyPrefix: KEY_PREFIX,
    putPolicyOptions: {},
    localPath: __dirname,
    ignorePathList: [],
    refresh: false,
    recursive: true,
    dryRun: true,
    uploadCallback: (curIdx, totalCount, fileInfo) => {
      console.log(
        `[${curIdx + 1}/${totalCount}]: Uploaded ${fileInfo.name} => ${fileInfo.url}`,
      );
    },
  });
  const { allPaths, uploadedList, refreshedUrlList } = res;
  assert.strictEqual(allPaths.length > 0, true);
  assert.strictEqual(uploadedList.length, 0);
  assert.strictEqual(refreshedUrlList.length, 0);
});

test("Upload current folder and then delete it successfully", async () => {
  await deleteRemoteTempFiles();

  try {
    const res = await uploadDirToQiniuOSS({
      config,
      mac,
      bucket: QINIU_BUCKET_NAME,
      baseUrl,
      keyPrefix: KEY_PREFIX,
      putPolicyOptions: {},
      localPath: __dirname,
      ignorePathList: [],
      refresh: true,
      recursive: true,
      dryRun: false,
      uploadCallback: (curIdx, totalCount, fileInfo) => {
        console.log(
          `[${curIdx + 1}/${totalCount}]: Uploaded ${fileInfo.name} => ${fileInfo.url}`,
        );
      },
    });
    const { allPaths, uploadedList, refreshedUrlList } = res;
    assert.strictEqual(allPaths.length > 0, true);
    assert.strictEqual(uploadedList.length, allPaths.length);
    assert.strictEqual(refreshedUrlList.length, uploadedList.length);

    assert.strictEqual(
      allPaths.every((item) => {
        return (
          new RegExp(`^${KEY_PREFIX}/[a-zA-Z]+\\.mts$`).test(item.key) &&
          item.localPath.endsWith(basename(item.key))
        );
      }),
      true,
    );

    const urlPrefix = `${baseUrl}/${KEY_PREFIX}`;
    assert.strictEqual(
      uploadedList.every((uploadedItem) => {
        return (
          uploadedItem.url.startsWith(urlPrefix) &&
          uploadedItem.url === `${baseUrl}/${uploadedItem.key}` &&
          uploadedItem.fileSize > 0 &&
          uploadedItem.etag.length > 0 &&
          uploadedItem.key === `${KEY_PREFIX}/${uploadedItem.name}` &&
          uploadedItem.bucket === QINIU_BUCKET_NAME
        );
      }),
      true,
    );
    assert.strictEqual(
      refreshedUrlList.every((targetUrl) => targetUrl.startsWith(urlPrefix)),
      true,
    );
  } catch (err) {
    if (
      err instanceof Error &&
      err.message ===
        "[400034]: refresh url count limit error, 请求次数超出当日刷新限额"
    ) {
      logError(`Skip test due to reason: ${err.message}`);
      return;
    }
    throw err;
  }

  await deleteRemoteTempFiles();
});
