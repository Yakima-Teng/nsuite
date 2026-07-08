import { isMainModule } from "nsuite";

const result = isMainModule(import.meta.url);
process.stdout.write(result ? "true" : "false");
