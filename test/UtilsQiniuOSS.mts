import qiniu from "qiniu";
import { mkdtemp, writeFile, rm, readdir, truncate } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename } from "node:path";
import assert from "node:assert/strict";
import test from "node:test";

import {
  logError,
  attachLogToFunc as rawAttachLogToFunc,
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
  logInfo,
} from "#lib/index";

const __dirname = getDirname(import.meta.url);

if (process.env.NSUITE_QINIU_LIVE_TEST === "1")
  parseEnvFiles([joinPath(__dirname, "../../tech/.env")]);

process.env.QINIU_HTTP_CLIENT_TIMEOUT = "120000";

const {
  QINIU_ACCESS_KEY = "",
  QINIU_SECRET_KEY = "",
  QINIU_BUCKET_NAME = "",
  QINIU_ZONE_NAME = "",
  QINIU_PUBLIC_BUCKET_DOMAIN = "",
} = process.env;

// this flag is turned off by default, because number of urls to refresh is limited per day, this may have influence on business usage of the oss account
const ALLOW_REFRESH: boolean = false;
// this flag is turned off by default, otherwise too many logs will be printed to terminal console
const DEBUG_LOG: boolean = false;

let attachLogToFunc = <T extends Function>(func: T): T => {
  return func;
};
if (DEBUG_LOG) {
  attachLogToFunc = rawAttachLogToFunc;
}

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

test(
  "Qiniu environment variables should be defined for testing",
  { skip: process.env.NSUITE_QINIU_LIVE_TEST !== "1" },
  () => {
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
  },
);

test(
  "Upload current file and then delete it successfully",
  { skip: process.env.NSUITE_QINIU_LIVE_TEST !== "1" },
  async () => {
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
  },
);

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
    uploadCallback: ({ err, curIdx, total, file }) => {
      if (err) {
        logError(`Failed uploadLocalFileToQiniuOSS, err: ${err.message}`);
        return;
      }
      logInfo(`[${curIdx + 1}/${total}]: Uploaded ${file.name} => ${file.url}`);
    },
  });
  const { allPaths, uploadedList, refreshedUrlList } = res;
  assert.strictEqual(allPaths.length > 0, true);
  assert.strictEqual(uploadedList.length, 0);
  assert.strictEqual(refreshedUrlList.length, 0);
});

test(
  "Upload current folder and then delete it successfully",
  { skip: process.env.NSUITE_QINIU_LIVE_TEST !== "1" },
  async () => {
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
        refresh: ALLOW_REFRESH,
        recursive: true,
        dryRun: false,
        uploadCallback: ({ err, curIdx, total, file }) => {
          if (err) {
            logError(`Failed uploadLocalFileToQiniuOSS, err: ${err.message}`);
            return;
          }
          logInfo(
            `[${curIdx + 1}/${total}]: Uploaded ${file.name} => ${file.url}`,
          );
        },
      });
      const { allPaths, uploadedList, refreshedUrlList } = res;
      assert.strictEqual(allPaths.length > 0, true);
      assert.strictEqual(uploadedList.length, allPaths.length);
      if (ALLOW_REFRESH) {
        assert.strictEqual(refreshedUrlList.length, uploadedList.length);
      }

      assert.strictEqual(
        allPaths.every((item) => {
          return (
            new RegExp(
              `^${KEY_PREFIX}/([a-zA-Z0-9_-]+/)*[a-zA-Z0-9_-]+\\.mts$`,
            ).test(item.key) && item.localPath.endsWith(basename(item.key))
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
            uploadedItem.key.startsWith(KEY_PREFIX) &&
            uploadedItem.key.endsWith(uploadedItem.name) &&
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
        ALLOW_REFRESH &&
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
  },
);

test("offline upload modes, retry, records and diagnostics", async (t) => {
  const dir = await mkdtemp(joinPath(tmpdir(), "nsuite-upload-"));
  const file = joinPath(dir, "file.zip");
  await writeFile(file, "fixture");
  const payload = {
    config,
    mac,
    bucket: "offline",
    key: "file.zip",
    localPath: file,
    baseUrl: "https://example.invalid",
  };
  let forms = 0,
    resumes = 0,
    failures = 0;
  let lastKey: string | null | undefined;
  let progress = 0;
  const response = {
    data: {
      key: payload.key,
      etag: "hash",
      fileSize: 7,
      bucket: "offline",
      name: "file.zip",
    },
    resp: { statusCode: 200, headers: {} },
  };
  t.mock.method(qiniu.form_up.FormUploader.prototype, "putFile", async () => {
    forms++;
    return response;
  });
  t.mock.method(
    qiniu.resume_up.ResumeUploader.prototype,
    "putFileV2",
    async (
      _token: string,
      _key: string,
      _path: string,
      extra: qiniu.resume_up.PutExtra,
    ) => {
      resumes++;
      lastKey = extra.resumeKey;
      extra.progressCallback?.(4, 7);
      if (failures-- > 0)
        throw Object.assign(new Error("offline reset"), { code: "ECONNRESET" });
      return response;
    },
  );
  try {
    const result = await uploadLocalFileToQiniuOSS(payload);
    assert.equal(result.url, "https://example.invalid/file.zip");
    assert.equal(forms, 1);
    await uploadLocalFileToQiniuOSS({
      ...payload,
      multipartThreshold: 7,
      resumeRecordDir: joinPath(dir, "records"),
      onProgress: () => progress++,
    });
    assert.equal(resumes, 1);
    assert(progress >= 2);
    assert.deepEqual(await readdir(joinPath(dir, "records")), []);
    const firstKey = lastKey;
    failures = 1;
    await uploadLocalFileToQiniuOSS({
      ...payload,
      uploadMode: "resume",
      partSize: 2 * 1024 ** 2,
    });
    assert.equal(resumes, 3);
    await uploadLocalFileToQiniuOSS({
      ...payload,
      uploadMode: "form",
      multipartThreshold: 1,
    });
    assert.equal(forms, 2);
    for (const invalid of [
      { partSize: 0 },
      { maxAttempts: Infinity },
      { multipartThreshold: NaN },
      { requestTimeout: -1 },
    ]) {
      await assert.rejects(
        uploadLocalFileToQiniuOSS({ ...payload, ...invalid }),
        RangeError,
      );
    }
    failures = 10;
    await assert.rejects(
      uploadLocalFileToQiniuOSS({
        ...payload,
        uploadMode: "resume",
        maxAttempts: 2,
      }),
      (error: Error & { code?: string; cause?: Error }) => {
        assert.equal(error.code, "ECONNRESET");
        assert.equal(error.cause?.message, "offline reset");
        return true;
      },
    );
    failures = 0;
    await truncate(file, 80 * 1024 ** 2);
    await uploadLocalFileToQiniuOSS({
      ...payload,
      resumeRecordDir: joinPath(dir, "records"),
    });
    assert.notEqual(lastKey, firstKey);
  } finally {
    t.mock.restoreAll();
    await rm(dir, { recursive: true, force: true });
  }
});

test("offline resume records survive failures and isolate concurrent calls", async (t) => {
  const dir = await mkdtemp(joinPath(tmpdir(), "nsuite-record-"));
  const file = joinPath(dir, "file.zip");
  const records = joinPath(dir, "records");
  await writeFile(file, "fixture");
  const payload = {
    config,
    mac,
    bucket: "offline",
    key: "file.zip",
    localPath: file,
    baseUrl: "https://example.invalid",
    uploadMode: "resume" as const,
    resumeRecordDir: records,
  };
  let calls = 0;
  let failure = true;
  let recordKey: string | null | undefined;
  t.mock.method(
    qiniu.resume_up.ResumeUploader.prototype,
    "putFileV2",
    async (
      _token: string,
      _key: string,
      _path: string,
      extra: qiniu.resume_up.PutExtra,
    ) => {
      calls++;
      recordKey = extra.resumeKey;
      await writeFile(joinPath(records, recordKey!), "offline-record");
      if (calls <= 2)
        await assert.rejects(uploadLocalFileToQiniuOSS(payload), {
          code: "EBUSY",
        });
      if (failure)
        throw Object.assign(new Error("forbidden"), {
          statusCode: 403,
          code: "AccessDenied",
          reqId: "offline-request",
        });
      return {
        resp: { statusCode: 200, headers: {} },
        data: { key: payload.key },
      };
    },
  );
  try {
    await assert.rejects(
      uploadLocalFileToQiniuOSS(payload),
      (error: Error & { statusCode?: number; reqId?: string }) => {
        assert.equal(error.statusCode, 403);
        assert.equal(error.reqId, "offline-request");
        return true;
      },
    );
    assert.equal(calls, 1);
    assert.deepEqual(await readdir(records), [recordKey]);
    const previous = recordKey;
    failure = false;
    await uploadLocalFileToQiniuOSS(payload);
    assert.equal(recordKey, previous);
    assert.deepEqual(await readdir(records), []);
    await uploadLocalFileToQiniuOSS({ ...payload, bucket: "different" });
    assert.notEqual(recordKey, previous);
  } finally {
    t.mock.restoreAll();
    await rm(dir, { recursive: true, force: true });
  }
});
