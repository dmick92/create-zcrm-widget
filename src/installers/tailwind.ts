import path from "path";
import fs from "fs-extra";

import { PKG_ROOT } from "~/consts.js";
import { AvailableFrameworks, type Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";

const handleFramework = (projectDir: string, framework: AvailableFrameworks) => {
  switch (framework) {
    case "react": {
      const mainFile = path.join(projectDir, "src/main.tsx");
      fs.readFile(mainFile, "utf8", (err, data) => {
        if (err) throw err;
        const newData = data.replace("import './index.css'", `import './styles/globals.css'`);
        fs.writeFileSync(mainFile, newData);
      });
      break;
    }
    case "vue": {
      const mainFile = path.join(projectDir, "src/main.ts");
      fs.readFile(mainFile, "utf8", (err, data) => {
        if (err) throw err;
        const newData = data.replace("import './assets/main.css'", `import './styles/globals.css'`);
        fs.writeFileSync(mainFile, newData);
      });

      const twCfgDest = path.join(projectDir, "tailwind.config.ts");
      fs.readFile(twCfgDest, "utf8", (err, data) => {
        if (err) throw err;
        const newData = data.replace("plugins: [],", `plugins: [],
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],`);
        fs.writeFileSync(twCfgDest, newData);
      });
      break;
    }
    default: {
      throw new Error(`Unknown framework: ${framework}`);
    }
  }
};

export const tailwindInstaller: Installer = ({ projectDir, framework }) => {
  addPackageDependency({
    projectDir,
    dependencies: [
      "tailwindcss",
      "postcss",
      "prettier",
      "prettier-plugin-tailwindcss",
    ],
    devMode: true,
  });

  const extrasDir = path.join(PKG_ROOT, "template/extras");

  const twCfgSrc = path.join(extrasDir, "config/tailwind.config.ts");
  const twCfgDest = path.join(projectDir, "tailwind.config.ts");

  const postcssCfgSrc = path.join(extrasDir, "config/postcss.config.cjs");
  const postcssCfgDest = path.join(projectDir, "postcss.config.cjs");

  const prettierSrc = path.join(extrasDir, "config/_prettier.config.js");
  const prettierDest = path.join(projectDir, "prettier.config.js");

  const cssSrc = path.join(extrasDir, "src/styles/globals.css");
  const cssDest = path.join(projectDir, "src/styles/globals.css");

  fs.copySync(twCfgSrc, twCfgDest);
  fs.copySync(postcssCfgSrc, postcssCfgDest);
  fs.copySync(cssSrc, cssDest);
  fs.copySync(prettierSrc, prettierDest);

  handleFramework(projectDir, framework);
};
