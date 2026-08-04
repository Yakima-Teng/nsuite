/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
  entryPoints: ["./lib"],
  entryPointStrategy: "expand",
  out: "docs",
  exclude: ["node_modules"],
  readme: "./README.md",
  includeVersion: true,
  cleanOutputDir: true,
  excludePrivate: false,
  excludeProtected: false,
  excludeExternals: true,
  skipErrorChecking: true,
};

export default config;
