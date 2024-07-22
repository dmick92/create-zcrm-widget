import { tailwindInstaller } from "~/installers/tailwind.js";
import { type PackageManager } from "~/utils/getUserPkgManager.js";
import { dynamicEslintInstaller } from "./eslint.js";

// Turning this into a const allows the list to be iterated over for programmatically creating prompt options
// Should increase extensibility in the future
export const availablePackages = [
  "tailwind",
  "eslint",
] as const;
export type AvailablePackages = (typeof availablePackages)[number];

export const availableFrameworks = ["react", "vue"] as const;
export type AvailableFrameworks = (typeof availableFrameworks)[number];

export interface InstallerOptions {
  projectDir: string;
  pkgManager: PackageManager;
  noInstall: boolean;
  packages?: PkgInstallerMap;
  projectName: string;
  scopedAppName: string;
  framework: AvailableFrameworks;
}

export type Installer = (opts: InstallerOptions) => void;

export type PkgInstallerMap = {
  [pkg in AvailablePackages]: {
    inUse: boolean;
    installer: Installer;
  };
};

export const buildPkgInstallerMap = (
  packages: AvailablePackages[],
): PkgInstallerMap => ({
  tailwind: {
    inUse: packages.includes("tailwind"),
    installer: tailwindInstaller,
  },
  eslint: {
    inUse: true,
    installer: dynamicEslintInstaller,
  },
});
