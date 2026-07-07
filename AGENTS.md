# AGENTS.md

## 项目简介

- nsuite 是一个 Node.js 开发工具套件，提供 Env、Path、File、Logger、Captcha、SSH、OSS（七牛/阿里云）等常用功能的封装
- 这是一个 npm 包项目，根目录有 `package.json`，使用 ESM 模块系统

## 范围

- 本仓库默认语言: JavaScript (ESM, .mjs)、TypeScript (.mts)
- 允许修改目录: `lib/`、`test/`、`build/`、`patches/`
- 禁止修改目录: `dist/`、`node_modules/`、`.git/`、`.idea/`

## 改动检查

**改动后必须执行:**

- `npm run lint` — 执行完整的检查流程（format + lint:code + lint:markdown + typecheck + test）

**检查项:**

- `npm run lint:code` — ESLint 代码检查（eslint.config.js）
- `npm run lint:markdown` — Markdown 格式检查（.markdownlint-cli2.jsonc）
- `npm run format` — Prettier 格式化（.prettierrc）
- `npm run typecheck` — TypeScript 类型检查（tsconfig.json）
- `npm run test` — 运行测试（test/index.mts）

## 交付格式

- 先给风险摘要，再给修改点，再给测试结果
- 所有文件引用都要带路径和行号
- 对于技能变更，说明变更后对用户的影响

## 项目结构

```
nsuite/
├── lib/                    # 源码目录（ESM 模块，.mjs）
│   ├── index.mjs           # 入口文件，统一导出
│   ├── UtilsEnv.mjs        # 环境变量解析
│   ├── UtilsPath.mjs       # 路径处理工具
│   ├── UtilsFile.mjs       # 文件操作（压缩、MD5、安全写入等）
│   ├── UtilsLog.mjs        # 日志工具（Winston）
│   ├── UtilsSSH.mjs        # SSH 远程操作
│   ├── UtilsPromise.mjs    # Promise 工具（超时包装）
│   ├── UtilsType.mjs       # 类型工具
│   ├── UtilsDebug.mjs      # 调试工具
│   ├── UtilsCaptcha.mjs    # SVG 验证码生成
│   ├── UtilsText.mjs       # 文本处理（OpenAI 摘要）
│   ├── UtilsModule.mjs     # 模块工具
│   ├── UtilsAliOSS.mjs     # 阿里云 OSS 操作
│   └── UtilsQiniuOSS.mjs   # 七牛 OSS 操作
├── test/                   # 测试文件（.mts）
├── build/                  # 构建脚本（文档部署等）
├── dist/                   # 类型声明输出（自动生成，禁止修改）
├── patches/                # patch-package 补丁
├── types/                  # 额外类型定义
├── package.json
├── tsconfig.json
├── eslint.config.js
├── jsdoc.json
├── .markdownlint-cli2.jsonc
└── .editorconfig
```

## 路径格式规范

- 在文档中提及文件路径时，优先使用相对路径，以保持跨设备下的通用性
- 在终端中提及文件路径时，优先使用绝对路径，以方便终端/IDE 将其识别为可点击的链接
- 使用正斜杠作为路径分隔符，路径包含空格时使用引号包裹，以确保跨平台兼容性和正确解析

## 终端命令能力识别

执行终端命令前，先读取项目根目录下的 `.terminal.local.md`，并优先使用其中记录的已验证 shell 启动入口、命令可用性和命令写法。

- 在读取 `.terminal.local.md` 前，优先使用 Agent 原生文件读取能力；若不可用，则直接使用 `node` 进程读取文件内容，不通过 shell 包装。
- 只有原生读取与 `node` 读取均不可用时，才按固定优先级执行最小 shell 读取探测；该阶段只用于判断文件是否存在并读取内容，不代表终端能力结论。
- 如果 `.terminal.local.md` 不存在、内容为空或记录与实际执行结果不一致，优先使用 `yy-detect-terminal` 技能创建或更新该文件。
- 如果 `yy-detect-terminal` 技能不可用，使用最小化本地回退规则：先确认可用 shell，再确认命令存在性判断方式，最后记录首选 shell、备用 shell、不可用 shell 和搜索命令选择。
- `.terminal.local.md` 只描述本机环境，不代表其他开发者环境；发现记录失效时应立即更新。

## 需要遵守的规则

- 执行指令前，先检查项目根目录下是否存在 `AGENTS.LOCAL.md` 文件；如果存在，读取其中的内容并**严格遵守**；该文件用于存放开发者个人偏好配置，已添加到 `.gitignore` 避免误提交
- `.editorconfig` - 编辑器配置，编写内容时需遵循
- `README.md` - 项目说明文档，了解各模块功能和导出函数

## 关键参考

- `.editorconfig` - 编辑器配置，编写内容时需遵循
- `README.md` - 项目说明文档
- `package.json` - 项目配置，包含脚本命令和依赖信息
- `tsconfig.json` - TypeScript 编译配置
- `eslint.config.js` - ESLint 代码检查规则
