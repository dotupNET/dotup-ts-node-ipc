import pkg from "./package.json";
import { getConfig } from "../rollup.config";

export default getConfig(pkg, "dotup", "tsconfig.esnext.json");
