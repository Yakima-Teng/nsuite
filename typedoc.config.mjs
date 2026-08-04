/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
  entryPoints: ["./lib"],
  entryPointStrategy: "expand",
  out: "docs",
  exclude: ["./lib/index.mjs", "node_modules"],
  readme: "./README.md",
  groupReferencesByType: true,
  categorizeByGroup: true,
  groupOrder: ["Functions"],
  includeVersion: true,
  cleanOutputDir: true,
  excludePrivate: false,
  excludeProtected: false,
  excludeExternals: true,
  skipErrorChecking: true,
};

export default config;
