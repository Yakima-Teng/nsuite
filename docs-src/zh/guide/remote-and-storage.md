# 远程服务与对象存储

`nsuite` 提供面向部署工作流的工具：SSH 文件传输、远程命令、阿里云 OSS 上传和七牛 OSS 上传。

## 通过 SSH 上传构建产物

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

请将凭证存放在环境变量或密钥管理服务中，不要提交到部署脚本。

## 上传到对象存储

先用对应云厂商的工具创建 OSS 客户端，再传入上传函数。对象权限、覆盖行为、批处理和返回 URL 的细节，请查看英文 API 参考。

- [创建阿里云 OSS 客户端](/api/functions/getClientFromAliOSS)
- [创建七牛 Bucket Manager](/api/functions/getBucketManagerFromQiniuOSS)
