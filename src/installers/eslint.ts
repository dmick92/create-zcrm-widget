import path from "path";
import fs from "fs-extra";

import { _initialConfig } from "~/../template/extras/config/_eslint.js";
import { type Installer } from "~/installers/index.js";

export const dynamicEslintInstaller: Installer = ({ projectDir, packages }) => {
  const eslintConfig = getEslintConfig();

  // Convert config from _eslint.config.json to .eslintrc.cjs
  const eslintrcFileContents = [
    '/** @type {import("eslint").Linter.Config} */',
    `const config = ${JSON.stringify(eslintConfig, null, 2)}`,
    "module.exports = config;",
  ].join("\n");

  const eslintConfigDest = path.join(projectDir, ".eslintrc.cjs");
  fs.writeFileSync(eslintConfigDest, eslintrcFileContents, "utf-8");
};

const getEslintConfig = () => {
  const eslintConfig = _initialConfig;

  return eslintConfig;
};
