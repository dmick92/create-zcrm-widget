import path from "path";

import { installPackages } from "~/helpers/installPackages.js";
import { scaffoldProject } from "~/helpers/scaffoldProject.js";

import {
  type PkgInstallerMap,
} from "~/installers/index.js";
import { getUserPkgManager } from "~/utils/getUserPkgManager.js";

interface CreateProjectOptions {
  projectName: string;
  packages: PkgInstallerMap;
  scopedAppName: string;
  noInstall: boolean;
  importAlias: string;
}

export const createProject = async ({
  projectName,
  scopedAppName,
  packages,
  noInstall,
}: CreateProjectOptions) => {
  const pkgManager = getUserPkgManager();
  const projectDir = path.resolve(process.cwd(), projectName);

  await scaffoldProject({
    projectName,
    projectDir,
    pkgManager,
    scopedAppName,
    noInstall,
  });

  // Install the selected packages
  installPackages({
    projectName,
    scopedAppName,
    projectDir,
    pkgManager,
    packages,
    noInstall,
  });

  return projectDir;
};
