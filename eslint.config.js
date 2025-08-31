import globals from "globals";
import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: ["dist/", "patches/", "node_modules/", ".temp/", ".docs/"],
  },
  {
    rules: {
      "no-console": "error",
    },
  },
];
