# Remote Services and Storage

`nsuite` provides helpers for deployment-oriented workflows: SSH file transfer,
remote commands, Aliyun OSS uploads, and Qiniu OSS uploads.

## Upload a build through SSH

```ts
import { getSSHClient, sshConnect, sshPutDirectory } from "nsuite";

const ssh = getSSHClient();
await sshConnect({
  ssh,
  host: "example.com",
  port: 22,
  username: "deploy",
  password: process.env.DEPLOY_PASSWORD ?? "",
});

await sshPutDirectory({
  ssh,
  fromPath: "./dist",
  toPath: "/var/www/site",
});
```

Store credentials in environment variables or a secret manager. Do not commit
them into deployment scripts.

## Upload to object storage

Create an OSS client with the provider-specific helper, then pass it to the
upload helper. The API reference documents object ACLs, overwrite behavior,
batching, and the returned URLs.

- [Create an Aliyun OSS client](/api/functions/getClientFromAliOSS)
- [Create a Qiniu bucket manager](/api/functions/getBucketManagerFromQiniuOSS)
