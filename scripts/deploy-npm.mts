import { parseEnvFiles } from "#lib/UtilsEnv";
import { getDirname, resolvePath } from "#lib/UtilsPath";
import { execSync } from "child_process";

const __dirname = getDirname(import.meta.url);
const envPath = resolvePath(__dirname, "../../tech/.env");

const { parsed } = parseEnvFiles([envPath]);
if (parsed?.NPM_TOKEN) {
  process.env.NPM_TOKEN = parsed.NPM_TOKEN;
}

execSync("npm publish --registry=https://registry.npmjs.org/", {
  stdio: "inherit",
  env: process.env,
});
