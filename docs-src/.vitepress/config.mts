import { defineConfig } from "vitepress";

const englishNav = [
  { text: "Guide", link: "/guide/getting-started" },
  { text: "API Reference", link: "/api/" },
];

const chineseNav = [
  { text: "指南", link: "/zh/guide/getting-started" },
  { text: "API 参考（英文）", link: "/api/" },
];

export default defineConfig({
  title: "nsuite",
  description: "A practical Node.js development utility suite.",
  base: "/nsuite/",
  cleanUrls: true,
  outDir: "../docs",
  locales: {
    root: {
      label: "English",
      lang: "en-US",
    },
    zh: {
      label: "简体中文",
      lang: "zh-CN",
      link: "/zh/",
    },
  },
  themeConfig: {
    search: {
      provider: "local",
    },
    footer: {
      message: "Released under the Apache-2.0 License.",
      copyright: "Copyright 2026 Yakima",
    },
    locales: {
      root: {
        label: "English",
        nav: englishNav,
        sidebar: {
          "/api/": [
            {
              text: "API Reference",
              items: [
                { text: "Overview", link: "/api/" },
                { text: "SSH", link: "/api/#ssh" },
                { text: "Aliyun OSS", link: "/api/#aliyun-oss" },
                { text: "Qiniu OSS", link: "/api/#qiniu-oss" },
                { text: "Git", link: "/api/#git" },
                { text: "Network", link: "/api/#network" },
                { text: "All API Members", link: "/api/#other" },
              ],
            },
          ],
          "/guide/": [
            {
              text: "Guide",
              items: [
                { text: "Getting Started", link: "/guide/getting-started" },
                { text: "Files and Paths", link: "/guide/files-and-paths" },
                {
                  text: "Remote Services and Storage",
                  link: "/guide/remote-and-storage",
                },
              ],
            },
          ],
        },
        outlineTitle: "On this page",
        docFooter: {
          prev: "Previous page",
          next: "Next page",
        },
      },
      zh: {
        label: "简体中文",
        nav: chineseNav,
        sidebar: {
          "/zh/guide/": [
            {
              text: "使用指南",
              items: [
                { text: "快速开始", link: "/zh/guide/getting-started" },
                { text: "文件与路径", link: "/zh/guide/files-and-paths" },
                {
                  text: "远程服务与对象存储",
                  link: "/zh/guide/remote-and-storage",
                },
              ],
            },
          ],
        },
        outlineTitle: "本页内容",
        docFooter: {
          prev: "上一页",
          next: "下一页",
        },
      },
    },
  },
});
