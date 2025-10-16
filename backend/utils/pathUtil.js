import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Root directory (where app was started)
const rootDir = process.cwd();

export { __dirname, __filename, rootDir };
